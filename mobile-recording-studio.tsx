'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Mic, MicOff, Play, Pause, Square, Circle, Download,
  Headphones, Volume2, Layers, Sliders, Music, Save,
  RotateCcw, Trash2, Share2, Settings, Upload, Zap,
  Timer, Radio, Activity, FileAudio, Waveform, Filter
} from 'lucide-react'

interface Track {
  id: string
  name: string
  buffer: AudioBuffer
  waveform: Float32Array
  gain: number
  muted: boolean
  solo: boolean
  effects: {
    reverb: number
    delay: number
    compression: number
    eq: {
      low: number
      mid: number
      high: number
    }
  }
}

interface Recording {
  id: string
  name: string
  duration: number
  timestamp: string
  size: number
  blob: Blob
}

export default function MobileRecordingStudio() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [inputLevel, setInputLevel] = useState(0)
  const [monitoringEnabled, setMonitoringEnabled] = useState(false)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [countIn, setCountIn] = useState(false)
  
  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animationRef = useRef<number | null>(null)
  
  // Effects nodes
  const reverbRef = useRef<ConvolverNode | null>(null)
  const delayRef = useRef<DelayNode | null>(null)
  const compressorRef = useRef<DynamicsCompressorNode | null>(null)
  const eqLowRef = useRef<BiquadFilterNode | null>(null)
  const eqMidRef = useRef<BiquadFilterNode | null>(null)
  const eqHighRef = useRef<BiquadFilterNode | null>(null)

  useEffect(() => {
    initializeAudio()
    loadSavedRecordings()
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const initializeAudio = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Initialize effects
      await initializeEffects()
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      })
      streamRef.current = stream
      
      // Set up analyser for input level monitoring
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      // Start monitoring input level
      monitorInputLevel()
    } catch (error) {
      console.error('Error initializing audio:', error)
    }
  }

  const initializeEffects = async () => {
    if (!audioContextRef.current) return
    
    // Reverb
    reverbRef.current = audioContextRef.current.createConvolver()
    const reverbBuffer = await createReverbImpulse(2, 2, false)
    reverbRef.current.buffer = reverbBuffer
    
    // Delay
    delayRef.current = audioContextRef.current.createDelay(1)
    delayRef.current.delayTime.value = 0.3
    
    // Compressor
    compressorRef.current = audioContextRef.current.createDynamicsCompressor()
    compressorRef.current.threshold.value = -24
    compressorRef.current.knee.value = 30
    compressorRef.current.ratio.value = 12
    compressorRef.current.attack.value = 0.003
    compressorRef.current.release.value = 0.25
    
    // EQ
    eqLowRef.current = audioContextRef.current.createBiquadFilter()
    eqLowRef.current.type = 'lowshelf'
    eqLowRef.current.frequency.value = 320
    
    eqMidRef.current = audioContextRef.current.createBiquadFilter()
    eqMidRef.current.type = 'peaking'
    eqMidRef.current.frequency.value = 1000
    eqMidRef.current.Q.value = 0.5
    
    eqHighRef.current = audioContextRef.current.createBiquadFilter()
    eqHighRef.current.type = 'highshelf'
    eqHighRef.current.frequency.value = 3200
  }

  const createReverbImpulse = (duration: number, decay: number, reverse: boolean) => {
    const sampleRate = audioContextRef.current!.sampleRate
    const length = sampleRate * duration
    const impulse = audioContextRef.current!.createBuffer(2, length, sampleRate)
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - (reverse ? i : length - i) / length, decay)
      }
    }
    
    return impulse
  }

  const monitorInputLevel = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const checkLevel = () => {
      analyserRef.current!.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setInputLevel(average / 255)
      
      animationRef.current = requestAnimationFrame(checkLevel)
    }
    
    checkLevel()
  }

  const startRecording = async () => {
    if (!streamRef.current || !audioContextRef.current) return
    
    chunksRef.current = []
    
    // Create media recorder with effects chain
    const dest = audioContextRef.current.createMediaStreamDestination()
    const source = audioContextRef.current.createMediaStreamSource(streamRef.current)
    
    // Connect effects chain
    source
      .connect(eqLowRef.current!)
      .connect(eqMidRef.current!)
      .connect(eqHighRef.current!)
      .connect(compressorRef.current!)
      .connect(dest)
    
    mediaRecorderRef.current = new MediaRecorder(dest.stream, {
      mimeType: 'audio/webm;codecs=opus'
    })
    
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }
    
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      saveRecording(blob)
    }
    
    // Start metronome if enabled
    if (metronomeEnabled) {
      startMetronome()
    }
    
    // Count in if enabled
    if (countIn) {
      await performCountIn()
    }
    
    mediaRecorderRef.current.start()
    setIsRecording(true)
    startTimer()
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      stopTimer()
      stopMetronome()
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const saveRecording = async (blob: Blob) => {
    const recording: Recording = {
      id: Date.now().toString(),
      name: `Recording ${recordings.length + 1}`,
      duration: recordingTime,
      timestamp: new Date().toISOString(),
      size: blob.size,
      blob
    }
    
    setRecordings([...recordings, recording])
    
    // Save to IndexedDB
    await saveToIndexedDB(recording)
    
    // Convert to track
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer)
    
    const track: Track = {
      id: recording.id,
      name: recording.name,
      buffer: audioBuffer,
      waveform: extractWaveform(audioBuffer),
      gain: 1,
      muted: false,
      solo: false,
      effects: {
        reverb: 0,
        delay: 0,
        compression: 0.5,
        eq: { low: 0, mid: 0, high: 0 }
      }
    }
    
    setTracks([...tracks, track])
    setRecordingTime(0)
  }

  const loadSavedRecordings = async () => {
    // Load from IndexedDB
    const db = await openDB()
    const transaction = db.transaction(['recordings'], 'readonly')
    const store = transaction.objectStore('recordings')
    const allRecordings = await store.getAll()
    
    setRecordings(allRecordings)
  }

  const saveToIndexedDB = async (recording: Recording) => {
    const db = await openDB()
    const transaction = db.transaction(['recordings'], 'readwrite')
    const store = transaction.objectStore('recordings')
    await store.put(recording)
  }

  const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('NotALabelRecordings', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('recordings')) {
          db.createObjectStore('recordings', { keyPath: 'id' })
        }
      }
    })
  }

  const extractWaveform = (buffer: AudioBuffer): Float32Array => {
    const length = 200 // Number of points in waveform visualization
    const blockSize = Math.floor(buffer.length / length)
    const waveform = new Float32Array(length)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < length; i++) {
      const start = blockSize * i
      let sum = 0
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(data[start + j])
      }
      waveform[i] = sum / blockSize
    }
    
    return waveform
  }

  const startTimer = () => {
    const startTime = Date.now() - recordingTime * 1000
    
    const updateTimer = () => {
      setRecordingTime(Math.floor((Date.now() - startTime) / 1000))
      if (isRecording && !isPaused) {
        requestAnimationFrame(updateTimer)
      }
    }
    
    updateTimer()
  }

  const stopTimer = () => {
    // Timer stops automatically when recording stops
  }

  const startMetronome = () => {
    if (!audioContextRef.current) return
    
    const interval = 60 / bpm
    let nextTime = audioContextRef.current.currentTime
    
    const scheduleClick = () => {
      const osc = audioContextRef.current!.createOscillator()
      const gain = audioContextRef.current!.createGain()
      
      osc.connect(gain)
      gain.connect(audioContextRef.current!.destination)
      
      gain.gain.setValueAtTime(0.1, nextTime)
      gain.gain.exponentialRampToValueAtTime(0.01, nextTime + 0.05)
      
      osc.frequency.value = 1000
      osc.start(nextTime)
      osc.stop(nextTime + 0.05)
      
      nextTime += interval
      
      if (isRecording) {
        setTimeout(scheduleClick, (interval - 0.1) * 1000)
      }
    }
    
    scheduleClick()
  }

  const stopMetronome = () => {
    // Metronome stops automatically when recording stops
  }

  const performCountIn = () => {
    return new Promise<void>((resolve) => {
      let count = 4
      const countInterval = setInterval(() => {
        console.log(count)
        count--
        if (count === 0) {
          clearInterval(countInterval)
          resolve()
        }
      }, 60000 / bpm)
    })
  }

  const exportRecording = async (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recording.name}.webm`
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteRecording = async (id: string) => {
    setRecordings(recordings.filter(r => r.id !== id))
    setTracks(tracks.filter(t => t.id !== id))
    
    // Delete from IndexedDB
    const db = await openDB()
    const transaction = db.transaction(['recordings'], 'readwrite')
    const store = transaction.objectStore('recordings')
    await store.delete(id)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mobile Studio</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-700 rounded-lg">
                <Settings size={20} />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gray-800 rounded-xl p-6">
          {/* Input Level Meter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Input Level</span>
              <button
                onClick={() => setMonitoringEnabled(!monitoringEnabled)}
                className={`p-1 rounded ${monitoringEnabled ? 'text-purple-400' : 'text-gray-500'}`}
              >
                <Headphones size={16} />
              </button>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  inputLevel > 0.8 ? 'bg-red-500' : inputLevel > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${inputLevel * 100}%` }}
              />
            </div>
          </div>

          {/* Main Recording Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-6 rounded-full ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isRecording ? <Square size={32} /> : <Circle size={32} />}
            </button>
            
            {isRecording && (
              <button
                onClick={pauseRecording}
                className="p-4 bg-gray-700 rounded-full hover:bg-gray-600"
              >
                {isPaused ? <Play size={24} /> : <Pause size={24} />}
              </button>
            )}
          </div>

          {/* Recording Timer */}
          {(isRecording || recordingTime > 0) && (
            <div className="text-center mb-6">
              <div className="text-3xl font-mono">{formatTime(recordingTime)}</div>
              <div className="text-sm text-gray-400">Recording Time</div>
            </div>
          )}

          {/* Recording Options */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMetronomeEnabled(!metronomeEnabled)}
              className={`p-3 rounded-lg border ${
                metronomeEnabled 
                  ? 'border-purple-500 bg-purple-500 bg-opacity-20' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <Timer className="mx-auto mb-1" size={20} />
              <div className="text-sm">Metronome</div>
              {metronomeEnabled && (
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="mt-1 w-full bg-gray-700 rounded px-2 py-1 text-xs text-center"
                  min="60"
                  max="240"
                />
              )}
            </button>
            
            <button
              onClick={() => setCountIn(!countIn)}
              className={`p-3 rounded-lg border ${
                countIn 
                  ? 'border-purple-500 bg-purple-500 bg-opacity-20' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <Radio className="mx-auto mb-1" size={20} />
              <div className="text-sm">Count In</div>
              {countIn && <div className="text-xs text-gray-400 mt-1">4 beats</div>}
            </button>
          </div>
        </div>
      </div>

      {/* Tracks */}
      {tracks.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-xl font-semibold mb-4">Tracks</h2>
          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`bg-gray-800 rounded-lg p-4 ${
                  selectedTrack === track.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedTrack(track.id)}
              >
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-gray-700 rounded">
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="font-medium">{track.name}</div>
                    <div className="h-8 bg-gray-700 rounded mt-1">
                      {/* Waveform visualization */}
                      <div className="flex items-center h-full">
                        {Array.from(track.waveform).map((value, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-purple-500 mx-px"
                            style={{ height: `${value * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setTracks(tracks.map(t => 
                          t.id === track.id ? { ...t, muted: !t.muted } : t
                        ))
                      }}
                      className={`p-2 rounded ${track.muted ? 'bg-red-600' : 'hover:bg-gray-700'}`}
                    >
                      <Volume2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setTracks(tracks.map(t => 
                          t.id === track.id ? { ...t, solo: !t.solo } : t
                        ))
                      }}
                      className={`p-2 rounded ${track.solo ? 'bg-yellow-600' : 'hover:bg-gray-700'}`}
                    >
                      S
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recordings */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Recordings</h2>
        <div className="space-y-2">
          {recordings.map((recording) => (
            <div key={recording.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{recording.name}</div>
                  <div className="text-sm text-gray-400">
                    {formatTime(recording.duration)} • {formatFileSize(recording.size)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportRecording(recording)}
                    className="p-2 hover:bg-gray-700 rounded"
                  >
                    <Download size={16} />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded">
                    <Upload size={16} />
                  </button>
                  <button
                    onClick={() => deleteRecording(recording.id)}
                    className="p-2 hover:bg-gray-700 rounded text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}