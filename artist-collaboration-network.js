// Artist Collaboration Network for Not a Label
const EventEmitter = require('events');

class ArtistCollaborationNetwork extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.connections = new Map();
    this.projects = new Map();
    this.invitations = new Map();
    this.groups = new Map();
    this.achievements = new Map();
    
    // Collaboration types
    this.collaborationTypes = {
      song: { duration: '1-3 months', complexity: 'medium' },
      album: { duration: '3-12 months', complexity: 'high' },
      single: { duration: '2-6 weeks', complexity: 'low' },
      remix: { duration: '1-4 weeks', complexity: 'low' },
      tour: { duration: '1-6 months', complexity: 'high' },
      livestream: { duration: '1-2 weeks', complexity: 'low' },
      musicVideo: { duration: '2-8 weeks', complexity: 'medium' },
      podcast: { duration: '1-2 weeks', complexity: 'low' }
    };
    
    // Skill categories for matching
    this.skillCategories = {
      production: ['mixing', 'mastering', 'recording', 'sound_design'],
      performance: ['vocals', 'guitar', 'piano', 'drums', 'bass', 'violin'],
      composition: ['songwriting', 'arranging', 'orchestration', 'lyrics'],
      visual: ['video_editing', 'photography', 'graphic_design', 'animation'],
      business: ['marketing', 'promotion', 'booking', 'management'],
      technical: ['live_sound', 'studio_engineering', 'web_development']
    };
  }

  // Create artist profile for networking
  async createArtistProfile(artistData) {
    const profile = {
      id: artistData.id,
      name: artistData.name,
      stageName: artistData.stageName,
      location: artistData.location,
      genres: artistData.genres || [],
      skills: artistData.skills || [],
      instruments: artistData.instruments || [],
      experience: artistData.experience || 'beginner',
      availability: artistData.availability || 'part-time',
      collaboration_preferences: {
        remote: artistData.preferences?.remote ?? true,
        local: artistData.preferences?.local ?? true,
        paid: artistData.preferences?.paid ?? false,
        equity: artistData.preferences?.equity ?? true,
        credit: artistData.preferences?.credit ?? true
      },
      portfolio: {
        tracks: artistData.portfolio?.tracks || [],
        videos: artistData.portfolio?.videos || [],
        achievements: artistData.portfolio?.achievements || [],
        testimonials: []
      },
      network: {
        connections: new Set(),
        collaborations: new Set(),
        groups: new Set(),
        reputation: 100,
        completedProjects: 0
      },
      createdAt: new Date(),
      lastActive: new Date()
    };
    
    // Store profile
    this.connections.set(artistData.id, profile);
    
    // Find initial matches
    const suggestedConnections = await this.findCollaborators(profile);
    
    return {
      profile,
      suggestedConnections: suggestedConnections.slice(0, 10),
      networkScore: this.calculateNetworkScore(profile)
    };
  }

  // Advanced collaborator matching algorithm
  async findCollaborators(artistProfile, filters = {}) {
    const matches = [];
    
    for (const [id, otherProfile] of this.connections) {
      if (id === artistProfile.id) continue;
      
      const compatibility = await this.calculateCompatibility(artistProfile, otherProfile);
      
      // Apply filters
      if (filters.genres && !filters.genres.some(g => otherProfile.genres.includes(g))) continue;
      if (filters.location && otherProfile.location !== filters.location) continue;
      if (filters.experience && otherProfile.experience !== filters.experience) continue;
      if (filters.minReputationScore && otherProfile.network.reputation < filters.minReputationScore) continue;
      
      if (compatibility.totalScore >= 60) {
        matches.push({
          artist: otherProfile,
          compatibility,
          suggestedCollaborations: this.suggestCollaborationTypes(artistProfile, otherProfile),
          mutualConnections: this.findMutualConnections(artistProfile.id, id),
          lastCollaboration: this.getLastCollaboration(artistProfile.id, id)
        });
      }
    }
    
    // Sort by compatibility score
    return matches.sort((a, b) => b.compatibility.totalScore - a.compatibility.totalScore);
  }

  // Calculate detailed compatibility between artists
  async calculateCompatibility(artist1, artist2) {
    const factors = {
      genreOverlap: this.calculateGenreOverlap(artist1.genres, artist2.genres),
      skillComplementarity: this.calculateSkillComplementarity(artist1.skills, artist2.skills),
      experienceAlignment: this.calculateExperienceAlignment(artist1.experience, artist2.experience),
      locationScore: this.calculateLocationScore(artist1.location, artist2.location),
      availabilityMatch: this.calculateAvailabilityMatch(artist1.availability, artist2.availability),
      collaborationHistoryBonus: this.getCollaborationHistoryBonus(artist1.id, artist2.id),
      reputationScore: this.calculateReputationScore(artist1.network.reputation, artist2.network.reputation),
      preferenceAlignment: this.calculatePreferenceAlignment(artist1.collaboration_preferences, artist2.collaboration_preferences)
    };
    
    const weights = {
      genreOverlap: 0.25,
      skillComplementarity: 0.20,
      experienceAlignment: 0.15,
      locationScore: 0.10,
      availabilityMatch: 0.10,
      collaborationHistoryBonus: 0.05,
      reputationScore: 0.10,
      preferenceAlignment: 0.05
    };
    
    const totalScore = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + (value * weights[key]);
    }, 0);
    
    return {
      totalScore: Math.round(totalScore),
      factors,
      recommendation: this.getCompatibilityRecommendation(totalScore),
      strengthAreas: this.identifyStrengthAreas(factors),
      improvementAreas: this.identifyImprovementAreas(factors)
    };
  }

  // Create collaboration project
  async createCollaborationProject(projectData) {
    const project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: projectData.title,
      description: projectData.description,
      type: projectData.type,
      initiator: projectData.initiatorId,
      collaborators: new Set([projectData.initiatorId]),
      invitedArtists: new Set(projectData.invitedArtists || []),
      status: 'planning',
      timeline: {
        estimatedDuration: this.collaborationTypes[projectData.type]?.duration || 'TBD',
        startDate: projectData.startDate || null,
        endDate: projectData.endDate || null,
        milestones: []
      },
      requirements: {
        skills: projectData.requiredSkills || [],
        equipment: projectData.requiredEquipment || [],
        location: projectData.location || 'remote',
        budget: projectData.budget || { min: 0, max: 0, currency: 'USD' }
      },
      compensation: {
        type: projectData.compensation?.type || 'credit_share',
        splits: projectData.compensation?.splits || {},
        upfront: projectData.compensation?.upfront || 0
      },
      files: {
        demos: [],
        workingFiles: [],
        finalFiles: [],
        contracts: []
      },
      communication: {
        chatRoomId: this.createChatRoom(projectData.title),
        videoCallLink: null,
        lastActivity: new Date()
      },
      progress: {
        completedMilestones: 0,
        totalMilestones: 0,
        percentComplete: 0,
        currentPhase: 'initiation'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store project
    this.projects.set(project.id, project);
    
    // Send invitations
    if (projectData.invitedArtists) {
      for (const artistId of projectData.invitedArtists) {
        await this.sendCollaborationInvitation(project.id, artistId, projectData.initiatorId);
      }
    }
    
    // Emit project created event
    this.emit('projectCreated', { project, initiator: projectData.initiatorId });
    
    return project;
  }

  // Send collaboration invitation
  async sendCollaborationInvitation(projectId, inviteeId, inviterId) {
    const project = this.projects.get(projectId);
    const inviter = this.connections.get(inviterId);
    const invitee = this.connections.get(inviteeId);
    
    if (!project || !inviter || !invitee) {
      throw new Error('Invalid invitation data');
    }
    
    const invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      inviterId,
      inviteeId,
      message: `${inviter.name} has invited you to collaborate on "${project.title}"`,
      projectDetails: {
        title: project.title,
        type: project.type,
        description: project.description,
        estimatedDuration: project.timeline.estimatedDuration,
        compensation: project.compensation
      },
      status: 'pending',
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    // Store invitation
    this.invitations.set(invitation.id, invitation);
    
    // Add to project's invited list
    project.invitedArtists.add(inviteeId);
    
    // Emit invitation sent event
    this.emit('invitationSent', { invitation, project, inviter, invitee });
    
    return invitation;
  }

  // Handle invitation response
  async respondToInvitation(invitationId, response, message = '') {
    const invitation = this.invitations.get(invitationId);
    
    if (!invitation || invitation.status !== 'pending') {
      throw new Error('Invalid or expired invitation');
    }
    
    invitation.status = response; // 'accepted', 'declined'
    invitation.responseMessage = message;
    invitation.respondedAt = new Date();
    
    const project = this.projects.get(invitation.projectId);
    
    if (response === 'accepted') {
      // Add to project collaborators
      project.collaborators.add(invitation.inviteeId);
      project.invitedArtists.delete(invitation.inviteeId);
      
      // Update artist networks
      const inviter = this.connections.get(invitation.inviterId);
      const invitee = this.connections.get(invitation.inviteeId);
      
      inviter.network.connections.add(invitation.inviteeId);
      invitee.network.connections.add(invitation.inviterId);
      
      // Grant access to project resources
      await this.grantProjectAccess(invitation.inviteeId, invitation.projectId);
      
      this.emit('invitationAccepted', { invitation, project });
    } else {
      project.invitedArtists.delete(invitation.inviteeId);
      this.emit('invitationDeclined', { invitation, project });
    }
    
    return { invitation, project };
  }

  // Create artist groups/communities
  async createArtistGroup(groupData) {
    const group = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: groupData.name,
      description: groupData.description,
      type: groupData.type, // 'genre', 'location', 'skill', 'experience', 'open'
      category: groupData.category,
      creator: groupData.creatorId,
      admins: new Set([groupData.creatorId]),
      members: new Set([groupData.creatorId]),
      invitedMembers: new Set(),
      settings: {
        privacy: groupData.privacy || 'public', // 'public', 'private', 'invite_only'
        autoApprove: groupData.autoApprove ?? true,
        allowMemberInvites: groupData.allowMemberInvites ?? true,
        allowProjectPosting: groupData.allowProjectPosting ?? true
      },
      criteria: {
        genres: groupData.criteria?.genres || [],
        skills: groupData.criteria?.skills || [],
        experience: groupData.criteria?.experience || [],
        location: groupData.criteria?.location || null
      },
      activity: {
        projects: new Set(),
        discussions: new Set(),
        events: new Set(),
        resources: new Set()
      },
      stats: {
        totalMembers: 1,
        activeMembers: 1,
        projectsCreated: 0,
        collaborationsFormed: 0
      },
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    // Store group
    this.groups.set(group.id, group);
    
    // Add to creator's profile
    const creator = this.connections.get(groupData.creatorId);
    if (creator) {
      creator.network.groups.add(group.id);
    }
    
    this.emit('groupCreated', { group, creator: groupData.creatorId });
    
    return group;
  }

  // Join artist group
  async joinGroup(groupId, artistId, invitationCode = null) {
    const group = this.groups.get(groupId);
    const artist = this.connections.get(artistId);
    
    if (!group || !artist) {
      throw new Error('Invalid group or artist');
    }
    
    // Check if already a member
    if (group.members.has(artistId)) {
      throw new Error('Already a member of this group');
    }
    
    // Check eligibility
    const eligible = this.checkGroupEligibility(artist, group);
    if (!eligible.canJoin) {
      throw new Error(`Not eligible: ${eligible.reason}`);
    }
    
    // Handle different privacy settings
    if (group.settings.privacy === 'private' && !group.invitedMembers.has(artistId)) {
      throw new Error('Group is private and requires invitation');
    }
    
    if (group.settings.privacy === 'invite_only' && !invitationCode) {
      throw new Error('Group requires invitation code');
    }
    
    // Add member
    group.members.add(artistId);
    group.invitedMembers.delete(artistId);
    group.stats.totalMembers++;
    group.lastActivity = new Date();
    
    // Add to artist's profile
    artist.network.groups.add(groupId);
    
    this.emit('memberJoined', { group, artist, memberId: artistId });
    
    return { group, artist };
  }

  // Post project to group
  async postProjectToGroup(groupId, projectId, posterId) {
    const group = this.groups.get(groupId);
    const project = this.projects.get(projectId);
    const poster = this.connections.get(posterId);
    
    if (!group || !project || !poster) {
      throw new Error('Invalid group, project, or poster');
    }
    
    // Check permissions
    if (!group.members.has(posterId)) {
      throw new Error('Must be a group member to post projects');
    }
    
    if (!group.settings.allowProjectPosting) {
      throw new Error('Project posting is disabled in this group');
    }
    
    // Add project to group
    group.activity.projects.add(projectId);
    group.stats.projectsCreated++;
    group.lastActivity = new Date();
    
    // Notify group members
    this.emit('projectPostedToGroup', {
      group,
      project,
      poster,
      members: Array.from(group.members)
    });
    
    return { group, project };
  }

  // Social reputation system
  updateArtistReputation(artistId, action, points) {
    const artist = this.connections.get(artistId);
    if (!artist) return;
    
    const oldReputation = artist.network.reputation;
    
    switch (action) {
      case 'project_completed':
        artist.network.reputation += points || 50;
        artist.network.completedProjects++;
        break;
      case 'positive_review':
        artist.network.reputation += points || 25;
        break;
      case 'collaboration_started':
        artist.network.reputation += points || 10;
        break;
      case 'group_contribution':
        artist.network.reputation += points || 5;
        break;
      case 'negative_review':
        artist.network.reputation -= points || 25;
        break;
      case 'project_abandoned':
        artist.network.reputation -= points || 30;
        break;
    }
    
    // Ensure reputation doesn't go below 0
    artist.network.reputation = Math.max(0, artist.network.reputation);
    
    // Check for reputation milestones
    this.checkReputationMilestones(artistId, oldReputation, artist.network.reputation);
    
    return artist.network.reputation;
  }

  // Achievement system
  checkReputationMilestones(artistId, oldRep, newRep) {
    const milestones = [
      { threshold: 100, badge: 'newcomer', title: 'Platform Newcomer' },
      { threshold: 500, badge: 'collaborator', title: 'Active Collaborator' },
      { threshold: 1000, badge: 'veteran', title: 'Platform Veteran' },
      { threshold: 2000, badge: 'expert', title: 'Collaboration Expert' },
      { threshold: 5000, badge: 'legend', title: 'Platform Legend' }
    ];
    
    const artist = this.connections.get(artistId);
    if (!artist) return;
    
    if (!this.achievements.has(artistId)) {
      this.achievements.set(artistId, new Set());
    }
    
    const achievements = this.achievements.get(artistId);
    
    for (const milestone of milestones) {
      if (newRep >= milestone.threshold && oldRep < milestone.threshold) {
        achievements.add(milestone.badge);
        
        this.emit('achievementUnlocked', {
          artistId,
          achievement: milestone,
          newReputation: newRep
        });
      }
    }
  }

  // Helper methods
  calculateGenreOverlap(genres1, genres2) {
    const intersection = genres1.filter(g => genres2.includes(g));
    const union = [...new Set([...genres1, ...genres2])];
    return union.length > 0 ? (intersection.length / union.length) * 100 : 0;
  }

  calculateSkillComplementarity(skills1, skills2) {
    const unique1 = skills1.filter(s => !skills2.includes(s));
    const unique2 = skills2.filter(s => !skills1.includes(s));
    const totalUnique = unique1.length + unique2.length;
    const totalSkills = skills1.length + skills2.length;
    
    return totalSkills > 0 ? (totalUnique / totalSkills) * 100 : 0;
  }

  calculateExperienceAlignment(exp1, exp2) {
    const levels = ['beginner', 'intermediate', 'advanced', 'professional'];
    const diff = Math.abs(levels.indexOf(exp1) - levels.indexOf(exp2));
    return Math.max(0, 100 - (diff * 25));
  }

  calculateLocationScore(loc1, loc2) {
    if (loc1 === loc2) return 100;
    // In production, use geographical distance calculation
    return 50; // Assume different locations but same country
  }

  calculateAvailabilityMatch(avail1, avail2) {
    const compatibilityMatrix = {
      'full-time': { 'full-time': 100, 'part-time': 70, 'occasional': 30 },
      'part-time': { 'full-time': 70, 'part-time': 100, 'occasional': 60 },
      'occasional': { 'full-time': 30, 'part-time': 60, 'occasional': 100 }
    };
    
    return compatibilityMatrix[avail1]?.[avail2] || 50;
  }

  getCollaborationHistoryBonus(artist1Id, artist2Id) {
    // Check if they've collaborated before
    // In production, query collaboration history
    return 0; // No previous collaboration
  }

  calculateReputationScore(rep1, rep2) {
    const avgReputation = (rep1 + rep2) / 2;
    return Math.min(100, avgReputation / 50); // Scale to 0-100
  }

  calculatePreferenceAlignment(prefs1, prefs2) {
    let alignment = 0;
    let total = 0;
    
    for (const key in prefs1) {
      if (key in prefs2) {
        total++;
        if (prefs1[key] === prefs2[key]) {
          alignment++;
        }
      }
    }
    
    return total > 0 ? (alignment / total) * 100 : 50;
  }

  calculateNetworkScore(artist) {
    const connectionScore = Math.min(100, artist.network.connections.size * 5);
    const reputationScore = Math.min(100, artist.network.reputation / 10);
    const activityScore = Math.min(100, artist.network.completedProjects * 10);
    
    return Math.round((connectionScore + reputationScore + activityScore) / 3);
  }

  getCompatibilityRecommendation(score) {
    if (score >= 80) return 'Excellent match - highly recommended';
    if (score >= 60) return 'Good match - worth connecting';
    if (score >= 40) return 'Moderate match - consider carefully';
    return 'Low match - may require significant effort';
  }

  identifyStrengthAreas(factors) {
    return Object.entries(factors)
      .filter(([key, value]) => value >= 70)
      .map(([key]) => key);
  }

  identifyImprovementAreas(factors) {
    return Object.entries(factors)
      .filter(([key, value]) => value < 50)
      .map(([key]) => key);
  }

  suggestCollaborationTypes(artist1, artist2) {
    const suggestions = [];
    
    // Based on skill overlap and complementarity
    const skillOverlap = artist1.skills.filter(s => artist2.skills.includes(s));
    const skillComplement = [...artist1.skills, ...artist2.skills].filter((s, i, arr) => arr.indexOf(s) === i);
    
    if (skillOverlap.includes('songwriting')) {
      suggestions.push({ type: 'song', reason: 'Both have songwriting skills' });
    }
    
    if (skillComplement.includes('vocals') && skillComplement.includes('production')) {
      suggestions.push({ type: 'single', reason: 'Complementary vocal and production skills' });
    }
    
    return suggestions;
  }

  findMutualConnections(artist1Id, artist2Id) {
    const artist1 = this.connections.get(artist1Id);
    const artist2 = this.connections.get(artist2Id);
    
    if (!artist1 || !artist2) return [];
    
    return [...artist1.network.connections].filter(id => 
      artist2.network.connections.has(id)
    );
  }

  getLastCollaboration(artist1Id, artist2Id) {
    // In production, query collaboration history
    return null;
  }

  checkGroupEligibility(artist, group) {
    const criteria = group.criteria;
    
    // Check genre requirements
    if (criteria.genres.length > 0) {
      const hasMatchingGenre = criteria.genres.some(g => artist.genres.includes(g));
      if (!hasMatchingGenre) {
        return { canJoin: false, reason: 'Genre requirements not met' };
      }
    }
    
    // Check skill requirements
    if (criteria.skills.length > 0) {
      const hasMatchingSkill = criteria.skills.some(s => artist.skills.includes(s));
      if (!hasMatchingSkill) {
        return { canJoin: false, reason: 'Skill requirements not met' };
      }
    }
    
    // Check experience requirements
    if (criteria.experience.length > 0) {
      if (!criteria.experience.includes(artist.experience)) {
        return { canJoin: false, reason: 'Experience level requirements not met' };
      }
    }
    
    // Check location requirements
    if (criteria.location && artist.location !== criteria.location) {
      return { canJoin: false, reason: 'Location requirements not met' };
    }
    
    return { canJoin: true };
  }

  createChatRoom(title) {
    // Integration with chat system
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async grantProjectAccess(artistId, projectId) {
    // Grant access to project files, chat, etc.
    console.log(`Granting access to project ${projectId} for artist ${artistId}`);
  }
}

module.exports = ArtistCollaborationNetwork;