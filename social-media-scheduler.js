const { EventEmitter } = require('events');
const cron = require('node-cron');

class SocialMediaScheduler extends EventEmitter {
  constructor(config) {
    super();
    this.scheduledPosts = new Map();
    this.templates = new Map();
    this.campaigns = new Map();
    this.analytics = new Map();
    this.platforms = {
      twitter: config.twitter || {},
      instagram: config.instagram || {},
      facebook: config.facebook || {},
      tiktok: config.tiktok || {},
      youtube: config.youtube || {},
      linkedin: config.linkedin || {}
    };
    this.cronJobs = new Map();
    this.config = config;
    
    this.initializeDefaultTemplates();
  }

  initializeDefaultTemplates() {
    const defaultTemplates = [
      {
        id: 'new_release',
        name: 'New Release Announcement',
        category: 'release',
        content: {
          text: "🎵 New track alert! '{title}' is now live on all platforms! {platforms_text} #NewMusic #IndependentArtist",
          hashtags: ['NewMusic', 'IndependentArtist', 'MusicRelease'],
          includeLink: true,
          includeMedia: true
        }
      },
      {
        id: 'behind_scenes',
        name: 'Behind the Scenes',
        category: 'engagement',
        content: {
          text: "Here's a peek behind the scenes of my creative process! 🎤✨ {custom_text} #BehindTheScenes #MusicCreation",
          hashtags: ['BehindTheScenes', 'MusicCreation', 'StudioLife'],
          includeMedia: true
        }
      },
      {
        id: 'concert_announcement',
        name: 'Concert Announcement',
        category: 'events',
        content: {
          text: "🎪 LIVE SHOW ALERT! Catch me performing at {venue} on {date}! Tickets: {ticket_link} #LiveMusic #Concert",
          hashtags: ['LiveMusic', 'Concert', 'TicketsAvailable'],
          includeLink: true
        }
      },
      {
        id: 'fan_appreciation',
        name: 'Fan Appreciation',
        category: 'engagement',
        content: {
          text: "Grateful for all the love and support! You fans are incredible 💕 {custom_message} #FanLove #Grateful",
          hashtags: ['FanLove', 'Grateful', 'MusicCommunity'],
          includeMedia: false
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async createScheduledPost(artistId, postData) {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scheduledPost = {
      id: postId,
      artistId,
      platforms: postData.platforms, // ['twitter', 'instagram', 'facebook']
      content: {
        text: postData.content.text,
        media: postData.content.media || [],
        links: postData.content.links || [],
        hashtags: postData.content.hashtags || []
      },
      scheduledTime: new Date(postData.scheduledTime),
      timezone: postData.timezone || 'UTC',
      templateId: postData.templateId || null,
      campaignId: postData.campaignId || null,
      status: 'scheduled', // 'scheduled', 'posted', 'failed', 'cancelled'
      retryCount: 0,
      maxRetries: 3,
      platformResults: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.scheduledPosts.set(postId, scheduledPost);
    
    if (scheduledPost.scheduledTime > new Date()) {
      this.schedulePostExecution(postId);
    }

    this.emit('postScheduled', { postId, artistId, scheduledPost });
    return { success: true, postId, scheduledPost };
  }

  schedulePostExecution(postId) {
    const post = this.scheduledPosts.get(postId);
    if (!post) return;

    const cronExpression = this.dateToCronExpression(post.scheduledTime);
    
    const job = cron.schedule(cronExpression, async () => {
      await this.executeScheduledPost(postId);
      job.stop();
      this.cronJobs.delete(postId);
    }, {
      scheduled: true,
      timezone: post.timezone
    });

    this.cronJobs.set(postId, job);
  }

  dateToCronExpression(date) {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    return `${minute} ${hour} ${day} ${month} *`;
  }

  async executeScheduledPost(postId) {
    const post = this.scheduledPosts.get(postId);
    if (!post || post.status !== 'scheduled') return;

    post.status = 'posting';
    post.updatedAt = new Date();

    const results = {};
    let successCount = 0;
    let failureCount = 0;

    for (const platform of post.platforms) {
      try {
        const result = await this.postToPlatform(platform, post);
        results[platform] = result;
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        results[platform] = { success: false, error: error.message };
        failureCount++;
      }
    }

    post.platformResults = results;
    post.status = failureCount === 0 ? 'posted' : 
                  successCount > 0 ? 'partial_success' : 'failed';
    
    if (post.status === 'failed' && post.retryCount < post.maxRetries) {
      post.retryCount++;
      post.status = 'scheduled';
      
      const retryTime = new Date(Date.now() + (post.retryCount * 60 * 1000));
      post.scheduledTime = retryTime;
      this.schedulePostExecution(postId);
    }

    this.updateAnalytics(post.artistId, post, results);
    this.emit('postExecuted', { postId, results, status: post.status });
  }

  async postToPlatform(platform, post) {
    switch (platform) {
      case 'twitter':
        return await this.postToTwitter(post);
      case 'instagram':
        return await this.postToInstagram(post);
      case 'facebook':
        return await this.postToFacebook(post);
      case 'tiktok':
        return await this.postToTikTok(post);
      case 'youtube':
        return await this.postToYouTube(post);
      case 'linkedin':
        return await this.postToLinkedIn(post);
      default:
        return { success: false, error: 'Unsupported platform' };
    }
  }

  async postToTwitter(post) {
    try {
      const tweetData = {
        text: this.formatContentForPlatform(post.content, 'twitter'),
        media: post.content.media.length > 0 ? post.content.media : undefined
      };

      const response = {
        success: true,
        platformPostId: `tw_${Date.now()}`,
        url: `https://twitter.com/user/status/${Date.now()}`,
        metrics: { likes: 0, retweets: 0, replies: 0 }
      };

      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async postToInstagram(post) {
    try {
      if (post.content.media.length === 0) {
        return { success: false, error: 'Instagram requires media' };
      }

      const response = {
        success: true,
        platformPostId: `ig_${Date.now()}`,
        url: `https://instagram.com/p/${Date.now()}`,
        metrics: { likes: 0, comments: 0, shares: 0 }
      };

      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async postToFacebook(post) {
    try {
      const response = {
        success: true,
        platformPostId: `fb_${Date.now()}`,
        url: `https://facebook.com/posts/${Date.now()}`,
        metrics: { likes: 0, comments: 0, shares: 0 }
      };

      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async postToTikTok(post) {
    try {
      if (!post.content.media.some(m => m.type === 'video')) {
        return { success: false, error: 'TikTok requires video content' };
      }

      const response = {
        success: true,
        platformPostId: `tt_${Date.now()}`,
        url: `https://tiktok.com/@user/video/${Date.now()}`,
        metrics: { likes: 0, comments: 0, shares: 0, views: 0 }
      };

      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async postToYouTube(post) {
    try {
      const response = {
        success: true,
        platformPostId: `yt_${Date.now()}`,
        url: `https://youtube.com/watch?v=${Date.now()}`,
        metrics: { likes: 0, dislikes: 0, comments: 0, views: 0 }
      };

      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async postToLinkedIn(post) {
    try {
      const response = {
        success: true,
        platformPostId: `li_${Date.now()}`,
        url: `https://linkedin.com/posts/${Date.now()}`,
        metrics: { likes: 0, comments: 0, shares: 0 }
      };

      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  formatContentForPlatform(content, platform) {
    let text = content.text;
    
    if (platform === 'twitter' && text.length > 280) {
      text = text.substring(0, 277) + '...';
    }
    
    if (content.hashtags.length > 0) {
      const hashtagText = content.hashtags.map(tag => `#${tag}`).join(' ');
      
      if (platform === 'twitter') {
        const availableSpace = 280 - text.length - 1;
        if (hashtagText.length <= availableSpace) {
          text += ' ' + hashtagText;
        }
      } else {
        text += '\n\n' + hashtagText;
      }
    }
    
    return text;
  }

  async createCampaign(artistId, campaignData) {
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const campaign = {
      id: campaignId,
      artistId,
      name: campaignData.name,
      description: campaignData.description,
      type: campaignData.type, // 'album_release', 'tour_promotion', 'single_release', 'brand_partnership'
      startDate: new Date(campaignData.startDate),
      endDate: new Date(campaignData.endDate),
      posts: [],
      targets: campaignData.targets || {
        totalPosts: 10,
        platforms: ['twitter', 'instagram', 'facebook'],
        frequency: 'daily' // 'daily', 'weekly', 'custom'
      },
      budget: campaignData.budget || null,
      objectives: campaignData.objectives || [],
      status: 'active',
      createdAt: new Date()
    };

    this.campaigns.set(campaignId, campaign);
    this.emit('campaignCreated', { campaignId, artistId, campaign });
    return { success: true, campaignId, campaign };
  }

  async generateCampaignPosts(campaignId, template) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    const templateData = this.templates.get(template);
    if (!templateData) {
      return { success: false, error: 'Template not found' };
    }

    const posts = [];
    const daysBetween = Math.ceil((campaign.endDate - campaign.startDate) / (1000 * 60 * 60 * 24));
    const postInterval = Math.floor(daysBetween / campaign.targets.totalPosts);

    for (let i = 0; i < campaign.targets.totalPosts; i++) {
      const scheduledTime = new Date(campaign.startDate.getTime() + (i * postInterval * 24 * 60 * 60 * 1000));
      
      const postData = {
        platforms: campaign.targets.platforms,
        content: {
          text: this.personalizeTemplate(templateData.content.text, campaign),
          hashtags: templateData.content.hashtags,
          media: [],
          links: []
        },
        scheduledTime,
        templateId: template,
        campaignId
      };

      const result = await this.createScheduledPost(campaign.artistId, postData);
      if (result.success) {
        posts.push(result.postId);
        campaign.posts.push(result.postId);
      }
    }

    this.emit('campaignPostsGenerated', { campaignId, postCount: posts.length });
    return { success: true, posts, count: posts.length };
  }

  personalizeTemplate(template, campaign) {
    return template
      .replace('{campaign_name}', campaign.name)
      .replace('{artist_name}', campaign.artistId)
      .replace('{start_date}', campaign.startDate.toLocaleDateString())
      .replace('{end_date}', campaign.endDate.toLocaleDateString());
  }

  updateAnalytics(artistId, post, results) {
    if (!this.analytics.has(artistId)) {
      this.analytics.set(artistId, {
        totalPosts: 0,
        successfulPosts: 0,
        failedPosts: 0,
        platformStats: {},
        engagementMetrics: {},
        lastUpdated: new Date()
      });
    }

    const analytics = this.analytics.get(artistId);
    analytics.totalPosts++;
    
    const successfulPlatforms = Object.values(results).filter(r => r.success).length;
    if (successfulPlatforms > 0) {
      analytics.successfulPosts++;
    }
    if (successfulPlatforms < post.platforms.length) {
      analytics.failedPosts++;
    }

    Object.entries(results).forEach(([platform, result]) => {
      if (!analytics.platformStats[platform]) {
        analytics.platformStats[platform] = { total: 0, successful: 0, failed: 0 };
      }
      
      analytics.platformStats[platform].total++;
      if (result.success) {
        analytics.platformStats[platform].successful++;
      } else {
        analytics.platformStats[platform].failed++;
      }
    });

    analytics.lastUpdated = new Date();
  }

  async getSchedulerAnalytics(artistId, timeframe = '30d') {
    const analytics = this.analytics.get(artistId);
    if (!analytics) {
      return { success: false, error: 'No analytics data found' };
    }

    const timeframeMs = timeframe === '30d' ? 30 * 24 * 60 * 60 * 1000 : 
                      timeframe === '7d' ? 7 * 24 * 60 * 60 * 1000 : 
                      24 * 60 * 60 * 1000;

    const cutoffDate = new Date(Date.now() - timeframeMs);
    const recentPosts = Array.from(this.scheduledPosts.values())
      .filter(p => p.artistId === artistId && p.createdAt >= cutoffDate);

    const successRate = analytics.totalPosts > 0 ? 
      (analytics.successfulPosts / analytics.totalPosts) * 100 : 0;

    return {
      success: true,
      analytics: {
        ...analytics,
        successRate,
        recentActivity: {
          postsInTimeframe: recentPosts.length,
          scheduledPosts: recentPosts.filter(p => p.status === 'scheduled').length,
          completedPosts: recentPosts.filter(p => p.status === 'posted').length,
          failedPosts: recentPosts.filter(p => p.status === 'failed').length
        }
      }
    };
  }

  async cancelScheduledPost(postId) {
    const post = this.scheduledPosts.get(postId);
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    if (post.status !== 'scheduled') {
      return { success: false, error: 'Post cannot be cancelled' };
    }

    post.status = 'cancelled';
    post.updatedAt = new Date();

    const cronJob = this.cronJobs.get(postId);
    if (cronJob) {
      cronJob.stop();
      this.cronJobs.delete(postId);
    }

    this.emit('postCancelled', { postId });
    return { success: true };
  }

  async getUpcomingPosts(artistId, limit = 10) {
    const upcomingPosts = Array.from(this.scheduledPosts.values())
      .filter(p => p.artistId === artistId && p.status === 'scheduled')
      .sort((a, b) => a.scheduledTime - b.scheduledTime)
      .slice(0, limit);

    return { success: true, posts: upcomingPosts };
  }
}

module.exports = SocialMediaScheduler;