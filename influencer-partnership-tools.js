const { EventEmitter } = require('events');

class InfluencerPartnershipTools extends EventEmitter {
  constructor(config) {
    super();
    this.partnerships = new Map();
    this.campaigns = new Map();
    this.influencers = new Map();
    this.contracts = new Map();
    this.payments = new Map();
    this.analytics = new Map();
    this.templates = new Map();
    this.config = config;
    
    this.initializeContractTemplates();
  }

  initializeContractTemplates() {
    const defaultTemplates = [
      {
        id: 'music_promotion',
        name: 'Music Promotion Campaign',
        type: 'promotion',
        terms: {
          deliverables: ['Instagram post', 'Story mention', 'Song feature in content'],
          timeline: '7 days',
          exclusivity: 'Non-exclusive',
          usage_rights: 'Perpetual license for promotional use',
          payment_structure: 'Fixed fee + performance bonus'
        }
      },
      {
        id: 'playlist_placement',
        name: 'Playlist Feature Agreement',
        type: 'playlist',
        terms: {
          deliverables: ['Playlist inclusion', 'Playlist promotion', 'Social media mention'],
          timeline: '30 days minimum',
          exclusivity: 'Exclusive for genre',
          usage_rights: 'Streaming rights only',
          payment_structure: 'Revenue share'
        }
      },
      {
        id: 'content_collaboration',
        name: 'Content Collaboration',
        type: 'collaboration',
        terms: {
          deliverables: ['Original content creation', 'Cross-promotion', 'Behind-the-scenes content'],
          timeline: '14 days',
          exclusivity: 'Exclusive during campaign',
          usage_rights: 'Shared ownership',
          payment_structure: 'Profit sharing'
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async discoverInfluencers(criteria) {
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const discoveryResults = {
      id: searchId,
      criteria: {
        genre: criteria.genre || 'any',
        followerRange: criteria.followerRange || { min: 1000, max: 1000000 },
        platform: criteria.platform || 'instagram',
        location: criteria.location || 'any',
        engagementRate: criteria.engagementRate || { min: 2.0 },
        budget: criteria.budget || { min: 100, max: 5000 }
      },
      results: this.generateMockInfluencers(criteria),
      searchedAt: new Date()
    };

    this.emit('influencersDiscovered', { searchId, resultCount: discoveryResults.results.length });
    return { success: true, searchId, results: discoveryResults };
  }

  generateMockInfluencers(criteria) {
    const genres = ['pop', 'rock', 'hip-hop', 'electronic', 'indie', 'folk', 'jazz', 'classical'];
    const platforms = ['instagram', 'tiktok', 'youtube', 'twitter'];
    
    const influencers = [];
    const count = Math.floor(Math.random() * 20) + 10;

    for (let i = 0; i < count; i++) {
      const followersMin = criteria.followerRange?.min || 1000;
      const followersMax = criteria.followerRange?.max || 1000000;
      const followers = Math.floor(Math.random() * (followersMax - followersMin)) + followersMin;
      
      const influencer = {
        id: `inf_${Date.now()}_${i}`,
        username: `@musiclover${Math.floor(Math.random() * 10000)}`,
        displayName: `Music Influencer ${i + 1}`,
        platform: criteria.platform || platforms[Math.floor(Math.random() * platforms.length)],
        followers: followers,
        engagementRate: (Math.random() * 8 + 1).toFixed(1),
        averageLikes: Math.floor(followers * 0.05),
        averageComments: Math.floor(followers * 0.01),
        genres: [criteria.genre || genres[Math.floor(Math.random() * genres.length)]],
        location: criteria.location || 'United States',
        verifiedAccount: followers > 50000,
        profileImage: `https://example.com/profile${i}.jpg`,
        bio: 'Music enthusiast and content creator',
        recentPosts: Math.floor(Math.random() * 10) + 1,
        mediaKit: {
          rates: {
            post: Math.floor(followers * 0.01),
            story: Math.floor(followers * 0.005),
            reel: Math.floor(followers * 0.015)
          },
          demographics: {
            ageRange: '18-34',
            topCountries: ['US', 'UK', 'Canada'],
            genderSplit: { male: 45, female: 55 }
          }
        },
        contactInfo: {
          email: `contact${i}@example.com`,
          businessInquiries: true
        },
        collaborationHistory: Math.floor(Math.random() * 20),
        rating: (Math.random() * 2 + 3).toFixed(1),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        matchScore: (Math.random() * 40 + 60).toFixed(0)
      };

      influencers.push(influencer);
    }

    return influencers.sort((a, b) => b.matchScore - a.matchScore);
  }

  async createPartnership(artistId, influencerId, partnershipData) {
    const partnershipId = `partnership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const partnership = {
      id: partnershipId,
      artistId,
      influencerId,
      campaign: {
        name: partnershipData.campaignName,
        type: partnershipData.campaignType, // 'music_promotion', 'playlist_placement', 'content_collaboration'
        objectives: partnershipData.objectives || [],
        targetAudience: partnershipData.targetAudience || {}
      },
      contract: {
        templateId: partnershipData.contractTemplate,
        customTerms: partnershipData.customTerms || {},
        deliverables: partnershipData.deliverables || [],
        timeline: {
          startDate: new Date(partnershipData.startDate),
          endDate: new Date(partnershipData.endDate),
          milestones: partnershipData.milestones || []
        },
        compensation: {
          type: partnershipData.compensationType, // 'fixed', 'performance', 'hybrid', 'revenue_share'
          baseAmount: partnershipData.baseAmount || 0,
          performanceBonus: partnershipData.performanceBonus || {},
          revenueSharePercentage: partnershipData.revenueShare || 0
        },
        exclusivity: partnershipData.exclusivity || 'non-exclusive',
        usageRights: partnershipData.usageRights || {}
      },
      status: 'pending', // 'pending', 'active', 'completed', 'cancelled', 'disputed'
      communications: [],
      deliverableTracking: {},
      metrics: {
        reach: 0,
        engagement: 0,
        conversions: 0,
        revenue: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.partnerships.set(partnershipId, partnership);
    this.emit('partnershipCreated', { partnershipId, artistId, influencerId });
    return { success: true, partnershipId, partnership };
  }

  async sendPartnershipProposal(partnershipId, proposalData) {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) {
      return { success: false, error: 'Partnership not found' };
    }

    const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const proposal = {
      id: proposalId,
      partnershipId,
      subject: proposalData.subject,
      message: proposalData.message,
      attachments: proposalData.attachments || [],
      contract: partnership.contract,
      mediaKit: proposalData.includeMediaKit || false,
      deadline: proposalData.deadline ? new Date(proposalData.deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'sent',
      sentAt: new Date()
    };

    partnership.communications.push({
      type: 'proposal_sent',
      data: proposal,
      timestamp: new Date()
    });

    partnership.status = 'proposal_sent';
    partnership.updatedAt = new Date();

    this.emit('proposalSent', { proposalId, partnershipId, proposal });
    return { success: true, proposalId, proposal };
  }

  async respondToProposal(partnershipId, response) {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) {
      return { success: false, error: 'Partnership not found' };
    }

    const responseData = {
      type: 'proposal_response',
      status: response.status, // 'accepted', 'rejected', 'counter_offer'
      message: response.message,
      counterOffer: response.counterOffer || null,
      timestamp: new Date()
    };

    partnership.communications.push(responseData);

    if (response.status === 'accepted') {
      partnership.status = 'active';
      await this.generateContract(partnershipId);
    } else if (response.status === 'rejected') {
      partnership.status = 'rejected';
    } else if (response.status === 'counter_offer') {
      partnership.status = 'negotiating';
      if (response.counterOffer) {
        Object.assign(partnership.contract, response.counterOffer);
      }
    }

    partnership.updatedAt = new Date();
    this.emit('proposalResponse', { partnershipId, response: responseData });
    return { success: true, partnership };
  }

  async generateContract(partnershipId) {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) {
      return { success: false, error: 'Partnership not found' };
    }

    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const template = this.templates.get(partnership.contract.templateId);

    const contract = {
      id: contractId,
      partnershipId,
      templateUsed: partnership.contract.templateId,
      parties: {
        artist: partnership.artistId,
        influencer: partnership.influencerId
      },
      terms: {
        ...template?.terms,
        ...partnership.contract.customTerms,
        deliverables: partnership.contract.deliverables,
        timeline: partnership.contract.timeline,
        compensation: partnership.contract.compensation,
        exclusivity: partnership.contract.exclusivity,
        usageRights: partnership.contract.usageRights
      },
      signatures: {
        artist: null,
        influencer: null
      },
      status: 'draft', // 'draft', 'pending_signatures', 'executed', 'terminated'
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days to sign
    };

    this.contracts.set(contractId, contract);
    partnership.contractId = contractId;

    this.emit('contractGenerated', { contractId, partnershipId });
    return { success: true, contractId, contract };
  }

  async trackDeliverable(partnershipId, deliverableData) {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) {
      return { success: false, error: 'Partnership not found' };
    }

    const deliverableId = `deliverable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const deliverable = {
      id: deliverableId,
      type: deliverableData.type, // 'instagram_post', 'story', 'reel', 'youtube_video', 'tiktok_video'
      title: deliverableData.title,
      description: deliverableData.description,
      url: deliverableData.url,
      platform: deliverableData.platform,
      publishedAt: new Date(deliverableData.publishedAt),
      metrics: {
        views: deliverableData.metrics?.views || 0,
        likes: deliverableData.metrics?.likes || 0,
        comments: deliverableData.metrics?.comments || 0,
        shares: deliverableData.metrics?.shares || 0,
        reach: deliverableData.metrics?.reach || 0,
        impressions: deliverableData.metrics?.impressions || 0
      },
      approved: false,
      feedback: null,
      submittedAt: new Date()
    };

    if (!partnership.deliverableTracking[deliverableData.type]) {
      partnership.deliverableTracking[deliverableData.type] = [];
    }
    
    partnership.deliverableTracking[deliverableData.type].push(deliverable);
    partnership.updatedAt = new Date();

    this.updatePartnershipMetrics(partnershipId, deliverable.metrics);
    this.emit('deliverableSubmitted', { partnershipId, deliverableId, deliverable });
    return { success: true, deliverableId, deliverable };
  }

  updatePartnershipMetrics(partnershipId, newMetrics) {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) return;

    partnership.metrics.reach += newMetrics.reach || 0;
    partnership.metrics.engagement += (newMetrics.likes || 0) + (newMetrics.comments || 0) + (newMetrics.shares || 0);
    
    const analytics = this.analytics.get(partnership.artistId) || {
      totalPartnerships: 0,
      activePartnerships: 0,
      totalReach: 0,
      totalEngagement: 0,
      totalSpent: 0,
      averageROI: 0,
      topInfluencers: [],
      performanceByPlatform: {}
    };

    analytics.totalReach += newMetrics.reach || 0;
    analytics.totalEngagement += (newMetrics.likes || 0) + (newMetrics.comments || 0) + (newMetrics.shares || 0);
    
    this.analytics.set(partnership.artistId, analytics);
  }

  async approveDeliverable(partnershipId, deliverableId, feedback) {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) {
      return { success: false, error: 'Partnership not found' };
    }

    let deliverable = null;
    let found = false;

    for (const [type, deliverables] of Object.entries(partnership.deliverableTracking)) {
      const index = deliverables.findIndex(d => d.id === deliverableId);
      if (index !== -1) {
        deliverable = deliverables[index];
        deliverable.approved = true;
        deliverable.feedback = feedback;
        deliverable.approvedAt = new Date();
        found = true;
        break;
      }
    }

    if (!found) {
      return { success: false, error: 'Deliverable not found' };
    }

    const allDeliverables = Object.values(partnership.deliverableTracking).flat();
    const approvedCount = allDeliverables.filter(d => d.approved).length;
    const totalCount = allDeliverables.length;

    if (approvedCount === partnership.contract.deliverables.length) {
      partnership.status = 'deliverables_complete';
      await this.processPayment(partnershipId);
    }

    this.emit('deliverableApproved', { partnershipId, deliverableId, progress: approvedCount / totalCount });
    return { success: true, deliverable, progress: approvedCount / totalCount };
  }

  async processPayment(partnershipId) {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) {
      return { success: false, error: 'Partnership not found' };
    }

    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let amount = partnership.contract.compensation.baseAmount;
    
    if (partnership.contract.compensation.type === 'performance' || partnership.contract.compensation.type === 'hybrid') {
      const performanceBonus = this.calculatePerformanceBonus(partnership);
      amount += performanceBonus;
    }

    const payment = {
      id: paymentId,
      partnershipId,
      influencerId: partnership.influencerId,
      amount,
      currency: 'USD',
      type: partnership.contract.compensation.type,
      breakdown: {
        baseAmount: partnership.contract.compensation.baseAmount,
        performanceBonus: amount - partnership.contract.compensation.baseAmount,
        fees: amount * 0.029 // 2.9% processing fee
      },
      status: 'processing', // 'processing', 'completed', 'failed', 'refunded'
      scheduledDate: new Date(),
      processedAt: null,
      method: 'bank_transfer'
    };

    this.payments.set(paymentId, payment);
    partnership.paymentId = paymentId;
    partnership.status = 'payment_processing';

    setTimeout(() => {
      payment.status = 'completed';
      payment.processedAt = new Date();
      partnership.status = 'completed';
      this.emit('paymentCompleted', { paymentId, partnershipId, amount });
    }, 5000);

    this.emit('paymentInitiated', { paymentId, partnershipId, payment });
    return { success: true, paymentId, payment };
  }

  calculatePerformanceBonus(partnership) {
    const bonus = partnership.contract.compensation.performanceBonus;
    if (!bonus) return 0;

    let totalBonus = 0;
    
    if (bonus.reachThreshold && partnership.metrics.reach >= bonus.reachThreshold) {
      totalBonus += bonus.reachBonus || 0;
    }
    
    if (bonus.engagementThreshold && partnership.metrics.engagement >= bonus.engagementThreshold) {
      totalBonus += bonus.engagementBonus || 0;
    }
    
    if (bonus.conversionThreshold && partnership.metrics.conversions >= bonus.conversionThreshold) {
      totalBonus += bonus.conversionBonus || 0;
    }

    return totalBonus;
  }

  async getPartnershipAnalytics(artistId, timeframe = '30d') {
    const analytics = this.analytics.get(artistId) || {};
    
    const timeframeMs = timeframe === '30d' ? 30 * 24 * 60 * 60 * 1000 : 
                      timeframe === '90d' ? 90 * 24 * 60 * 60 * 1000 : 
                      365 * 24 * 60 * 60 * 1000;

    const cutoffDate = new Date(Date.now() - timeframeMs);
    const recentPartnerships = Array.from(this.partnerships.values())
      .filter(p => p.artistId === artistId && p.createdAt >= cutoffDate);

    const totalSpent = Array.from(this.payments.values())
      .filter(p => {
        const partnership = this.partnerships.get(p.partnershipId);
        return partnership && partnership.artistId === artistId && p.processedAt >= cutoffDate;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const platformStats = {};
    recentPartnerships.forEach(p => {
      const deliverables = Object.values(p.deliverableTracking).flat();
      deliverables.forEach(d => {
        if (!platformStats[d.platform]) {
          platformStats[d.platform] = { count: 0, reach: 0, engagement: 0 };
        }
        platformStats[d.platform].count++;
        platformStats[d.platform].reach += d.metrics.reach;
        platformStats[d.platform].engagement += d.metrics.likes + d.metrics.comments + d.metrics.shares;
      });
    });

    return {
      success: true,
      analytics: {
        timeframe,
        partnerships: {
          total: recentPartnerships.length,
          active: recentPartnerships.filter(p => p.status === 'active').length,
          completed: recentPartnerships.filter(p => p.status === 'completed').length,
          cancelled: recentPartnerships.filter(p => p.status === 'cancelled').length
        },
        performance: {
          totalReach: recentPartnerships.reduce((sum, p) => sum + p.metrics.reach, 0),
          totalEngagement: recentPartnerships.reduce((sum, p) => sum + p.metrics.engagement, 0),
          averageReach: recentPartnerships.length > 0 ? 
            recentPartnerships.reduce((sum, p) => sum + p.metrics.reach, 0) / recentPartnerships.length : 0,
          averageEngagement: recentPartnerships.length > 0 ? 
            recentPartnerships.reduce((sum, p) => sum + p.metrics.engagement, 0) / recentPartnerships.length : 0
        },
        financial: {
          totalSpent,
          averagePartnershipCost: recentPartnerships.length > 0 ? totalSpent / recentPartnerships.length : 0,
          costPerThousandReach: recentPartnerships.reduce((sum, p) => sum + p.metrics.reach, 0) > 0 ? 
            (totalSpent / recentPartnerships.reduce((sum, p) => sum + p.metrics.reach, 0)) * 1000 : 0
        },
        platformStats
      }
    };
  }

  async getActivePartnerships(artistId) {
    const activePartnerships = Array.from(this.partnerships.values())
      .filter(p => p.artistId === artistId && p.status === 'active')
      .sort((a, b) => new Date(a.contract.timeline.endDate) - new Date(b.contract.timeline.endDate));

    return { success: true, partnerships: activePartnerships };
  }

  async cancelPartnership(partnershipId, reason) {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) {
      return { success: false, error: 'Partnership not found' };
    }

    if (partnership.status === 'completed' || partnership.status === 'cancelled') {
      return { success: false, error: 'Partnership cannot be cancelled' };
    }

    partnership.status = 'cancelled';
    partnership.cancellationReason = reason;
    partnership.cancelledAt = new Date();
    partnership.updatedAt = new Date();

    this.emit('partnershipCancelled', { partnershipId, reason });
    return { success: true, partnership };
  }
}

module.exports = InfluencerPartnershipTools;