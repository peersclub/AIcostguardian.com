'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  X,
  Loader2,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAIProviderLogo } from '@/components/ui/ai-logos';

interface VoiceInputProps {
  isActive: boolean;
  onToggle: () => void;
  onTranscript: (text: string) => void;
  provider?: string;
}

export function VoiceInput({
  isActive,
  onToggle,
  onTranscript,
  provider = 'openai',
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const providerLogo = getAIProviderLogo(provider);

  useEffect(() => {
    if (isActive) {
      startRecording();
    } else {
      stopRecording();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  // Update duration timer
  useEffect(() => {
    if (isRecording && startTimeRef.current) {
      const interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current!) / 1000));
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Start visualization
      visualize();
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        setIsProcessing(false);
      };
      
      mediaRecorderRef.current.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
      onToggle();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setAudioLevel(0);
  };

  const visualize = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average audio level
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);
    
    animationFrameRef.current = requestAnimationFrame(visualize);
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Here you would send the audio to your transcription API
      // For demo, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated transcript
      const transcript = "This is a simulated transcript of the recorded audio.";
      onTranscript(transcript);
    } catch (err) {
      setError('Failed to process audio. Please try again.');
      console.error('Processing error:', err);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="relative w-96 p-8 space-y-6">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onToggle}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Title */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Voice Input</h3>
          <p className="text-sm text-muted-foreground">
            {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
          </p>
        </div>

        {/* Main visualization */}
        <div className="relative flex items-center justify-center h-48">
          {/* Provider logo in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            {providerLogo && (
              <div className={cn(
                "transition-all duration-300",
                isRecording && "scale-110"
              )}>
                {providerLogo}
              </div>
            )}
          </div>

          {/* Audio visualization rings */}
          <div className="relative">
            {/* Outer ring */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-150",
                isRecording && "animate-ping"
              )}
              style={{
                width: `${120 + audioLevel * 100}px`,
                height: `${120 + audioLevel * 100}px`,
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
                background: `radial-gradient(circle, transparent, rgba(139, 92, 246, ${audioLevel * 0.3}))`,
              }}
            />
            
            {/* Middle ring */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-100",
                isRecording && "animate-pulse"
              )}
              style={{
                width: `${80 + audioLevel * 60}px`,
                height: `${80 + audioLevel * 60}px`,
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
                background: `radial-gradient(circle, transparent, rgba(139, 92, 246, ${audioLevel * 0.5}))`,
              }}
            />
            
            {/* Inner circle - mic button */}
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              className={cn(
                "relative h-16 w-16 rounded-full transition-all duration-300",
                isRecording && "scale-110",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
              onClick={onToggle}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>

          {/* Audio level bars */}
          {isRecording && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, audioLevel * 100 * (1 - i * 0.15))}px`,
                    opacity: audioLevel > i * 0.2 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status info */}
        <div className="space-y-3">
          {/* Duration */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono">{formatDuration(duration)}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Instructions */}
          <p className="text-xs text-center text-muted-foreground">
            {isRecording 
              ? "Click the microphone or press ESC to stop recording"
              : isProcessing
              ? "Transcribing your voice..."
              : "Click the microphone to start recording"
            }
          </p>
        </div>

        {/* Action buttons */}
        {!isRecording && !isProcessing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onToggle}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => startRecording()}
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}