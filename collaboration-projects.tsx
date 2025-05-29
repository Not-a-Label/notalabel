'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  status: 'planning' | 'in-progress' | 'mixing' | 'mastering' | 'completed';
  createdDate: string;
  deadline?: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  collaborators: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    status: 'pending' | 'accepted' | 'declined';
  }[];
  tasks: {
    id: string;
    title: string;
    assignee: string;
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    dueDate?: string;
  }[];
  files: {
    id: string;
    name: string;
    type: 'audio' | 'midi' | 'lyrics' | 'chord-chart' | 'other';
    uploadedBy: string;
    uploadDate: string;
    size: string;
  }[];
  messages: {
    id: string;
    sender: string;
    message: string;
    timestamp: string;
    type: 'text' | 'file' | 'voice-note';
  }[];
  privacy: 'private' | 'invite-only' | 'public';
  lookingFor: string[];
  tags: string[];
}

interface NewProject {
  title: string;
  description: string;
  genre: string;
  privacy: 'private' | 'invite-only' | 'public';
  lookingFor: string[];
  deadline?: string;
}

export default function CollaborationProjects() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-projects' | 'invited' | 'discover' | 'create'>('my-projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState<NewProject>({
    title: '',
    description: '',
    genre: '',
    privacy: 'invite-only',
    lookingFor: [],
    deadline: ''
  });

  // Mock data
  const projects: Project[] = [
    {
      id: '1',
      title: 'Midnight Dreams Remix',
      description: 'Looking to create an electronic remix of my acoustic track. Need a producer with experience in ambient/downtempo.',
      genre: 'Electronic',
      status: 'in-progress',
      createdDate: '2024-01-15',
      deadline: '2024-02-28',
      creator: { id: 'me', name: 'You', avatar: '👤' },
      collaborators: [
        { id: '2', name: 'Alex Thompson', avatar: '🎹', role: 'Producer', status: 'accepted' },
        { id: '3', name: 'Sarah Johnson', avatar: '👩‍🎤', role: 'Backing Vocals', status: 'pending' }
      ],
      tasks: [
        { id: '1', title: 'Create base electronic arrangement', assignee: 'Alex Thompson', status: 'in-progress', dueDate: '2024-02-10' },
        { id: '2', title: 'Record backing vocals', assignee: 'Sarah Johnson', status: 'todo', dueDate: '2024-02-15' },
        { id: '3', title: 'Final mix and master', assignee: 'Alex Thompson', status: 'todo', dueDate: '2024-02-25' }
      ],
      files: [
        { id: '1', name: 'midnight_dreams_original.wav', type: 'audio', uploadedBy: 'You', uploadDate: '2024-01-15', size: '45.2 MB' },
        { id: '2', name: 'chord_progression.mid', type: 'midi', uploadedBy: 'You', uploadDate: '2024-01-15', size: '2.1 KB' },
        { id: '3', name: 'electronic_arrangement_v1.wav', type: 'audio', uploadedBy: 'Alex Thompson', uploadDate: '2024-01-22', size: '38.7 MB' }
      ],
      messages: [
        { id: '1', sender: 'Alex Thompson', message: 'Hey! I love the original track. Started working on the electronic arrangement. Check out the first version I uploaded.', timestamp: '2024-01-22T14:30:00Z', type: 'text' },
        { id: '2', sender: 'You', message: 'Sounds amazing! The ambient pads really complement the original melody. Can we add some subtle percussion?', timestamp: '2024-01-22T16:45:00Z', type: 'text' },
        { id: '3', sender: 'Sarah Johnson', message: 'Just accepted the invitation! When do you need the backing vocals recorded?', timestamp: '2024-01-23T09:15:00Z', type: 'text' }
      ],
      privacy: 'invite-only',
      lookingFor: ['Mastering Engineer'],
      tags: ['Electronic', 'Ambient', 'Remix']
    },
    {
      id: '2',
      title: 'Jazz Fusion Experiment',
      description: 'Experimental jazz fusion project mixing traditional jazz with modern electronic elements. Looking for adventurous musicians.',
      genre: 'Jazz Fusion',
      status: 'planning',
      createdDate: '2024-01-20',
      creator: { id: '4', name: 'Sam Williams', avatar: '🎺' },
      collaborators: [
        { id: 'me', name: 'You', avatar: '👤', role: 'Guitar', status: 'accepted' },
        { id: '5', name: 'Mike Chen', avatar: '🎧', role: 'Electronic Production', status: 'accepted' }
      ],
      tasks: [
        { id: '4', title: 'Compose basic chord progressions', assignee: 'Sam Williams', status: 'completed' },
        { id: '5', title: 'Create electronic backing track', assignee: 'Mike Chen', status: 'todo', dueDate: '2024-02-05' },
        { id: '6', title: 'Record guitar parts', assignee: 'You', status: 'todo', dueDate: '2024-02-12' }
      ],
      files: [
        { id: '4', name: 'jazz_fusion_chord_charts.pdf', type: 'chord-chart', uploadedBy: 'Sam Williams', uploadDate: '2024-01-20', size: '1.2 MB' },
        { id: '5', name: 'tempo_and_structure.txt', type: 'other', uploadedBy: 'Sam Williams', uploadDate: '2024-01-21', size: '3.4 KB' }
      ],
      messages: [
        { id: '4', sender: 'Sam Williams', message: 'Welcome to the project! I\'ve uploaded some chord charts to get us started. What do you think about the harmonic progression?', timestamp: '2024-01-21T11:20:00Z', type: 'text' },
        { id: '5', sender: 'Mike Chen', message: 'This is going to be interesting! I\'m thinking we could use some analog synth sounds to complement the jazz elements.', timestamp: '2024-01-21T13:45:00Z', type: 'text' }
      ],
      privacy: 'invite-only',
      lookingFor: ['Bassist', 'Drummer'],
      tags: ['Jazz', 'Fusion', 'Electronic', 'Experimental']
    }
  ];

  const discoverProjects: Project[] = [
    {
      id: '3',
      title: 'Indie Folk Album',
      description: 'Working on a collection of indie folk songs with storytelling focus. Looking for a fiddle player and harmony vocalist.',
      genre: 'Folk',
      status: 'in-progress',
      createdDate: '2024-01-10',
      creator: { id: '6', name: 'Emma Rodriguez', avatar: '🎸' },
      collaborators: [
        { id: '7', name: 'John Smith', avatar: '🎻', role: 'Fiddle', status: 'accepted' }
      ],
      tasks: [],
      files: [],
      messages: [],
      privacy: 'public',
      lookingFor: ['Harmony Vocalist', 'Mandolin Player'],
      tags: ['Folk', 'Storytelling', 'Acoustic']
    }
  ];

  const allSkills = ['Vocals', 'Guitar', 'Piano', 'Drums', 'Bass', 'Producer', 'Mixing Engineer', 'Mastering Engineer', 'Songwriter', 'Fiddle', 'Mandolin'];

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'mixing':
        return 'bg-orange-100 text-orange-800';
      case 'mastering':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateProject = () => {
    // In production, this would make an API call
    console.log('Creating project:', newProject);
    setShowCreateModal(false);
    setNewProject({
      title: '',
      description: '',
      genre: '',
      privacy: 'invite-only',
      lookingFor: [],
      deadline: ''
    });
  };

  const handleLookingForToggle = (skill: string) => {
    setNewProject(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(skill)
        ? prev.lookingFor.filter(s => s !== skill)
        : [...prev.lookingFor, skill]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaboration Projects</h1>
            <p className="text-gray-600">Manage your collaborative music projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          {(['my-projects', 'invited', 'discover'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'my-projects' ? 'My Projects' : 
               tab === 'invited' ? 'Invited to' : 'Discover Projects'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'my-projects' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter(p => p.creator.id === 'me').map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                    {project.genre}
                  </span>
                  {project.deadline && (
                    <span className="text-xs text-gray-500">
                      Due: {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500">Collaborators:</span>
                  <div className="flex -space-x-1">
                    {project.collaborators.slice(0, 3).map(collab => (
                      <div key={collab.id} className="text-lg bg-gray-100 rounded-full p-1" title={collab.name}>
                        {collab.avatar}
                      </div>
                    ))}
                    {project.collaborators.length > 3 && (
                      <div className="text-xs bg-gray-200 rounded-full px-2 py-1">
                        +{project.collaborators.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {project.lookingFor.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Still looking for:</p>
                    <div className="flex flex-wrap gap-1">
                      {project.lookingFor.slice(0, 2).map((skill, i) => (
                        <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedProject(project)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Open Project
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'invited' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter(p => p.creator.id !== 'me' && p.collaborators.some(c => c.id === 'me')).map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                    {project.genre}
                  </span>
                  <span className="text-xs text-gray-500">
                    by {project.creator.name}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Your role:</p>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                    {project.collaborators.find(c => c.id === 'me')?.role}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedProject(project)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Open Project
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discoverProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                    {project.genre}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{project.creator.avatar}</span>
                    <span className="text-xs text-gray-500">{project.creator.name}</span>
                  </div>
                </div>

                {project.lookingFor.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Looking for:</p>
                    <div className="flex flex-wrap gap-1">
                      {project.lookingFor.slice(0, 2).map((skill, i) => (
                        <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 px-3 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    Request to Join
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedProject.title}</h2>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Tasks */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tasks</h3>
                    <div className="space-y-2">
                      {selectedProject.tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-600">Assigned to: {task.assignee}</p>
                            {task.dueDate && (
                              <p className="text-xs text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Files */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Project Files</h3>
                    <div className="space-y-2">
                      {selectedProject.files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {file.type === 'audio' ? '🎵' :
                               file.type === 'midi' ? '🎹' :
                               file.type === 'lyrics' ? '📝' :
                               file.type === 'chord-chart' ? '🎼' : '📄'}
                            </span>
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-600">
                                {file.uploadedBy} • {file.size} • {new Date(file.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button className="text-indigo-600 hover:text-indigo-700 text-sm">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Messages */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Project Chat</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedProject.messages.map(message => (
                        <div key={message.id} className="flex gap-3">
                          <div className="text-2xl">👤</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{message.sender}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{message.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Project Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Project Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                          {selectedProject.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Genre:</span>
                        <span>{selectedProject.genre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(selectedProject.createdDate).toLocaleDateString()}</span>
                      </div>
                      {selectedProject.deadline && (
                        <div className="flex justify-between">
                          <span>Deadline:</span>
                          <span>{new Date(selectedProject.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Collaborators */}
                  <div>
                    <h4 className="font-semibold mb-3">Collaborators</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <span className="text-2xl">{selectedProject.creator.avatar}</span>
                        <div>
                          <p className="font-medium text-sm">{selectedProject.creator.name}</p>
                          <p className="text-xs text-gray-600">Project Creator</p>
                        </div>
                      </div>
                      {selectedProject.collaborators.map(collab => (
                        <div key={collab.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <span className="text-2xl">{collab.avatar}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{collab.name}</p>
                            <p className="text-xs text-gray-600">{collab.role}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            collab.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            collab.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {collab.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Looking For */}
                  {selectedProject.lookingFor.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Still Looking For</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedProject.lookingFor.map((skill, i) => (
                          <span key={i} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedProject.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedProject.tags.map((tag, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Open Workspace
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Project Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Create New Project</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe your project and what you're looking to achieve"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre *
                  </label>
                  <select
                    value={newProject.genre}
                    onChange={(e) => setNewProject(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select genre</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Hip-Hop">Hip-Hop</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Folk">Folk</option>
                    <option value="Jazz">Jazz</option>
                    <option value="R&B">R&B</option>
                    <option value="Country">Country</option>
                    <option value="Alternative">Alternative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Looking For
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {allSkills.map(skill => (
                      <label key={skill} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProject.lookingFor.includes(skill)}
                          onChange={() => handleLookingForToggle(skill)}
                          className="rounded text-indigo-600 mr-2"
                        />
                        <span className="text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Setting
                  </label>
                  <select
                    value={newProject.privacy}
                    onChange={(e) => setNewProject(prev => ({ ...prev, privacy: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="private">Private - Only you can see it</option>
                    <option value="invite-only">Invite Only - Only invited collaborators</option>
                    <option value="public">Public - Anyone can discover and request to join</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProject.title || !newProject.description || !newProject.genre}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Project
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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