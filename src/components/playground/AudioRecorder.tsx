'use client'
import { useRef } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'

interface Props {
  onTranscribed: (text: string) => void
}

function MicIcon({ size = 28, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke={color} strokeWidth="1.5"/>
      <path d="M5 10v2a7 7 0 0 0 14 0v-2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 19v3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 22h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function AudioRecorder({ onTranscribed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isRecording, isTranscribing, start, stop } = useAudioRecorder(onTranscribed, canvasRef)

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-5)',
      padding: 'var(--space-8)',
      background: 'rgba(255,255,255,0.015)',
      border: isRecording ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
      borderRadius: 0,
      transition: 'border-color var(--dur-base)',
      animation: isRecording ? 'borderPulse 2s ease-in-out infinite' : 'none',
      position: 'relative',
    }}>
      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        width={280}
        height={52}
        style={{
          display: isRecording ? 'block' : 'none',
          borderRadius: 'var(--radius-sm)',
        }}
      />

      {/* Idle state */}
      {!isRecording && !isTranscribing && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MicIcon size={26} color="var(--text-secondary)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
              Voice Input
            </p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
              Click to record — transcribes automatically
            </p>
          </div>
        </div>
      )}

      {/* Transcribing state */}
      {isTranscribing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '48px', height: '48px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.06)',
            borderTop: '2px solid var(--accent)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Transcribing…</span>
        </div>
      )}

      {/* Record button */}
      <button
        onClick={isRecording ? stop : start}
        disabled={isTranscribing}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '9px 20px',
          borderRadius: 'var(--radius-pill)',
          background: isRecording ? 'var(--color-error-dim)' : 'rgba(255,255,255,0.06)',
          border: isRecording ? '1px solid rgba(255,59,48,0.4)' : '1px solid rgba(255,255,255,0.12)',
          color: isRecording ? 'var(--color-error)' : 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: 'var(--font-ui), sans-serif',
          cursor: isTranscribing ? 'not-allowed' : 'pointer',
          opacity: isTranscribing ? 0.5 : 1,
          transition: 'all var(--dur-base)',
        }}
      >
        <span style={{
          display: 'inline-block',
          width: '7px', height: '7px',
          borderRadius: isRecording ? '2px' : '50%',
          background: isRecording ? 'var(--color-error)' : 'var(--color-live)',
          animation: isRecording ? 'pulse 1.4s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }} />
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  )
}
