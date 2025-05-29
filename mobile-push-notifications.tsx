'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, BellOff, MessageCircle, Heart, Music, TrendingUp,
  Calendar, Users, DollarSign, Award, Zap, Settings,
  Check, X, Smartphone, Globe, Moon, Sun, Volume2,
  VolumeX, Clock, Filter, Archive, Trash2, MoreVertical
} from 'lucide-react'

interface NotificationPreference {
  id: string
  category: string
  title: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  frequency: 'instant' | 'daily' | 'weekly' | 'never'
  channels: {
    push: boolean
    email: boolean
    sms: boolean
  }
}

interface Notification {
  id: string
  type: string
  title: string
  body: string
  icon: React.ReactNode
  timestamp: string
  read: boolean
  actionUrl?: string
  actions?: Array<{
    label: string
    action: string
  }>
  data?: any
}

export default function MobilePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'messages',
      category: 'Social',
      title: 'Messages',
      description: 'New messages and collaboration requests',
      icon: <MessageCircle size={20} />,
      enabled: true,
      frequency: 'instant',
      channels: { push: true, email: true, sms: false }
    },
    {
      id: 'likes',
      category: 'Social',
      title: 'Likes & Follows',
      description: 'When someone likes your music or follows you',
      icon: <Heart size={20} />,
      enabled: true,
      frequency: 'daily',
      channels: { push: true, email: false, sms: false }
    },
    {
      id: 'releases',
      category: 'Music',
      title: 'New Releases',
      description: 'Updates about your music releases',
      icon: <Music size={20} />,
      enabled: true,
      frequency: 'instant',
      channels: { push: true, email: true, sms: true }
    },
    {
      id: 'analytics',
      category: 'Analytics',
      title: 'Analytics Updates',
      description: 'Weekly performance reports and milestones',
      icon: <TrendingUp size={20} />,
      enabled: true,
      frequency: 'weekly',
      channels: { push: false, email: true, sms: false }
    },
    {
      id: 'events',
      category: 'Events',
      title: 'Event Reminders',
      description: 'Upcoming shows and deadlines',
      icon: <Calendar size={20} />,
      enabled: true,
      frequency: 'instant',
      channels: { push: true, email: true, sms: true }
    },
    {
      id: 'collaborations',
      category: 'Social',
      title: 'Collaboration Invites',
      description: 'New collaboration opportunities',
      icon: <Users size={20} />,
      enabled: true,
      frequency: 'instant',
      channels: { push: true, email: true, sms: false }
    },
    {
      id: 'revenue',
      category: 'Business',
      title: 'Revenue Updates',
      description: 'Earnings and payout notifications',
      icon: <DollarSign size={20} />,
      enabled: true,
      frequency: 'instant',
      channels: { push: true, email: true, sms: false }
    },
    {
      id: 'achievements',
      category: 'Achievements',
      title: 'Milestones & Badges',
      description: 'New achievements and certifications',
      icon: <Award size={20} />,
      enabled: true,
      frequency: 'instant',
      channels: { push: true, email: false, sms: false }
    }
  ])
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '08:00'
  })
  const [filter, setFilter] = useState('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  useEffect(() => {
    checkNotificationPermission()
    loadNotifications()
    subscribeToNotifications()
  }, [])

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission === 'granted') {
        subscribeToPushNotifications()
      }
    }
  }

  const subscribeToPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        })
        
        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        })
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error)
      }
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setNotifications(data.notifications.map((n: any) => ({
        ...n,
        icon: getNotificationIcon(n.type)
      })))
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const subscribeToNotifications = () => {
    // Subscribe to real-time notifications via WebSocket or SSE
    const eventSource = new EventSource('/api/notifications/stream')
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      handleNewNotification(notification)
    }
    
    return () => eventSource.close()
  }

  const handleNewNotification = (notification: any) => {
    const newNotification = {
      ...notification,
      icon: getNotificationIcon(notification.type),
      timestamp: new Date().toISOString(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Show push notification if enabled
    if (permission === 'granted' && shouldShowNotification(notification)) {
      showPushNotification(notification)
    }
  }

  const shouldShowNotification = (notification: any) => {
    const pref = preferences.find(p => p.id === notification.type)
    if (!pref?.enabled || !pref.channels.push) return false
    
    // Check quiet hours
    if (quietHours.enabled) {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()
      const [startHour, startMin] = quietHours.start.split(':').map(Number)
      const [endHour, endMin] = quietHours.end.split(':').map(Number)
      const startTime = startHour * 60 + startMin
      const endTime = endHour * 60 + endMin
      
      if (startTime < endTime) {
        if (currentTime >= startTime && currentTime < endTime) return false
      } else {
        if (currentTime >= startTime || currentTime < endTime) return false
      }
    }
    
    return true
  }

  const showPushNotification = (notification: any) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: notification.id,
          data: notification.data,
          actions: notification.actions || []
        }
      })
    }
  }

  const markAsRead = async (notificationId: string) => {
    await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const deleteNotification = async (notificationId: string) => {
    await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
    setNotifications(notifications.filter(n => n.id !== notificationId))
  }

  const updatePreference = (prefId: string, updates: Partial<NotificationPreference>) => {
    setPreferences(preferences.map(p => 
      p.id === prefId ? { ...p, ...updates } : p
    ))
    // Save to server
    savePreferences()
  }

  const savePreferences = async () => {
    await fetch('/api/notifications/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences, quietHours })
    })
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      messages: <MessageCircle size={20} />,
      likes: <Heart size={20} />,
      releases: <Music size={20} />,
      analytics: <TrendingUp size={20} />,
      events: <Calendar size={20} />,
      collaborations: <Users size={20} />,
      revenue: <DollarSign size={20} />,
      achievements: <Award size={20} />
    }
    return icons[type] || <Bell size={20} />
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Filter size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Banner */}
      {permission === 'default' && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Bell className="text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900">Enable Push Notifications</h3>
                <p className="text-purple-700 text-sm mt-1">
                  Get instant updates about your music, messages, and more
                </p>
                <button
                  onClick={requestPermission}
                  className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
          
          {/* Quiet Hours */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Moon className="text-gray-600" />
                <div>
                  <h3 className="font-medium">Quiet Hours</h3>
                  <p className="text-sm text-gray-600">Pause notifications during set hours</p>
                </div>
              </div>
              <button
                onClick={() => setQuietHours({ ...quietHours, enabled: !quietHours.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  quietHours.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {quietHours.enabled && (
              <div className="ml-9 flex items-center gap-2 text-sm">
                <input
                  type="time"
                  value={quietHours.start}
                  onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                  className="px-2 py-1 border rounded"
                />
                <span>to</span>
                <input
                  type="time"
                  value={quietHours.end}
                  onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                  className="px-2 py-1 border rounded"
                />
              </div>
            )}
          </div>
          
          {/* Notification Categories */}
          <div className="space-y-4">
            {preferences.map((pref) => (
              <div key={pref.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="text-purple-600">{pref.icon}</div>
                    <div>
                      <h3 className="font-medium">{pref.title}</h3>
                      <p className="text-sm text-gray-600">{pref.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updatePreference(pref.id, { enabled: !pref.enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      pref.enabled ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        pref.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {pref.enabled && (
                  <div className="ml-9 mt-3 space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 w-20">Frequency:</span>
                      <select
                        value={pref.frequency}
                        onChange={(e) => updatePreference(pref.id, { 
                          frequency: e.target.value as any 
                        })}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="instant">Instant</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Summary</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 w-20">Channels:</span>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={pref.channels.push}
                          onChange={(e) => updatePreference(pref.id, {
                            channels: { ...pref.channels, push: e.target.checked }
                          })}
                          className="rounded"
                        />
                        Push
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={pref.channels.email}
                          onChange={(e) => updatePreference(pref.id, {
                            channels: { ...pref.channels, email: e.target.checked }
                          })}
                          className="rounded"
                        />
                        Email
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={pref.channels.sms}
                          onChange={(e) => updatePreference(pref.id, {
                            channels: { ...pref.channels, sms: e.target.checked }
                          })}
                          className="rounded"
                        />
                        SMS
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Notifications</h2>
              {selectedNotifications.length > 0 && (
                <button
                  onClick={() => {
                    selectedNotifications.forEach(id => deleteNotification(id))
                    setSelectedNotifications([])
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete {selectedNotifications.length} selected
                </button>
              )}
            </div>
            
            {/* Filter tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'unread' ? 'bg-purple-600 text-white' : 'bg-gray-100'
                }`}
              >
                Unread
              </button>
              {['messages', 'releases', 'revenue'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded-full text-sm capitalize ${
                    filter === type ? 'bg-purple-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="divide-y">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-600">No notifications</h3>
                <p className="text-gray-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications([...selectedNotifications, notification.id])
                        } else {
                          setSelectedNotifications(
                            selectedNotifications.filter(id => id !== notification.id)
                          )
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 rounded"
                    />
                    
                    <div className="text-purple-600">{notification.icon}</div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{notification.body}</p>
                      
                      {notification.actions && (
                        <div className="flex gap-2 mt-3">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              className="text-sm text-purple-600 hover:text-purple-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle action
                              }}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toRelativeTimeString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Extension to Date prototype for relative time
declare global {
  interface Date {
    toRelativeTimeString(): string
  }
}

Date.prototype.toRelativeTimeString = function() {
  const seconds = Math.floor((new Date().getTime() - this.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'
  
  return 'Just now'
}