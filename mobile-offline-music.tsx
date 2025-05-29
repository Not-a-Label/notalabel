'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Music, Download, Cloud, CloudOff, Wifi, WifiOff,
  Play, Pause, SkipForward, SkipBack, Heart, Share2,
  MoreVertical, Check, X, Loader2, HardDrive,
  Smartphone, Trash2, FolderOpen, Clock, Battery
} from 'lucide-react'

interface OfflineTrack {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  fileSize: number
  cached: boolean
  cacheProgress?: number
  lastPlayed?: string
  playCount: number
  artwork?: string
}

interface StorageInfo {
  used: number
  total: number
  musicCache: number
  available: number
}

export default function MobileOfflineMusic() {
  const [tracks, setTracks] = useState<OfflineTrack[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [downloadQueue, setDownloadQueue] = useState<string[]>([])
  const [currentTrack, setCurrentTrack] = useState<OfflineTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])
  const [syncMode, setSyncMode] = useState<'wifi' | 'all' | 'manual'>('wifi')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Load tracks and storage info
    loadTracks()
    checkStorageUsage()
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadTracks = async () => {
    try {
      // Load from IndexedDB for offline support
      const db = await openDB()
      const transaction = db.transaction(['tracks'], 'readonly')
      const store = transaction.objectStore('tracks')
      const allTracks = await store.getAll()
      
      setTracks(allTracks)
    } catch (error) {
      console.error('Error loading tracks:', error)
      // Fallback to API if available
      if (isOnline) {
        const response = await fetch('/api/music/tracks')
        const data = await response.json()
        setTracks(data.tracks)
      }
    }
  }

  const checkStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const total = estimate.quota || 0
      
      // Get music cache size
      const caches = await window.caches.keys()
      let musicCacheSize = 0
      
      for (const cacheName of caches) {
        if (cacheName.includes('music')) {
          const cache = await window.caches.open(cacheName)
          const requests = await cache.keys()
          
          for (const request of requests) {
            const response = await cache.match(request)
            if (response) {
              const blob = await response.blob()
              musicCacheSize += blob.size
            }
          }
        }
      }
      
      setStorageInfo({
        used,
        total,
        musicCache: musicCacheSize,
        available: total - used
      })
    }
  }

  const downloadTrack = async (track: OfflineTrack) => {
    // Check sync mode
    if (syncMode === 'manual' || (syncMode === 'wifi' && !isWifi())) {
      return
    }
    
    setDownloadQueue([...downloadQueue, track.id])
    
    try {
      // Download track
      const response = await fetch(`/api/music/download/${track.id}`)
      const blob = await response.blob()
      
      // Cache in service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_MUSIC',
          url: `/music/${track.id}.mp3`
        })
      }
      
      // Store metadata in IndexedDB
      const db = await openDB()
      const transaction = db.transaction(['tracks'], 'readwrite')
      const store = transaction.objectStore('tracks')
      
      await store.put({
        ...track,
        cached: true,
        cacheProgress: 100
      })
      
      // Update state
      setTracks(tracks.map(t => 
        t.id === track.id ? { ...t, cached: true, cacheProgress: 100 } : t
      ))
      
      setDownloadQueue(downloadQueue.filter(id => id !== track.id))
    } catch (error) {
      console.error('Error downloading track:', error)
      setDownloadQueue(downloadQueue.filter(id => id !== track.id))
    }
  }

  const deleteOfflineTrack = async (trackId: string) => {
    try {
      // Remove from cache
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const cache = await caches.open('music-cache-v1')
        await cache.delete(`/music/${trackId}.mp3`)
      }
      
      // Update IndexedDB
      const db = await openDB()
      const transaction = db.transaction(['tracks'], 'readwrite')
      const store = transaction.objectStore('tracks')
      
      const track = await store.get(trackId)
      if (track) {
        track.cached = false
        await store.put(track)
      }
      
      // Update state
      setTracks(tracks.map(t => 
        t.id === trackId ? { ...t, cached: false, cacheProgress: 0 } : t
      ))
      
      // Refresh storage info
      checkStorageUsage()
    } catch (error) {
      console.error('Error deleting offline track:', error)
    }
  }

  const playTrack = (track: OfflineTrack) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    
    if (audioRef.current) {
      audioRef.current.src = `/music/${track.id}.mp3`
      audioRef.current.play()
    }
    
    // Update last played
    updateTrackMetadata(track.id, { lastPlayed: new Date().toISOString() })
  }

  const updateTrackMetadata = async (trackId: string, updates: Partial<OfflineTrack>) => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['tracks'], 'readwrite')
      const store = transaction.objectStore('tracks')
      
      const track = await store.get(trackId)
      if (track) {
        await store.put({ ...track, ...updates })
      }
    } catch (error) {
      console.error('Error updating track metadata:', error)
    }
  }

  const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('NotALabelMusic', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks', { keyPath: 'id' })
        }
      }
    })
  }

  const isWifi = () => {
    // Check if on WiFi (simplified - in real app, use Network Information API)
    return navigator.onLine && !(navigator as any).connection?.saveData
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Offline Music</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical />
            </button>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      {storageInfo && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="text-gray-600" />
                <h2 className="font-semibold">Storage Usage</h2>
              </div>
              <span className="text-sm text-gray-600">
                {formatBytes(storageInfo.available)} available
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Music: {formatBytes(storageInfo.musicCache)}</span>
              <span>Total: {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sync Settings */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold mb-4">Download Settings</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSyncMode('wifi')}
              className={`p-3 rounded-lg border ${
                syncMode === 'wifi' 
                  ? 'border-purple-600 bg-purple-50 text-purple-600' 
                  : 'border-gray-300'
              }`}
            >
              <Wifi className="mx-auto mb-1" size={20} />
              <div className="text-sm">WiFi Only</div>
            </button>
            <button
              onClick={() => setSyncMode('all')}
              className={`p-3 rounded-lg border ${
                syncMode === 'all' 
                  ? 'border-purple-600 bg-purple-50 text-purple-600' 
                  : 'border-gray-300'
              }`}
            >
              <Cloud className="mx-auto mb-1" size={20} />
              <div className="text-sm">Any Network</div>
            </button>
            <button
              onClick={() => setSyncMode('manual')}
              className={`p-3 rounded-lg border ${
                syncMode === 'manual' 
                  ? 'border-purple-600 bg-purple-50 text-purple-600' 
                  : 'border-gray-300'
              }`}
            >
              <CloudOff className="mx-auto mb-1" size={20} />
              <div className="text-sm">Manual</div>
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {tracks.filter(t => t.cached).length} of {tracks.length} tracks offline
              </h3>
              {selectedTracks.length > 0 && (
                <button
                  onClick={() => setSelectedTracks([])}
                  className="text-purple-600 hover:text-purple-700"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
          
          <div className="divide-y">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`p-4 hover:bg-gray-50 ${
                  selectedTracks.includes(track.id) ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox for batch operations */}
                  <input
                    type="checkbox"
                    checked={selectedTracks.includes(track.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTracks([...selectedTracks, track.id])
                      } else {
                        setSelectedTracks(selectedTracks.filter(id => id !== track.id))
                      }
                    }}
                    className="rounded"
                  />
                  
                  {/* Track artwork */}
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Music className="text-gray-400" size={20} />
                  </div>
                  
                  {/* Track info */}
                  <div className="flex-1">
                    <div className="font-medium">{track.title}</div>
                    <div className="text-sm text-gray-600">
                      {track.artist} • {track.album}
                    </div>
                    {track.cached && track.lastPlayed && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        Last played {new Date(track.lastPlayed).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Download/Play controls */}
                  <div className="flex items-center gap-2">
                    {track.cached ? (
                      <>
                        <button
                          onClick={() => playTrack(track)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Play size={20} />
                        </button>
                        <button
                          onClick={() => deleteOfflineTrack(track.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    ) : downloadQueue.includes(track.id) ? (
                      <div className="p-2">
                        <Loader2 className="animate-spin" size={20} />
                      </div>
                    ) : (
                      <button
                        onClick={() => downloadTrack(track)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        disabled={syncMode === 'manual'}
                      >
                        <Download size={20} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Download progress */}
                {track.cacheProgress && track.cacheProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-purple-600 h-1 rounded-full transition-all"
                        style={{ width: `${track.cacheProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedTracks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedTracks.length} tracks selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  selectedTracks.forEach(id => {
                    const track = tracks.find(t => t.id === id)
                    if (track && !track.cached) {
                      downloadTrack(track)
                    }
                  })
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Download Selected
              </button>
              <button
                onClick={() => {
                  selectedTracks.forEach(id => {
                    const track = tracks.find(t => t.id === id)
                    if (track && track.cached) {
                      deleteOfflineTrack(id)
                    }
                  })
                  setSelectedTracks([])
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Remove Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  )
}