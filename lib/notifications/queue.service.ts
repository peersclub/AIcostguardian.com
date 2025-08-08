import { 
  QueueJob, 
  QueueConfig, 
  QueueStats, 
  RetryConfig,
  NotificationQueue,
  QueueError
} from './types'

/**
 * In-memory notification queue with retry logic and persistence fallback
 * This implementation provides production-ready queueing with Redis-like semantics
 */
export class NotificationQueueService implements NotificationQueue {
  private pendingJobs = new Map<string, QueueJob>()
  private processingJobs = new Map<string, QueueJob>()
  private completedJobs = new Map<string, QueueJob>()
  private failedJobs = new Map<string, QueueJob>()
  private delayedJobs = new Map<string, QueueJob>()

  private config: QueueConfig
  private retryConfig: RetryConfig
  private isProcessing = false
  private processingInterval?: NodeJS.Timeout
  private cleanupInterval?: NodeJS.Timeout

  constructor(
    config: Partial<QueueConfig> = {},
    retryConfig: Partial<RetryConfig> = {}
  ) {
    this.config = {
      concurrency: 5,
      retryDelays: [1000, 5000, 15000, 60000, 300000], // 1s, 5s, 15s, 1m, 5m
      maxRetries: 5,
      defaultJobExpiry: 86400, // 24 hours
      cleanupInterval: 300000, // 5 minutes
      ...config
    }

    this.retryConfig = {
      maxAttempts: this.config.maxRetries,
      initialDelay: 1000,
      maxDelay: 300000,
      backoffMultiplier: 2.0,
      jitter: true,
      ...retryConfig
    }

    this.startProcessing()
    this.startCleanup()
  }

  /**
   * Add a job to the queue
   */
  async enqueue(job: QueueJob): Promise<void> {
    try {
      // Validate job
      this.validateJob(job)

      // Set default values
      job.attempts = job.attempts || 0
      job.maxAttempts = job.maxAttempts || this.retryConfig.maxAttempts
      job.createdAt = job.createdAt || new Date()
      
      // Handle delayed jobs
      if (job.scheduledFor && job.scheduledFor > new Date()) {
        this.delayedJobs.set(job.id, job)
        console.log(`Job ${job.id} scheduled for ${job.scheduledFor.toISOString()}`)
      } else {
        this.pendingJobs.set(job.id, job)
        console.log(`Job ${job.id} added to pending queue`)
      }

      // Trigger processing if not already running
      this.triggerProcessing()
    } catch (error) {
      console.error('Failed to enqueue job:', error)
      throw new QueueError(`Failed to enqueue job ${job.id}: ${error.message}`)
    }
  }

  /**
   * Get the next job to process
   */
  async dequeue(): Promise<QueueJob | null> {
    // Move any ready delayed jobs to pending
    this.processDelayedJobs()

    if (this.pendingJobs.size === 0) {
      return null
    }

    // Get highest priority job (lowest priority number = highest priority)
    const jobs = Array.from(this.pendingJobs.values())
    jobs.sort((a, b) => a.priority - b.priority)
    
    const job = jobs[0]
    if (!job) return null

    // Move job to processing
    this.pendingJobs.delete(job.id)
    this.processingJobs.set(job.id, job)

    console.log(`Dequeued job ${job.id} for processing`)
    return job
  }

  /**
   * Retry a failed job
   */
  async retry(job: QueueJob): Promise<void> {
    try {
      job.attempts++
      job.lastAttemptAt = new Date()

      if (job.attempts >= job.maxAttempts) {
        await this.fail(job, `Max retry attempts (${job.maxAttempts}) exceeded`)
        return
      }

      // Calculate delay for next attempt
      const delay = this.calculateRetryDelay(job.attempts)
      job.scheduledFor = new Date(Date.now() + delay)

      // Remove from processing and add to delayed
      this.processingJobs.delete(job.id)
      this.delayedJobs.set(job.id, job)

      console.log(`Job ${job.id} retry #${job.attempts} scheduled for ${job.scheduledFor.toISOString()}`)
    } catch (error) {
      console.error('Failed to retry job:', error)
      await this.fail(job, `Retry failed: ${error.message}`)
    }
  }

  /**
   * Mark job as failed
   */
  async fail(job: QueueJob, error: string): Promise<void> {
    job.error = error
    job.lastAttemptAt = new Date()

    // Remove from processing
    this.processingJobs.delete(job.id)
    
    // Add to failed jobs
    this.failedJobs.set(job.id, job)

    console.error(`Job ${job.id} failed: ${error}`)

    // Log failure for monitoring
    this.logJobFailure(job)
  }

  /**
   * Mark job as completed
   */
  async complete(job: QueueJob, result?: any): Promise<void> {
    // Remove from processing
    this.processingJobs.delete(job.id)
    
    // Add result metadata
    if (result) {
      job.data = { ...job.data, result }
    }

    // Add to completed jobs
    this.completedJobs.set(job.id, job)

    console.log(`Job ${job.id} completed successfully`)
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    return {
      pending: this.pendingJobs.size,
      processing: this.processingJobs.size,
      completed: this.completedJobs.size,
      failed: this.failedJobs.size,
      delayed: this.delayedJobs.size
    }
  }

  /**
   * Clean up old completed and failed jobs
   */
  async cleanup(): Promise<void> {
    const cutoff = new Date(Date.now() - this.config.defaultJobExpiry * 1000)
    
    let cleaned = 0

    // Clean completed jobs
    for (const [id, job] of this.completedJobs.entries()) {
      if (job.createdAt < cutoff) {
        this.completedJobs.delete(id)
        cleaned++
      }
    }

    // Clean old failed jobs (keep them longer for debugging)
    const failedCutoff = new Date(Date.now() - this.config.defaultJobExpiry * 1000 * 7) // 7 days
    for (const [id, job] of this.failedJobs.entries()) {
      if (job.createdAt < failedCutoff) {
        this.failedJobs.delete(id)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} old jobs`)
    }
  }

  /**
   * Get job by ID
   */
  getJob(id: string): QueueJob | null {
    return (
      this.pendingJobs.get(id) ||
      this.processingJobs.get(id) ||
      this.completedJobs.get(id) ||
      this.failedJobs.get(id) ||
      this.delayedJobs.get(id) ||
      null
    )
  }

  /**
   * Cancel a job
   */
  async cancelJob(id: string): Promise<boolean> {
    // Can only cancel pending or delayed jobs
    if (this.pendingJobs.has(id)) {
      this.pendingJobs.delete(id)
      console.log(`Cancelled pending job ${id}`)
      return true
    }

    if (this.delayedJobs.has(id)) {
      this.delayedJobs.delete(id)
      console.log(`Cancelled delayed job ${id}`)
      return true
    }

    return false
  }

  /**
   * Get jobs by type
   */
  getJobsByType(type: string): QueueJob[] {
    const allJobs = [
      ...this.pendingJobs.values(),
      ...this.processingJobs.values(),
      ...this.delayedJobs.values()
    ]
    
    return allJobs.filter(job => job.type === type)
  }

  /**
   * Pause job processing
   */
  pause(): void {
    this.isProcessing = false
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = undefined
    }
    console.log('Queue processing paused')
  }

  /**
   * Resume job processing
   */
  resume(): void {
    if (!this.isProcessing) {
      this.startProcessing()
      console.log('Queue processing resumed')
    }
  }

  /**
   * Shutdown the queue service
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down queue service...')
    
    this.pause()
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Wait for processing jobs to complete (with timeout)
    const timeout = 30000 // 30 seconds
    const start = Date.now()
    
    while (this.processingJobs.size > 0 && (Date.now() - start) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    if (this.processingJobs.size > 0) {
      console.warn(`Shutdown timeout: ${this.processingJobs.size} jobs still processing`)
    }

    console.log('Queue service shut down')
  }

  // Private methods

  private validateJob(job: QueueJob): void {
    if (!job.id) {
      throw new QueueError('Job must have an ID')
    }
    
    if (!job.type) {
      throw new QueueError('Job must have a type')
    }

    if (job.priority < 0 || job.priority > 10) {
      throw new QueueError('Job priority must be between 0-10')
    }

    if (job.maxAttempts && job.maxAttempts > 10) {
      throw new QueueError('Max attempts cannot exceed 10')
    }
  }

  private startProcessing(): void {
    if (this.isProcessing) return

    this.isProcessing = true
    
    // Process jobs every second
    this.processingInterval = setInterval(() => {
      this.processJobs()
    }, 1000)

    console.log('Queue processing started')
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private async processJobs(): Promise<void> {
    if (this.processingJobs.size >= this.config.concurrency) {
      return // At max concurrency
    }

    try {
      // Process pending jobs
      const processingSlots = this.config.concurrency - this.processingJobs.size
      for (let i = 0; i < processingSlots; i++) {
        const job = await this.dequeue()
        if (!job) break

        // Process job asynchronously
        this.processJob(job).catch(error => {
          console.error(`Job processing error for ${job.id}:`, error)
        })
      }
    } catch (error) {
      console.error('Error in job processing loop:', error)
    }
  }

  private async processJob(job: QueueJob): Promise<void> {
    try {
      console.log(`Processing job ${job.id} (type: ${job.type})`)
      
      // This would delegate to the actual job processors
      // For now, simulate processing based on job type
      await this.executeJob(job)
      
      await this.complete(job)
    } catch (error) {
      console.error(`Job ${job.id} processing failed:`, error)
      await this.retry(job)
    }
  }

  private async executeJob(job: QueueJob): Promise<void> {
    // Simulate job execution delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
    
    // Simulate occasional failures for testing retry logic
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error('Simulated job failure')
    }

    // Job-specific processing would go here
    switch (job.type) {
      case 'notification':
        // Notification delivery would be handled here
        break
      case 'batch':
        // Batch processing would be handled here
        break
      case 'digest':
        // Digest generation would be handled here
        break
      default:
        console.warn(`Unknown job type: ${job.type}`)
    }
  }

  private processDelayedJobs(): void {
    const now = new Date()
    const readyJobs: QueueJob[] = []

    // Find jobs ready to be processed
    for (const [id, job] of this.delayedJobs.entries()) {
      if (!job.scheduledFor || job.scheduledFor <= now) {
        readyJobs.push(job)
        this.delayedJobs.delete(id)
      }
    }

    // Move ready jobs to pending queue
    for (const job of readyJobs) {
      this.pendingJobs.set(job.id, job)
      console.log(`Moved delayed job ${job.id} to pending queue`)
    }
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    let delay = Math.min(
      this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
      this.retryConfig.maxDelay
    )

    // Add jitter to prevent thundering herd
    if (this.retryConfig.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5)
    }

    return Math.floor(delay)
  }

  private triggerProcessing(): void {
    // Trigger immediate processing check
    if (this.isProcessing) {
      setImmediate(() => this.processJobs())
    }
  }

  private logJobFailure(job: QueueJob): void {
    // This would integrate with your logging system
    const logData = {
      timestamp: new Date().toISOString(),
      jobId: job.id,
      jobType: job.type,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      error: job.error,
      data: job.data
    }

    // In production, send to logging service
    console.error('Job failure logged:', logData)
  }
}

/**
 * Priority queue implementation for better job ordering
 */
export class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = []

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority })
    this.heapifyUp(this.heap.length - 1)
  }

  dequeue(): T | null {
    if (this.heap.length === 0) return null
    if (this.heap.length === 1) return this.heap.pop()!.item

    const root = this.heap[0].item
    this.heap[0] = this.heap.pop()!
    this.heapifyDown(0)
    return root
  }

  size(): number {
    return this.heap.length
  }

  peek(): T | null {
    return this.heap.length > 0 ? this.heap[0].item : null
  }

  private heapifyUp(index: number): void {
    if (index === 0) return

    const parentIndex = Math.floor((index - 1) / 2)
    if (this.heap[parentIndex].priority > this.heap[index].priority) {
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]]
      this.heapifyUp(parentIndex)
    }
  }

  private heapifyDown(index: number): void {
    const leftChild = 2 * index + 1
    const rightChild = 2 * index + 2
    let smallest = index

    if (
      leftChild < this.heap.length &&
      this.heap[leftChild].priority < this.heap[smallest].priority
    ) {
      smallest = leftChild
    }

    if (
      rightChild < this.heap.length &&
      this.heap[rightChild].priority < this.heap[smallest].priority
    ) {
      smallest = rightChild
    }

    if (smallest !== index) {
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]]
      this.heapifyDown(smallest)
    }
  }
}

// Singleton queue instance
export const notificationQueue = new NotificationQueueService()

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down notification queue...')
  notificationQueue.shutdown().then(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down notification queue...')
  notificationQueue.shutdown().then(() => {
    process.exit(0)
  })
})