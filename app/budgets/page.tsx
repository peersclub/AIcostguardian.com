'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, TrendingUp, AlertTriangle, Plus, Edit2, Trash2, 
  Calendar, Target, Activity, Bell, ChevronRight 
} from 'lucide-react'
import { format } from 'date-fns'

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  usage: number
  percentage: number
  remaining: number
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  startDate: string
  endDate?: string
  isActive: boolean
  alertThreshold: number
  isOverBudget: boolean
  alertTriggered: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
}

export default function BudgetManagement() {
  const { data: session } = useSession()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    period: 'MONTHLY' as Budget['period'],
    alertThreshold: 0.8
  })

  useEffect(() => {
    if (session?.user) {
      fetchBudgets()
    }
  }, [session])

  const fetchBudgets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/budgets')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBudget = async () => {
    try {
      // Get organization ID from user session or current organization
      const userResponse = await fetch('/api/user/profile')
      const userData = await userResponse.json()
      
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          organizationId: userData.organizationId
        })
      })

      if (response.ok) {
        await fetchBudgets()
        setShowCreateModal(false)
        setFormData({
          name: '',
          amount: '',
          period: 'MONTHLY',
          alertThreshold: 0.8
        })
      }
    } catch (error) {
      console.error('Failed to create budget:', error)
    }
  }

  const handleUpdateBudget = async (budgetId: string, updates: any) => {
    try {
      const response = await fetch(`/api/budgets?id=${budgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        await fetchBudgets()
        setEditingBudget(null)
      }
    } catch (error) {
      console.error('Failed to update budget:', error)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    try {
      const response = await fetch(`/api/budgets?id=${budgetId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchBudgets()
      }
    } catch (error) {
      console.error('Failed to delete budget:', error)
    }
  }

  const getStatusColor = (percentage: number, alertThreshold: number) => {
    if (percentage >= 100) return 'text-red-500'
    if (percentage >= alertThreshold * 100) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getProgressColor = (percentage: number, alertThreshold: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= alertThreshold * 100) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'DAILY':
        return '📅'
      case 'WEEKLY':
        return '📆'
      case 'MONTHLY':
        return '🗓️'
      case 'QUARTERLY':
        return '📊'
      case 'YEARLY':
        return '📈'
      default:
        return '📅'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Budget Management
          </h1>
          <p className="text-gray-400 mt-2">Monitor and control your AI spending</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-400">Total Budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${budgets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-400">Total Spent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              ${budgets.reduce((sum, b) => sum + b.usage, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-400">Remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              ${budgets.reduce((sum, b) => sum + b.remaining, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-400">Active Alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {budgets.filter(b => b.alertTriggered).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <Card key={budget.id} className="bg-gray-900 border-gray-800 hover:border-purple-600 transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    {getPeriodIcon(budget.period)}
                    {budget.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    {budget.period} Budget
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {budget.alertTriggered && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Alert
                    </Badge>
                  )}
                  {budget.isOverBudget && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500">
                      Over
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Usage</span>
                  <span className={getStatusColor(budget.percentage, budget.alertThreshold)}>
                    {budget.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(budget.percentage, 100)} 
                  className="h-2 bg-gray-800"
                  indicatorClassName={getProgressColor(budget.percentage, budget.alertThreshold)}
                />
              </div>

              {/* Amount Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Spent</p>
                  <p className="text-white font-semibold">${budget.usage.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Limit</p>
                  <p className="text-white font-semibold">${budget.amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Period Info */}
              <div className="text-sm">
                <p className="text-gray-400">Period</p>
                <p className="text-white">
                  {format(new Date(budget.startDate), 'MMM d')}
                  {budget.endDate && ` - ${format(new Date(budget.endDate), 'MMM d')}`}
                </p>
              </div>

              {/* Alert Threshold */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  Alert at
                </span>
                <span className="text-white">{(budget.alertThreshold * 100).toFixed(0)}%</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingBudget(budget)}
                  className="flex-1"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteBudget(budget.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {budgets.length === 0 && (
          <Card className="bg-gray-900 border-gray-800 col-span-full">
            <CardContent className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No budgets yet</h3>
              <p className="text-gray-400 mb-6">Create your first budget to start tracking spending</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Budget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingBudget) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
              <CardDescription>Set spending limits and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Budget Name</label>
                <Input
                  value={editingBudget?.name || formData.name}
                  onChange={(e) => {
                    if (editingBudget) {
                      setEditingBudget({ ...editingBudget, name: e.target.value })
                    } else {
                      setFormData({ ...formData, name: e.target.value })
                    }
                  }}
                  placeholder="e.g., Monthly AI Budget"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Amount ($)</label>
                <Input
                  type="number"
                  value={editingBudget?.amount || formData.amount}
                  onChange={(e) => {
                    if (editingBudget) {
                      setEditingBudget({ ...editingBudget, amount: parseFloat(e.target.value) })
                    } else {
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  }}
                  placeholder="1000"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Period</label>
                <select
                  value={editingBudget?.period || formData.period}
                  onChange={(e) => {
                    if (editingBudget) {
                      setEditingBudget({ ...editingBudget, period: e.target.value as Budget['period'] })
                    } else {
                      setFormData({ ...formData, period: e.target.value as Budget['period'] })
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400">Alert Threshold (%)</label>
                <select
                  value={(editingBudget?.alertThreshold || formData.alertThreshold) * 100}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) / 100
                    if (editingBudget) {
                      setEditingBudget({ ...editingBudget, alertThreshold: value })
                    } else {
                      setFormData({ ...formData, alertThreshold: value })
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="50">50%</option>
                  <option value="60">60%</option>
                  <option value="70">70%</option>
                  <option value="80">80%</option>
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingBudget(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingBudget) {
                      handleUpdateBudget(editingBudget.id, editingBudget)
                    } else {
                      handleCreateBudget()
                    }
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {editingBudget ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}