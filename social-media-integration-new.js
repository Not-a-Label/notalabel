// Social Media Auto-Posting Integration for Not a Label
const Twitter = require('twitter-api-v2').TwitterApi;
const { IgApiClient } = require('instagram-private-api');
const FB = require('fb');
const TikTokAPI = require('tiktok-api');

class SocialMediaIntegration {
  constructor(config) {
    this.config = config;
    this.platforms = {};
    
    // Initialize platforms if credentials provided
    if (config.twitter) {
      this.initializeTwitter(config.twitter);
    }
    if (config.instagram) {
      this.initializeInstagram(config.instagram);
    }
    if (config.facebook) {
      this.initializeFacebook(config.facebook);
    }
    if (config.tiktok) {
      this.initializeTikTok(config.tiktok);
    }
  }

  // Initialize Twitter/X
  initializeTwitter(config) {
    this.platforms.twitter = new Twitter({
      appKey: config.apiKey,
      appSecret: config.apiSecret,
      accessToken: config.accessToken,
      accessSecret: config.accessTokenSecret
    });
  }

  // Initialize Instagram
  initializeInstagram(config) {
    const ig = new IgApiClient();
    ig.state.generateDevice(config.username);
    this.platforms.instagram = {
      client: ig,
      username: config.username,
      password: config.password
    };
  }

  // Initialize Facebook
  initializeFacebook(config) {
    FB.setAccessToken(config.pageAccessToken);
    this.platforms.facebook = {
      client: FB,
      pageId: config.pageId
    };
  }

  // Initialize TikTok
  initializeTikTok(config) {
    this.platforms.tiktok = new TikTokAPI({
      accessToken: config.accessToken,
      clientKey: config.clientKey
    });
  }

  // Create multi-platform post
  async createPost(postData) {
    const results = {
      success: [],
      failed: []
    };
    
    // Post to each platform
    for (const platform of postData.platforms) {
      try {
        let result;
        
        switch (platform) {
          case 'twitter':
            result = await this.postToTwitter(postData);
            break;
          case 'instagram':
            result = await this.postToInstagram(postData);
            break;
          case 'facebook':
            result = await this.postToFacebook(postData);
            break;
          case 'tiktok':
            result = await this.postToTikTok(postData);
            break;
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }
        
        results.success.push({
          platform,
          postId: result.id,
          url: result.url
        });
      } catch (error) {
        results.failed.push({
          platform,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Post to Twitter/X
  async postToTwitter(postData) {
    if (!this.platforms.twitter) {
      throw new Error('Twitter not configured');
    }
    
    try {
      let tweet = {
        text: this.formatTextForTwitter(postData.text)
      };
      
      // Add media if provided
      if (postData.media && postData.media.length > 0) {
        const mediaIds = [];
        
        for (const media of postData.media.slice(0, 4)) { // Twitter allows max 4 images
          const mediaId = await this.platforms.twitter.v1.uploadMedia(media.path);
          mediaIds.push(mediaId);
        }
        
        tweet.media = { media_ids: mediaIds };
      }
      
      const response = await this.platforms.twitter.v2.tweet(tweet);
      
      return {
        id: response.data.id,
        url: `https://twitter.com/user/status/${response.data.id}`
      };
    } catch (error) {
      console.error('Twitter post error:', error);
      throw new Error(`Twitter: ${error.message}`);
    }
  }

  // Post to Instagram
  async postToInstagram(postData) {
    if (!this.platforms.instagram) {
      throw new Error('Instagram not configured');
    }
    
    try {
      const ig = this.platforms.instagram.client;
      
      // Login if not already
      if (!ig.state.cookieUserId) {
        await ig.account.login(
          this.platforms.instagram.username,
          this.platforms.instagram.password
        );
      }
      
      let publishResult;
      
      if (postData.media && postData.media.length > 0) {
        if (postData.media.length === 1) {
          // Single photo post
          publishResult = await ig.publish.photo({
            file: postData.media[0].buffer,
            caption: this.formatTextForInstagram(postData.text)
          });
        } else {
          // Carousel post
          const items = postData.media.slice(0, 10).map(media => ({
            file: media.buffer
          }));
          
          publishResult = await ig.publish.album({
            items,
            caption: this.formatTextForInstagram(postData.text)
          });
        }
      } else {
        throw new Error('Instagram requires at least one image');
      }
      
      return {
        id: publishResult.media.pk,
        url: `https://www.instagram.com/p/${publishResult.media.code}/`
      };
    } catch (error) {
      console.error('Instagram post error:', error);
      throw new Error(`Instagram: ${error.message}`);
    }
  }

  // Post to Facebook
  async postToFacebook(postData) {
    if (!this.platforms.facebook) {
      throw new Error('Facebook not configured');
    }
    
    try {
      const postOptions = {
        message: postData.text
      };
      
      // Add link if provided
      if (postData.link) {
        postOptions.link = postData.link;
      }
      
      // Handle media
      if (postData.media && postData.media.length > 0) {
        if (postData.media.length === 1) {
          // Single photo
          const photo = await this.platforms.facebook.client.api(
            `/${this.platforms.facebook.pageId}/photos`,
            'POST',
            {
              source: postData.media[0].buffer,
              caption: postData.text
            }
          );
          
          return {
            id: photo.id,
            url: `https://www.facebook.com/${photo.id}`
          };
        } else {
          // Multiple photos - create album
          const album = await this.platforms.facebook.client.api(
            `/${this.platforms.facebook.pageId}/albums`,
            'POST',
            {
              name: postData.albumName || 'New Release',
              message: postData.text
            }
          );
          
          // Upload photos to album
          for (const media of postData.media) {
            await this.platforms.facebook.client.api(
              `/${album.id}/photos`,
              'POST',
              {
                source: media.buffer
              }
            );
          }
          
          return {
            id: album.id,
            url: `https://www.facebook.com/${album.id}`
          };
        }
      } else {
        // Text-only post
        const post = await this.platforms.facebook.client.api(
          `/${this.platforms.facebook.pageId}/feed`,
          'POST',
          postOptions
        );
        
        return {
          id: post.id,
          url: `https://www.facebook.com/${post.id}`
        };
      }
    } catch (error) {
      console.error('Facebook post error:', error);
      throw new Error(`Facebook: ${error.message}`);
    }
  }

  // Post to TikTok
  async postToTikTok(postData) {
    if (!this.platforms.tiktok) {
      throw new Error('TikTok not configured');
    }
    
    try {
      if (!postData.video) {
        throw new Error('TikTok requires a video');
      }
      
      const result = await this.platforms.tiktok.video.upload({
        video: postData.video.path,
        title: postData.text.substring(0, 100),
        privacy_level: postData.privacy || 'PUBLIC_TO_EVERYONE'
      });
      
      return {
        id: result.video.id,
        url: result.video.share_url
      };
    } catch (error) {
      console.error('TikTok post error:', error);
      throw new Error(`TikTok: ${error.message}`);
    }
  }

  // Schedule post for future
  async schedulePost(postData, scheduledTime) {
    // Store in database with scheduled time
    const scheduledPost = {
      id: `scheduled_${Date.now()}`,
      postData,
      scheduledTime,
      status: 'scheduled',
      createdAt: new Date()
    };
    
    // In production, save to database
    console.log('Post scheduled for:', scheduledTime);
    
    return scheduledPost;
  }

  // Get analytics for posts
  async getPostAnalytics(platform, postId) {
    switch (platform) {
      case 'twitter':
        return this.getTwitterAnalytics(postId);
      case 'instagram':
        return this.getInstagramAnalytics(postId);
      case 'facebook':
        return this.getFacebookAnalytics(postId);
      case 'tiktok':
        return this.getTikTokAnalytics(postId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Twitter Analytics
  async getTwitterAnalytics(tweetId) {
    if (!this.platforms.twitter) {
      throw new Error('Twitter not configured');
    }
    
    try {
      const tweet = await this.platforms.twitter.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'created_at']
      });
      
      return {
        platform: 'twitter',
        postId: tweetId,
        metrics: {
          likes: tweet.data.public_metrics.like_count,
          retweets: tweet.data.public_metrics.retweet_count,
          replies: tweet.data.public_metrics.reply_count,
          impressions: tweet.data.public_metrics.impression_count,
          engagementRate: this.calculateEngagementRate(
            tweet.data.public_metrics
          )
        },
        createdAt: tweet.data.created_at
      };
    } catch (error) {
      console.error('Twitter analytics error:', error);
      throw new Error(`Failed to get Twitter analytics: ${error.message}`);
    }
  }

  // Instagram Analytics
  async getInstagramAnalytics(mediaId) {
    if (!this.platforms.instagram) {
      throw new Error('Instagram not configured');
    }
    
    try {
      const ig = this.platforms.instagram.client;
      const mediaInfo = await ig.media.info(mediaId);
      
      return {
        platform: 'instagram',
        postId: mediaId,
        metrics: {
          likes: mediaInfo.like_count,
          comments: mediaInfo.comment_count,
          saves: mediaInfo.save_count || 0,
          reach: mediaInfo.reach || 0,
          impressions: mediaInfo.impression_count || 0
        },
        createdAt: new Date(mediaInfo.taken_at * 1000)
      };
    } catch (error) {
      console.error('Instagram analytics error:', error);
      throw new Error(`Failed to get Instagram analytics: ${error.message}`);
    }
  }

  // Facebook Analytics
  async getFacebookAnalytics(postId) {
    if (!this.platforms.facebook) {
      throw new Error('Facebook not configured');
    }
    
    try {
      const insights = await this.platforms.facebook.client.api(
        `/${postId}/insights`,
        'GET',
        {
          metric: 'post_impressions,post_engaged_users,post_reactions_by_type_total'
        }
      );
      
      const post = await this.platforms.facebook.client.api(`/${postId}`, 'GET', {
        fields: 'created_time,likes.summary(true),comments.summary(true),shares'
      });
      
      return {
        platform: 'facebook',
        postId: postId,
        metrics: {
          likes: post.likes.summary.total_count,
          comments: post.comments.summary.total_count,
          shares: post.shares?.count || 0,
          impressions: insights.data.find(m => m.name === 'post_impressions')?.values[0]?.value || 0,
          engagedUsers: insights.data.find(m => m.name === 'post_engaged_users')?.values[0]?.value || 0
        },
        createdAt: post.created_time
      };
    } catch (error) {
      console.error('Facebook analytics error:', error);
      throw new Error(`Failed to get Facebook analytics: ${error.message}`);
    }
  }

  // TikTok Analytics
  async getTikTokAnalytics(videoId) {
    if (!this.platforms.tiktok) {
      throw new Error('TikTok not configured');
    }
    
    try {
      const analytics = await this.platforms.tiktok.video.analytics({
        video_id: videoId
      });
      
      return {
        platform: 'tiktok',
        postId: videoId,
        metrics: {
          views: analytics.play_count,
          likes: analytics.digg_count,
          comments: analytics.comment_count,
          shares: analytics.share_count,
          completionRate: analytics.avg_watch_time / analytics.duration
        },
        createdAt: new Date(analytics.create_time * 1000)
      };
    } catch (error) {
      console.error('TikTok analytics error:', error);
      throw new Error(`Failed to get TikTok analytics: ${error.message}`);
    }
  }

  // Unified analytics dashboard
  async getAllAnalytics(posts) {
    const analytics = [];
    
    for (const post of posts) {
      try {
        const data = await this.getPostAnalytics(post.platform, post.postId);
        analytics.push(data);
      } catch (error) {
        console.error(`Failed to get analytics for ${post.platform}:`, error);
        analytics.push({
          platform: post.platform,
          postId: post.postId,
          error: error.message
        });
      }
    }
    
    return {
      posts: analytics,
      summary: this.calculateSummaryMetrics(analytics),
      generatedAt: new Date()
    };
  }

  // Helper methods
  formatTextForTwitter(text) {
    // Twitter character limit: 280
    if (text.length <= 280) return text;
    
    return text.substring(0, 277) + '...';
  }

  formatTextForInstagram(text) {
    // Instagram character limit: 2200
    // Add hashtags if not present
    const hashtags = this.extractHashtags(text);
    if (hashtags.length === 0) {
      text += '\n\n' + this.generateHashtags();
    }
    
    return text.substring(0, 2200);
  }

  extractHashtags(text) {
    const regex = /#\w+/g;
    return text.match(regex) || [];
  }

  generateHashtags() {
    return '#IndependentArtist #NewMusic #NotALabel #MusicRelease #IndieMusic';
  }

  calculateEngagementRate(metrics) {
    const engagements = (metrics.like_count || 0) + 
                       (metrics.retweet_count || 0) + 
                       (metrics.reply_count || 0);
    const impressions = metrics.impression_count || 1;
    
    return ((engagements / impressions) * 100).toFixed(2);
  }

  calculateSummaryMetrics(analytics) {
    const validPosts = analytics.filter(a => !a.error);
    
    const totalReach = validPosts.reduce((sum, post) => {
      const reach = post.metrics.impressions || 
                    post.metrics.views || 
                    post.metrics.reach || 0;
      return sum + reach;
    }, 0);
    
    const totalEngagement = validPosts.reduce((sum, post) => {
      const engagement = (post.metrics.likes || 0) + 
                        (post.metrics.comments || 0) + 
                        (post.metrics.shares || 0) +
                        (post.metrics.retweets || 0);
      return sum + engagement;
    }, 0);
    
    return {
      totalPosts: analytics.length,
      successfulPosts: validPosts.length,
      totalReach,
      totalEngagement,
      avgEngagementRate: validPosts.length > 0 
        ? (totalEngagement / totalReach * 100).toFixed(2) 
        : 0,
      platformBreakdown: this.getPlatformBreakdown(validPosts)
    };
  }

  getPlatformBreakdown(posts) {
    const breakdown = {};
    
    posts.forEach(post => {
      if (!breakdown[post.platform]) {
        breakdown[post.platform] = {
          posts: 0,
          totalReach: 0,
          totalEngagement: 0
        };
      }
      
      breakdown[post.platform].posts++;
      breakdown[post.platform].totalReach += 
        post.metrics.impressions || post.metrics.views || post.metrics.reach || 0;
      breakdown[post.platform].totalEngagement += 
        (post.metrics.likes || 0) + 
        (post.metrics.comments || 0) + 
        (post.metrics.shares || 0) +
        (post.metrics.retweets || 0);
    });
    
    return breakdown;
  }
}

module.exports = SocialMediaIntegration;