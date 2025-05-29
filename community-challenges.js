const { EventEmitter } = require('events');

class CommunityChallengesTool extends EventEmitter {
  constructor(config) {
    super();
    this.challenges = new Map();
    this.contests = new Map();
    this.submissions = new Map();
    this.participants = new Map();
    this.rewards = new Map();
    this.leaderboards = new Map();
    this.analytics = new Map();
    this.config = config;
    
    this.initializeChallengeTemplates();
  }

  initializeChallengeTemplates() {
    const templates = [
      {
        id: 'cover_song_challenge',
        name: 'Cover Song Challenge',
        type: 'music_creation',
        description: 'Create your own cover version of the featured song',
        rules: [
          'Must be your original recording/performance',
          'Minimum 30 seconds, maximum 3 minutes',
          'Any genre/style interpretation allowed',
          'Credit original artist in submission'
        ],
        duration: 14, // days
        maxParticipants: 500,
        submissionTypes: ['audio', 'video'],
        judgingCriteria: ['creativity', 'technical_skill', 'originality', 'audience_appeal']
      },
      {
        id: 'remix_contest',
        name: 'Remix Contest',
        type: 'music_production',
        description: 'Create an official remix using provided stems',
        rules: [
          'Use only provided stems and samples',
          'Final track must be 2-6 minutes long',
          'Submit high-quality WAV or FLAC',
          'Include production notes'
        ],
        duration: 21,
        maxParticipants: 200,
        submissionTypes: ['audio'],
        judgingCriteria: ['production_quality', 'creativity', 'danceability', 'originality']
      },
      {
        id: 'music_video_challenge',
        name: 'Music Video Challenge',
        type: 'visual_content',
        description: 'Create a music video for the featured track',
        rules: [
          'Use the original track audio',
          'Video must be 30 seconds to full song length',
          'HD quality minimum (1080p)',
          'Original content only'
        ],
        duration: 28,
        maxParticipants: 100,
        submissionTypes: ['video'],
        judgingCriteria: ['visual_creativity', 'storytelling', 'technical_quality', 'concept_execution']
      },
      {
        id: 'lyrics_writing',
        name: 'Lyrics Writing Challenge',
        type: 'songwriting',
        description: 'Write original lyrics to the provided instrumental',
        rules: [
          'Original lyrics only',
          'Must fit the provided instrumental',
          'Include a demo recording if possible',
          'Explain your creative process'
        ],
        duration: 10,
        maxParticipants: 1000,
        submissionTypes: ['text', 'audio'],
        judgingCriteria: ['lyrical_content', 'flow', 'theme_relevance', 'emotional_impact']
      }
    ];

    templates.forEach(template => {
      this.challenges.set(template.id, template);
    });
  }

  async createChallenge(artistId, challengeData) {
    const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const challenge = {
      id: challengeId,
      artistId,
      title: challengeData.title,
      description: challengeData.description,
      type: challengeData.type, // 'music_creation', 'music_production', 'visual_content', 'songwriting', 'social_media'
      category: challengeData.category || 'general',
      
      timeline: {
        startDate: new Date(challengeData.startDate),
        endDate: new Date(challengeData.endDate),
        submissionDeadline: new Date(challengeData.submissionDeadline || challengeData.endDate),
        votingStartDate: new Date(challengeData.votingStartDate || challengeData.endDate),
        votingEndDate: new Date(challengeData.votingEndDate || new Date(challengeData.endDate).getTime() + 3 * 24 * 60 * 60 * 1000),
        announcementDate: new Date(challengeData.announcementDate || new Date(challengeData.endDate).getTime() + 5 * 24 * 60 * 60 * 1000)
      },
      
      rules: challengeData.rules || [],
      requirements: {
        submissionTypes: challengeData.submissionTypes || ['audio', 'video', 'image', 'text'],
        maxFileSize: challengeData.maxFileSize || 100, // MB
        minDuration: challengeData.minDuration || null,
        maxDuration: challengeData.maxDuration || null,
        eligibility: challengeData.eligibility || 'all' // 'all', 'verified_artists', 'premium_members'
      },
      
      prizes: {
        1: challengeData.prizes?.first || { type: 'cash', amount: 1000, description: 'First Place Winner' },
        2: challengeData.prizes?.second || { type: 'cash', amount: 500, description: 'Second Place' },
        3: challengeData.prizes?.third || { type: 'cash', amount: 250, description: 'Third Place' },
        participationReward: challengeData.prizes?.participation || null
      },
      
      judging: {
        method: challengeData.judgingMethod || 'hybrid', // 'artist_only', 'community_vote', 'hybrid', 'panel'
        criteria: challengeData.judgingCriteria || ['creativity', 'technical_skill', 'originality'],
        weightings: challengeData.criteriaWeights || { artist: 50, community: 50 },
        panelJudges: challengeData.panelJudges || []
      },
      
      featured: {
        track: challengeData.featuredTrack || null,
        stems: challengeData.stems || [],
        assets: challengeData.assets || [],
        guidelines: challengeData.guidelines || null
      },
      
      status: 'draft', // 'draft', 'upcoming', 'active', 'submission_closed', 'voting', 'completed', 'cancelled'
      participants: [],
      submissions: [],
      totalPrizePool: Object.values(challengeData.prizes || {}).reduce((sum, prize) => 
        sum + (typeof prize === 'object' && prize.amount ? prize.amount : 0), 0),
      
      metrics: {
        views: 0,
        participants: 0,
        submissions: 0,
        totalVotes: 0,
        socialShares: 0,
        mediaGenerated: 0
      },
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.challenges.set(challengeId, challenge);
    this.initializeChallengeAnalytics(challengeId, artistId);
    
    this.emit('challengeCreated', { challengeId, artistId, challenge });
    return { success: true, challengeId, challenge };
  }

  initializeChallengeAnalytics(challengeId, artistId) {
    const analytics = {
      challengeId,
      artistId,
      dailyMetrics: [],
      participantDemographics: {},
      submissionTypes: {},
      engagementMetrics: {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0
      },
      conversionRates: {
        viewToParticipation: 0,
        participationToSubmission: 0
      },
      topSubmissions: [],
      createdAt: new Date()
    };

    this.analytics.set(challengeId, analytics);
  }

  async launchChallenge(challengeId) {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      return { success: false, error: 'Challenge not found' };
    }

    if (challenge.status !== 'draft' && challenge.status !== 'upcoming') {
      return { success: false, error: 'Challenge cannot be launched' };
    }

    const now = new Date();
    if (challenge.timeline.startDate <= now) {
      challenge.status = 'active';
    } else {
      challenge.status = 'upcoming';
      
      setTimeout(() => {
        challenge.status = 'active';
        this.emit('challengeActivated', { challengeId });
      }, challenge.timeline.startDate.getTime() - now.getTime());
    }

    setTimeout(() => {
      challenge.status = 'submission_closed';
      this.emit('submissionPeriodEnded', { challengeId });
      
      if (challenge.judging.method === 'community_vote' || challenge.judging.method === 'hybrid') {
        setTimeout(() => {
          challenge.status = 'voting';
          this.emit('votingStarted', { challengeId });
        }, challenge.timeline.votingStartDate.getTime() - challenge.timeline.submissionDeadline.getTime());
      }
    }, challenge.timeline.submissionDeadline.getTime() - now.getTime());

    challenge.updatedAt = new Date();
    this.emit('challengeLaunched', { challengeId, status: challenge.status });
    return { success: true, challenge };
  }

  async joinChallenge(challengeId, userId, userProfile) {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      return { success: false, error: 'Challenge not found' };
    }

    if (challenge.status !== 'active') {
      return { success: false, error: 'Challenge is not active' };
    }

    if (challenge.participants.length >= challenge.maxParticipants) {
      return { success: false, error: 'Challenge is full' };
    }

    if (challenge.participants.some(p => p.userId === userId)) {
      return { success: false, error: 'Already participating in this challenge' };
    }

    if (!this.checkEligibility(challenge, userProfile)) {
      return { success: false, error: 'Not eligible for this challenge' };
    }

    const participant = {
      userId,
      username: userProfile.username,
      joinedAt: new Date(),
      submissions: [],
      votes: [],
      profile: {
        location: userProfile.location,
        experienceLevel: userProfile.experienceLevel,
        genres: userProfile.genres || []
      }
    };

    challenge.participants.push(participant);
    challenge.metrics.participants++;
    challenge.updatedAt = new Date();

    this.participants.set(`${challengeId}_${userId}`, participant);
    this.updateParticipantDemographics(challengeId, userProfile);

    this.emit('participantJoined', { challengeId, userId, participant });
    return { success: true, participant };
  }

  checkEligibility(challenge, userProfile) {
    switch (challenge.requirements.eligibility) {
      case 'verified_artists':
        return userProfile.verified === true;
      case 'premium_members':
        return userProfile.subscriptionType === 'premium' || userProfile.subscriptionType === 'pro';
      case 'all':
      default:
        return true;
    }
  }

  updateParticipantDemographics(challengeId, userProfile) {
    const analytics = this.analytics.get(challengeId);
    if (!analytics) return;

    if (userProfile.location) {
      if (!analytics.participantDemographics.countries) {
        analytics.participantDemographics.countries = {};
      }
      analytics.participantDemographics.countries[userProfile.location] = 
        (analytics.participantDemographics.countries[userProfile.location] || 0) + 1;
    }

    if (userProfile.experienceLevel) {
      if (!analytics.participantDemographics.experienceLevels) {
        analytics.participantDemographics.experienceLevels = {};
      }
      analytics.participantDemographics.experienceLevels[userProfile.experienceLevel] = 
        (analytics.participantDemographics.experienceLevels[userProfile.experienceLevel] || 0) + 1;
    }

    if (userProfile.genres) {
      if (!analytics.participantDemographics.genres) {
        analytics.participantDemographics.genres = {};
      }
      userProfile.genres.forEach(genre => {
        analytics.participantDemographics.genres[genre] = 
          (analytics.participantDemographics.genres[genre] || 0) + 1;
      });
    }
  }

  async submitEntry(challengeId, userId, submissionData) {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      return { success: false, error: 'Challenge not found' };
    }

    if (challenge.status !== 'active') {
      return { success: false, error: 'Submission period has ended' };
    }

    const participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) {
      return { success: false, error: 'Not participating in this challenge' };
    }

    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const submission = {
      id: submissionId,
      challengeId,
      userId,
      title: submissionData.title,
      description: submissionData.description,
      type: submissionData.type, // 'audio', 'video', 'image', 'text'
      files: submissionData.files || [],
      metadata: {
        duration: submissionData.duration,
        fileSize: submissionData.fileSize,
        format: submissionData.format,
        originalTrack: submissionData.originalTrack,
        genre: submissionData.genre,
        bpm: submissionData.bpm,
        key: submissionData.key
      },
      socialLinks: submissionData.socialLinks || [],
      tags: submissionData.tags || [],
      
      status: 'submitted', // 'submitted', 'under_review', 'approved', 'rejected'
      
      voting: {
        communityVotes: 0,
        communityScore: 0,
        artistScore: null,
        panelScores: {},
        finalScore: 0
      },
      
      engagement: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        downloads: 0
      },
      
      submittedAt: new Date(),
      updatedAt: new Date()
    };

    this.submissions.set(submissionId, submission);
    challenge.submissions.push(submissionId);
    participant.submissions.push(submissionId);
    challenge.metrics.submissions++;

    const analytics = this.analytics.get(challengeId);
    if (analytics) {
      if (!analytics.submissionTypes[submissionData.type]) {
        analytics.submissionTypes[submissionData.type] = 0;
      }
      analytics.submissionTypes[submissionData.type]++;
      
      analytics.conversionRates.participationToSubmission = 
        challenge.metrics.submissions / challenge.metrics.participants;
    }

    this.emit('submissionReceived', { challengeId, submissionId, userId, submission });
    return { success: true, submissionId, submission };
  }

  async voteOnSubmission(challengeId, submissionId, voterId, voteData) {
    const challenge = this.challenges.get(challengeId);
    const submission = this.submissions.get(submissionId);
    
    if (!challenge || !submission) {
      return { success: false, error: 'Challenge or submission not found' };
    }

    if (challenge.status !== 'voting' && challenge.judging.method === 'community_vote') {
      return { success: false, error: 'Voting period is not active' };
    }

    if (submission.userId === voterId) {
      return { success: false, error: 'Cannot vote on your own submission' };
    }

    const existingVote = submission.voting.votes?.find(v => v.voterId === voterId);
    if (existingVote) {
      return { success: false, error: 'Already voted on this submission' };
    }

    const vote = {
      voterId,
      score: voteData.score, // 1-10 scale
      criteria: voteData.criteria || {}, // individual criterion scores
      comment: voteData.comment || null,
      votedAt: new Date()
    };

    if (!submission.voting.votes) {
      submission.voting.votes = [];
    }
    
    submission.voting.votes.push(vote);
    submission.voting.communityVotes++;
    submission.voting.communityScore = submission.voting.votes.reduce((sum, v) => sum + v.score, 0) / submission.voting.votes.length;
    
    challenge.metrics.totalVotes++;
    submission.updatedAt = new Date();

    this.emit('voteReceived', { challengeId, submissionId, voterId, vote });
    return { success: true, vote, newScore: submission.voting.communityScore };
  }

  async artistJudgeSubmission(challengeId, submissionId, artistId, judgeData) {
    const challenge = this.challenges.get(challengeId);
    const submission = this.submissions.get(submissionId);
    
    if (!challenge || !submission) {
      return { success: false, error: 'Challenge or submission not found' };
    }

    if (challenge.artistId !== artistId) {
      return { success: false, error: 'Not authorized to judge this challenge' };
    }

    submission.voting.artistScore = {
      overallScore: judgeData.overallScore,
      criteriaScores: judgeData.criteriaScores || {},
      feedback: judgeData.feedback || null,
      highlight: judgeData.highlight || false,
      judgedAt: new Date()
    };

    this.calculateFinalScore(submission, challenge);
    submission.updatedAt = new Date();

    this.emit('artistJudgment', { challengeId, submissionId, artistId, score: judgeData.overallScore });
    return { success: true, artistScore: submission.voting.artistScore, finalScore: submission.voting.finalScore };
  }

  calculateFinalScore(submission, challenge) {
    const weights = challenge.judging.weightings;
    let finalScore = 0;

    if (challenge.judging.method === 'community_vote') {
      finalScore = submission.voting.communityScore;
    } else if (challenge.judging.method === 'artist_only') {
      finalScore = submission.voting.artistScore?.overallScore || 0;
    } else if (challenge.judging.method === 'hybrid') {
      const communityWeight = weights.community / 100;
      const artistWeight = weights.artist / 100;
      
      finalScore = (submission.voting.communityScore * communityWeight) + 
                   ((submission.voting.artistScore?.overallScore || 0) * artistWeight);
    } else if (challenge.judging.method === 'panel') {
      const panelScores = Object.values(submission.voting.panelScores || {});
      if (panelScores.length > 0) {
        finalScore = panelScores.reduce((sum, score) => sum + score.overallScore, 0) / panelScores.length;
      }
    }

    submission.voting.finalScore = finalScore;
  }

  async completeChallenge(challengeId) {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      return { success: false, error: 'Challenge not found' };
    }

    if (challenge.status !== 'voting' && challenge.status !== 'submission_closed') {
      return { success: false, error: 'Challenge is not ready for completion' };
    }

    const allSubmissions = challenge.submissions.map(id => this.submissions.get(id)).filter(Boolean);
    
    allSubmissions.forEach(submission => {
      this.calculateFinalScore(submission, challenge);
    });

    const winners = allSubmissions
      .sort((a, b) => b.voting.finalScore - a.voting.finalScore)
      .slice(0, 3);

    const results = {
      winners: {
        1: winners[0] || null,
        2: winners[1] || null,
        3: winners[2] || null
      },
      totalSubmissions: allSubmissions.length,
      totalParticipants: challenge.participants.length,
      totalVotes: challenge.metrics.totalVotes,
      completedAt: new Date()
    };

    challenge.results = results;
    challenge.status = 'completed';
    challenge.updatedAt = new Date();

    await this.distributePrizes(challengeId, winners);
    this.generateChallengeReport(challengeId);

    this.emit('challengeCompleted', { challengeId, results });
    return { success: true, challenge, results };
  }

  async distributePrizes(challengeId, winners) {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return;

    const prizeDistribution = [];

    winners.forEach((winner, index) => {
      if (winner && challenge.prizes[index + 1]) {
        const prize = challenge.prizes[index + 1];
        const distribution = {
          submissionId: winner.id,
          userId: winner.userId,
          position: index + 1,
          prize: prize,
          distributedAt: new Date(),
          status: 'pending' // 'pending', 'distributed', 'failed'
        };

        prizeDistribution.push(distribution);
        
        setTimeout(() => {
          distribution.status = 'distributed';
          this.emit('prizeDistributed', { challengeId, distribution });
        }, 1000 * (index + 1));
      }
    });

    if (challenge.prizes.participationReward) {
      challenge.participants.forEach(participant => {
        if (participant.submissions.length > 0) {
          const distribution = {
            userId: participant.userId,
            position: 'participant',
            prize: challenge.prizes.participationReward,
            distributedAt: new Date(),
            status: 'distributed'
          };
          prizeDistribution.push(distribution);
        }
      });
    }

    this.rewards.set(challengeId, prizeDistribution);
    return prizeDistribution;
  }

  generateChallengeReport(challengeId) {
    const challenge = this.challenges.get(challengeId);
    const analytics = this.analytics.get(challengeId);
    
    if (!challenge || !analytics) return;

    const report = {
      challengeId,
      summary: {
        title: challenge.title,
        type: challenge.type,
        duration: Math.ceil((challenge.timeline.endDate - challenge.timeline.startDate) / (1000 * 60 * 60 * 24)),
        totalParticipants: challenge.participants.length,
        totalSubmissions: challenge.submissions.length,
        completionRate: challenge.submissions.length / challenge.participants.length,
        totalVotes: challenge.metrics.totalVotes,
        avgVotesPerSubmission: challenge.metrics.totalVotes / challenge.submissions.length
      },
      demographics: analytics.participantDemographics,
      engagement: {
        peakParticipationDay: null, // Would be calculated from daily metrics
        mostPopularSubmissionType: Object.keys(analytics.submissionTypes).reduce((a, b) => 
          analytics.submissionTypes[a] > analytics.submissionTypes[b] ? a : b, ''),
        avgSubmissionsPerParticipant: challenge.submissions.length / challenge.participants.length
      },
      winners: challenge.results.winners,
      recommendations: this.generateRecommendations(challenge, analytics),
      generatedAt: new Date()
    };

    this.emit('reportGenerated', { challengeId, report });
    return report;
  }

  generateRecommendations(challenge, analytics) {
    const recommendations = [];

    if (challenge.participants.length < 50) {
      recommendations.push('Consider promoting challenges more widely to increase participation');
    }

    if (challenge.submissions.length / challenge.participants.length < 0.5) {
      recommendations.push('Simplify submission requirements to improve completion rates');
    }

    if (challenge.metrics.totalVotes / challenge.submissions.length < 10) {
      recommendations.push('Add incentives for community voting to increase engagement');
    }

    const topSubmissionType = Object.keys(analytics.submissionTypes).reduce((a, b) => 
      analytics.submissionTypes[a] > analytics.submissionTypes[b] ? a : b, '');
    
    if (topSubmissionType) {
      recommendations.push(`Focus future challenges on ${topSubmissionType} content as it's most popular`);
    }

    return recommendations;
  }

  async getChallengeAnalytics(challengeId) {
    const challenge = this.challenges.get(challengeId);
    const analytics = this.analytics.get(challengeId);
    
    if (!challenge || !analytics) {
      return { success: false, error: 'Challenge or analytics not found' };
    }

    return {
      success: true,
      analytics: {
        challenge: {
          id: challengeId,
          title: challenge.title,
          status: challenge.status,
          metrics: challenge.metrics
        },
        participation: {
          demographics: analytics.participantDemographics,
          conversionRates: analytics.conversionRates,
          submissionBreakdown: analytics.submissionTypes
        },
        engagement: analytics.engagementMetrics,
        topSubmissions: analytics.topSubmissions
      }
    };
  }

  async getActiveChallenges(artistId = null) {
    const activeChallenges = Array.from(this.challenges.values())
      .filter(c => {
        const statusFilter = ['upcoming', 'active', 'voting'].includes(c.status);
        const artistFilter = artistId ? c.artistId === artistId : true;
        return statusFilter && artistFilter;
      })
      .sort((a, b) => new Date(a.timeline.startDate) - new Date(b.timeline.startDate));

    return { success: true, challenges: activeChallenges };
  }
}

module.exports = CommunityChallengesTool;