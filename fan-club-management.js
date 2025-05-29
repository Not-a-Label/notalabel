const { EventEmitter } = require('events');

class FanClubManagement extends EventEmitter {
  constructor(config) {
    super();
    this.fanClubs = new Map();
    this.memberships = new Map();
    this.subscriptions = new Map();
    this.exclusiveContent = new Map();
    this.perks = new Map();
    this.analytics = new Map();
    this.config = config;
  }

  async createFanClub(artistId, clubData) {
    const clubId = `club_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fanClub = {
      id: clubId,
      artistId,
      name: clubData.name,
      description: clubData.description,
      coverImage: clubData.coverImage,
      memberCount: 0,
      tiers: clubData.tiers || [
        {
          id: 'basic',
          name: 'Basic Fan',
          price: 5.00,
          monthlyPrice: 5.00,
          yearlyPrice: 50.00,
          features: ['Exclusive updates', 'Early access to content', 'Fan badge'],
          maxMembers: null
        },
        {
          id: 'premium',
          name: 'Super Fan',
          price: 15.00,
          monthlyPrice: 15.00,
          yearlyPrice: 150.00,
          features: ['All Basic features', 'Monthly video calls', 'Behind-the-scenes content', 'Merchandise discounts'],
          maxMembers: 500
        },
        {
          id: 'vip',
          name: 'VIP Fan',
          price: 50.00,
          monthlyPrice: 50.00,
          yearlyPrice: 500.00,
          features: ['All Premium features', 'Personal messages', 'Concert ticket priority', 'Signed merchandise'],
          maxMembers: 100
        }
      ],
      perks: clubData.perks || [],
      rules: clubData.rules || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.fanClubs.set(clubId, fanClub);
    this.analytics.set(clubId, {
      totalRevenue: 0,
      monthlyRevenue: 0,
      memberGrowth: [],
      engagementMetrics: {
        contentViews: 0,
        messagesSent: 0,
        eventsAttended: 0
      }
    });

    this.emit('fanClubCreated', { clubId, artistId, fanClub });
    return { success: true, clubId, fanClub };
  }

  async joinFanClub(userId, clubId, tierId, paymentMethod = 'monthly') {
    const fanClub = this.fanClubs.get(clubId);
    if (!fanClub) {
      return { success: false, error: 'Fan club not found' };
    }

    const tier = fanClub.tiers.find(t => t.id === tierId);
    if (!tier) {
      return { success: false, error: 'Tier not found' };
    }

    const currentTierMembers = Array.from(this.memberships.values())
      .filter(m => m.clubId === clubId && m.tierId === tierId && m.isActive).length;

    if (tier.maxMembers && currentTierMembers >= tier.maxMembers) {
      return { success: false, error: 'Tier is full' };
    }

    const membershipId = `membership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const price = paymentMethod === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;

    const membership = {
      id: membershipId,
      userId,
      clubId,
      tierId,
      tier: tier.name,
      price,
      paymentMethod,
      features: tier.features,
      joinedAt: new Date(),
      nextBillingDate: new Date(Date.now() + (paymentMethod === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
      isActive: true,
      totalSpent: price,
      engagementScore: 0
    };

    this.memberships.set(membershipId, membership);
    
    fanClub.memberCount++;
    fanClub.updatedAt = new Date();

    const analytics = this.analytics.get(clubId);
    analytics.totalRevenue += price;
    analytics.monthlyRevenue += paymentMethod === 'monthly' ? price : price / 12;
    analytics.memberGrowth.push({
      date: new Date(),
      count: fanClub.memberCount,
      tier: tierId
    });

    this.emit('memberJoined', { membershipId, userId, clubId, tierId, price });
    return { success: true, membershipId, membership };
  }

  async createExclusiveContent(artistId, clubId, contentData) {
    const contentId = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const content = {
      id: contentId,
      artistId,
      clubId,
      type: contentData.type, // 'video', 'audio', 'image', 'text', 'live_stream'
      title: contentData.title,
      description: contentData.description,
      url: contentData.url,
      thumbnailUrl: contentData.thumbnailUrl,
      requiredTier: contentData.requiredTier || 'basic',
      releaseDate: contentData.releaseDate || new Date(),
      isPublished: contentData.isPublished || true,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      duration: contentData.duration || null,
      tags: contentData.tags || [],
      createdAt: new Date()
    };

    this.exclusiveContent.set(contentId, content);
    
    const analytics = this.analytics.get(clubId);
    if (analytics) {
      analytics.engagementMetrics.contentViews = 0;
    }

    this.emit('exclusiveContentCreated', { contentId, clubId, content });
    return { success: true, contentId, content };
  }

  async scheduleLiveEvent(artistId, clubId, eventData) {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event = {
      id: eventId,
      artistId,
      clubId,
      type: eventData.type, // 'live_chat', 'video_call', 'listening_party', 'q_and_a'
      title: eventData.title,
      description: eventData.description,
      scheduledDate: new Date(eventData.scheduledDate),
      duration: eventData.duration || 60, // minutes
      maxAttendees: eventData.maxAttendees || null,
      requiredTier: eventData.requiredTier || 'basic',
      meetingLink: eventData.meetingLink || null,
      attendees: [],
      isActive: true,
      createdAt: new Date()
    };

    this.emit('liveEventScheduled', { eventId, clubId, event });
    return { success: true, eventId, event };
  }

  async sendFanClubMessage(artistId, clubId, messageData) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message = {
      id: messageId,
      artistId,
      clubId,
      content: messageData.content,
      type: messageData.type || 'text', // 'text', 'image', 'video', 'audio'
      targetTier: messageData.targetTier || 'all',
      isUrgent: messageData.isUrgent || false,
      sentAt: new Date(),
      readBy: [],
      reactions: {}
    };

    const fanClub = this.fanClubs.get(clubId);
    if (!fanClub) {
      return { success: false, error: 'Fan club not found' };
    }

    const eligibleMembers = Array.from(this.memberships.values())
      .filter(m => m.clubId === clubId && m.isActive);

    if (messageData.targetTier && messageData.targetTier !== 'all') {
      eligibleMembers = eligibleMembers.filter(m => m.tierId === messageData.targetTier);
    }

    const analytics = this.analytics.get(clubId);
    if (analytics) {
      analytics.engagementMetrics.messagesSent++;
    }

    this.emit('fanClubMessageSent', { messageId, clubId, message, recipientCount: eligibleMembers.length });
    return { success: true, messageId, message, recipientCount: eligibleMembers.length };
  }

  async createPerk(artistId, clubId, perkData) {
    const perkId = `perk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const perk = {
      id: perkId,
      artistId,
      clubId,
      title: perkData.title,
      description: perkData.description,
      type: perkData.type, // 'discount', 'early_access', 'exclusive_merch', 'meet_and_greet'
      value: perkData.value, // discount percentage, days early access, etc.
      requiredTier: perkData.requiredTier || 'basic',
      expiresAt: perkData.expiresAt ? new Date(perkData.expiresAt) : null,
      usageLimit: perkData.usageLimit || null,
      usedCount: 0,
      isActive: true,
      createdAt: new Date()
    };

    this.perks.set(perkId, perk);
    this.emit('perkCreated', { perkId, clubId, perk });
    return { success: true, perkId, perk };
  }

  async getFanClubAnalytics(clubId, timeframe = '30d') {
    const analytics = this.analytics.get(clubId);
    if (!analytics) {
      return { success: false, error: 'Analytics not found' };
    }

    const fanClub = this.fanClubs.get(clubId);
    const memberships = Array.from(this.memberships.values())
      .filter(m => m.clubId === clubId && m.isActive);

    const tierDistribution = {};
    fanClub.tiers.forEach(tier => {
      tierDistribution[tier.name] = memberships.filter(m => m.tierId === tier.id).length;
    });

    const revenueByTier = {};
    fanClub.tiers.forEach(tier => {
      const tierMembers = memberships.filter(m => m.tierId === tier.id);
      revenueByTier[tier.name] = tierMembers.reduce((sum, m) => sum + m.totalSpent, 0);
    });

    return {
      success: true,
      analytics: {
        ...analytics,
        membershipStats: {
          total: memberships.length,
          tierDistribution,
          averageEngagement: memberships.reduce((sum, m) => sum + m.engagementScore, 0) / memberships.length || 0,
          retentionRate: this.calculateRetentionRate(clubId, timeframe)
        },
        revenue: {
          ...analytics,
          revenueByTier,
          averageRevenuePerUser: analytics.totalRevenue / memberships.length || 0
        }
      }
    };
  }

  calculateRetentionRate(clubId, timeframe) {
    const memberships = Array.from(this.memberships.values())
      .filter(m => m.clubId === clubId);

    const timeframeMs = timeframe === '30d' ? 30 * 24 * 60 * 60 * 1000 : 
                      timeframe === '90d' ? 90 * 24 * 60 * 60 * 1000 : 
                      365 * 24 * 60 * 60 * 1000;

    const cutoffDate = new Date(Date.now() - timeframeMs);
    const eligibleMemberships = memberships.filter(m => m.joinedAt <= cutoffDate);
    const retainedMemberships = eligibleMemberships.filter(m => m.isActive);

    return eligibleMemberships.length > 0 ? 
      (retainedMemberships.length / eligibleMemberships.length) * 100 : 0;
  }

  async getMembershipPerks(userId, clubId) {
    const membership = Array.from(this.memberships.values())
      .find(m => m.userId === userId && m.clubId === clubId && m.isActive);

    if (!membership) {
      return { success: false, error: 'Membership not found' };
    }

    const availablePerks = Array.from(this.perks.values())
      .filter(p => p.clubId === clubId && p.isActive)
      .filter(p => {
        const fanClub = this.fanClubs.get(clubId);
        const memberTier = fanClub.tiers.find(t => t.id === membership.tierId);
        const requiredTier = fanClub.tiers.find(t => t.id === p.requiredTier);
        return memberTier && requiredTier && 
               fanClub.tiers.indexOf(memberTier) >= fanClub.tiers.indexOf(requiredTier);
      });

    return { success: true, perks: availablePerks, membership };
  }

  async updateMembershipTier(membershipId, newTierId) {
    const membership = this.memberships.get(membershipId);
    if (!membership) {
      return { success: false, error: 'Membership not found' };
    }

    const fanClub = this.fanClubs.get(membership.clubId);
    const newTier = fanClub.tiers.find(t => t.id === newTierId);
    if (!newTier) {
      return { success: false, error: 'Tier not found' };
    }

    const oldTierId = membership.tierId;
    membership.tierId = newTierId;
    membership.tier = newTier.name;
    membership.features = newTier.features;
    
    const priceDifference = newTier.monthlyPrice - 
      fanClub.tiers.find(t => t.id === oldTierId).monthlyPrice;
    
    if (priceDifference > 0) {
      membership.totalSpent += priceDifference;
      const analytics = this.analytics.get(membership.clubId);
      analytics.totalRevenue += priceDifference;
      analytics.monthlyRevenue += priceDifference;
    }

    this.emit('membershipTierUpdated', { membershipId, oldTierId, newTierId, priceDifference });
    return { success: true, membership, priceDifference };
  }
}

module.exports = FanClubManagement;