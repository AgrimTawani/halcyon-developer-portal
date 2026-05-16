'use client'
import { useRef, useState, useCallback, useEffect } from 'react'

export function useAudioRecorder(
  onTranscribed: (text: string) => void,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const [isRecording, setIsRecording]       = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const recorderRef  = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])
  const analyserRef  = useRef<AnalyserNode | null>(null)
  const animRef      = useRef<number>(0)
  const audioCtxRef  = useRef<AudioContext | null>(null)

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    const ctx2d = canvas.getContext('2d')!
    const data = new Uint8Array(analyser.frequencyBinCount)
    const draw = () => {
      analyser.getByteFrequencyData(data)
      ctx2d.clearRect(0, 0, canvas.width, canvas.height)
      const bw = (canvas.width / data.length) * 2.5
      let x = 0
      data.forEach(v => {
        const a = v / 255
        ctx2d.fillStyle = `rgba(0,212,255,${0.25 + a * 0.75})`
        ctx2d.fillRect(x, canvas.height - a * canvas.height, Math.max(bw - 2, 1), a * canvas.height)
        x += bw
      })
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
  }, [canvasRef])

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioCtxRef.current = new AudioContext()
      const src = audioCtxRef.current.createMediaStreamSource(stream)
      const analyser = audioCtxRef.current.createAnalyser()
      analyser.fftSize = 64
      src.connect(analyser)
      analyserRef.current = analyser

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm'
      recorderRef.current = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []

      recorderRef.current.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorderRef.current.onstop = async () => {
        cancelAnimationFrame(animRef.current)
        stream.getTracks().forEach(t => t.stop())
        audioCtxRef.current?.close()
        setIsTranscribing(true)
        const blob = new Blob(chunksRef.current, { type: mime })
        const fd = new FormData()
        fd.append('audio', blob, 'recording.webm')
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
          const { text } = await res.json()
          onTranscribed(text)
        } finally { setIsTranscribing(false) }
      }

      recorderRef.current.start()
      setIsRecording(true)
      drawWaveform()
    } catch (e) { console.error('Mic denied:', e) }
  }, [onTranscribed, drawWaveform])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
    setIsRecording(false)
  }, [])

  useEffect(() => () => cancelAnimationFrame(animRef.current), [])

  return { isRecording, isTranscribing, start, stop }
}
