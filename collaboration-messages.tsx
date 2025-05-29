'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'voice' | 'project-invite' | 'collab-request';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  projectId?: string;
  projectTitle?: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
    lastSeen?: string;
  };
  lastMessage: Message;
  unreadCount: number;
  type: 'direct' | 'project-group';
  projectTitle?: string;
}

interface AttachmentPreview {
  file: File;
  type: 'audio' | 'image' | 'document';
  preview?: string;
}

export default function CollaborationMessages() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<AttachmentPreview | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  const mockConversations: Conversation[] = [
    {
      id: '1',
      participant: {
        id: '2',
        name: 'Alex Thompson',
        avatar: '🎹',
        online: true
      },
      lastMessage: {
        id: '1',
        senderId: '2',
        senderName: 'Alex Thompson',
        senderAvatar: '🎹',
        content: 'Hey! I love the remix concept. When can we start working on it?',
        timestamp: '2024-01-28T14:30:00Z',
        type: 'text',
        read: false
      },
      unreadCount: 2,
      type: 'direct'
    },
    {
      id: '2',
      participant: {
        id: '3',
        name: 'Sarah Johnson',
        avatar: '👩‍🎤',
        online: false,
        lastSeen: '2024-01-28T12:15:00Z'
      },
      lastMessage: {
        id: '2',
        senderId: 'me',
        senderName: 'You',
        senderAvatar: '👤',
        content: 'Perfect! I'll send over the vocal stems tomorrow',
        timestamp: '2024-01-28T11:45:00Z',
        type: 'text',
        read: true
      },
      unreadCount: 0,
      type: 'direct'
    },
    {
      id: '3',
      participant: {
        id: '4',
        name: 'Jazz Fusion Project',
        avatar: '🎺',
        online: true
      },
      lastMessage: {
        id: '3',
        senderId: '4',
        senderName: 'Sam Williams',
        senderAvatar: '🎺',
        content: 'New chord charts uploaded! Check them out 🎼',
        timestamp: '2024-01-28T10:20:00Z',
        type: 'file',
        fileName: 'jazz_fusion_charts.pdf',
        read: false
      },
      unreadCount: 1,
      type: 'project-group',
      projectTitle: 'Jazz Fusion Experiment'
    }
  ];

  const mockMessages: Record<string, Message[]> = {
    '1': [
      {
        id: '1',
        senderId: '2',
        senderName: 'Alex Thompson',
        senderAvatar: '🎹',
        content: 'Hey! I saw your post about the Midnight Dreams remix. I\'d love to collaborate on this!',
        timestamp: '2024-01-28T14:15:00Z',
        type: 'text',
        read: true
      },
      {
        id: '2',
        senderId: 'me',
        senderName: 'You',
        senderAvatar: '👤',
        content: 'That\'s awesome! I checked out your work and your electronic style would be perfect for this track.',
        timestamp: '2024-01-28T14:20:00Z',
        type: 'text',
        read: true
      },
      {
        id: '3',
        senderId: '2',
        senderName: 'Alex Thompson',
        senderAvatar: '🎹',
        content: 'Hey! I love the remix concept. When can we start working on it?',
        timestamp: '2024-01-28T14:30:00Z',
        type: 'text',
        read: false
      }
    ],
    '2': [
      {
        id: '4',
        senderId: '3',
        senderName: 'Sarah Johnson',
        senderAvatar: '👩‍🎤',
        content: 'I\'d love to add backing vocals to your track! When do you need them recorded?',
        timestamp: '2024-01-28T11:30:00Z',
        type: 'text',
        read: true
      },
      {
        id: '5',
        senderId: 'me',
        senderName: 'You',
        senderAvatar: '👤',
        content: 'Perfect! I\'ll send over the vocal stems tomorrow',
        timestamp: '2024-01-28T11:45:00Z',
        type: 'text',
        read: true
      }
    ],
    '3': [
      {
        id: '6',
        senderId: '4',
        senderName: 'Sam Williams',
        senderAvatar: '🎺',
        content: 'Welcome to the Jazz Fusion project everyone! Let\'s create something amazing together.',
        timestamp: '2024-01-28T09:00:00Z',
        type: 'text',
        read: true
      },
      {
        id: '7',
        senderId: '5',
        senderName: 'Mike Chen',
        senderAvatar: '🎧',
        content: 'Excited to be part of this! I\'ve been experimenting with some electronic elements that could work well.',
        timestamp: '2024-01-28T09:15:00Z',
        type: 'text',
        read: true
      },
      {
        id: '8',
        senderId: '4',
        senderName: 'Sam Williams',
        senderAvatar: '🎺',
        content: 'New chord charts uploaded! Check them out 🎼',
        timestamp: '2024-01-28T10:20:00Z',
        type: 'file',
        fileName: 'jazz_fusion_charts.pdf',
        fileSize: '1.2 MB',
        read: false
      }
    ]
  };

  useEffect(() => {
    setConversations(mockConversations);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages[selectedConversation] || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && !attachmentPreview) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      senderAvatar: '👤',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: attachmentPreview ? 'file' : 'text',
      fileName: attachmentPreview?.file.name,
      fileSize: attachmentPreview ? formatFileSize(attachmentPreview.file.size) : undefined,
      read: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setAttachmentPreview(null);

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: message }
        : conv
    ));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith('audio/') ? 'audio' :
                file.type.startsWith('image/') ? 'image' : 'document';

    const preview: AttachmentPreview = {
      file,
      type
    };

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.preview = e.target?.result as string;
        setAttachmentPreview(preview);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(preview);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.projectTitle && conv.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">Messages</h1>
            <button
              onClick={() => setShowNewMessage(true)}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ✏️
            </button>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <span className="text-4xl block mb-2">💬</span>
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-indigo-50 border-indigo-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="text-3xl bg-gray-100 p-2 rounded-full">
                      {conversation.participant.avatar}
                    </div>
                    {conversation.participant.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium truncate ${
                        conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {conversation.participant.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    {conversation.type === 'project-group' && (
                      <p className="text-xs text-indigo-600 mb-1">
                        📁 {conversation.projectTitle}
                      </p>
                    )}
                    <p className={`text-sm truncate ${
                      conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {conversation.lastMessage.type === 'file' ? (
                        <span className="flex items-center gap-1">
                          📎 {conversation.lastMessage.fileName}
                        </span>
                      ) : (
                        conversation.lastMessage.content
                      )}
                    </p>
                    {!conversation.participant.online && conversation.participant.lastSeen && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last seen {formatTimestamp(conversation.participant.lastSeen)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="text-3xl bg-gray-100 p-2 rounded-full">
                    {selectedConv.participant.avatar}
                  </div>
                  {selectedConv.participant.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{selectedConv.participant.name}</h2>
                  {selectedConv.type === 'project-group' ? (
                    <p className="text-sm text-indigo-600">📁 {selectedConv.projectTitle}</p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {selectedConv.participant.online ? 'Online' : 
                       selectedConv.participant.lastSeen ? 
                       `Last seen ${formatTimestamp(selectedConv.participant.lastSeen)}` : 'Offline'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  📞
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  📹
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  ℹ️
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.senderId === 'me' ? 'flex-row-reverse' : ''}`}
                >
                  {message.senderId !== 'me' && (
                    <div className="text-2xl bg-gray-100 p-1 rounded-full h-fit">
                      {message.senderAvatar}
                    </div>
                  )}
                  <div className={`max-w-[70%] ${message.senderId === 'me' ? 'items-end' : 'items-start'} flex flex-col`}>
                    {message.senderId !== 'me' && (
                      <p className="text-xs text-gray-600 mb-1">{message.senderName}</p>
                    )}
                    <div className={`rounded-lg p-3 ${
                      message.senderId === 'me'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.type === 'file' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📎</span>
                          <div>
                            <p className="font-medium">{message.fileName}</p>
                            {message.fileSize && (
                              <p className="text-xs opacity-75">{message.fileSize}</p>
                            )}
                          </div>
                          <button className="text-xs underline opacity-75 hover:opacity-100">
                            Download
                          </button>
                        </div>
                      ) : message.type === 'project-invite' ? (
                        <div className="border border-current rounded-lg p-3">
                          <p className="font-medium">Project Invitation</p>
                          <p className="text-sm opacity-75">{message.projectTitle}</p>
                          <div className="flex gap-2 mt-2">
                            <button className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                              Accept
                            </button>
                            <button className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                              Decline
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {attachmentPreview && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {attachmentPreview.type === 'audio' ? '🎵' :
                         attachmentPreview.type === 'image' ? '🖼️' : '📄'}
                      </span>
                      <div>
                        <p className="font-medium">{attachmentPreview.file.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(attachmentPreview.file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachmentPreview(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                  {attachmentPreview.preview && (
                    <img src={attachmentPreview.preview} alt="Preview" className="mt-2 max-h-32 rounded" />
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="audio/*,image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  📎
                </button>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🎤
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && !attachmentPreview}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <span className="text-6xl block mb-4">💬</span>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
              <p className="text-gray-600 mb-4">Choose a conversation from the sidebar to start messaging</p>
              <button
                onClick={() => setShowNewMessage(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">New Message</h2>
                <button
                  onClick={() => setShowNewMessage(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To:
                  </label>
                  <input
                    type="text"
                    placeholder="Search for artists..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewMessage(false)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => setShowNewMessage(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}