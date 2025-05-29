// Social Media API Integration for Not a Label
// This provides a framework for posting to various social media platforms

const { TwitterApi } = require('twitter-api-v2');
const { IgApiClient } = require('instagram-private-api');
const axios = require('axios');

class SocialMediaManager {
  constructor() {
    this.platforms = {
      twitter: null,
      instagram: null,
      facebook: null,
      linkedin: null
    };
    this.initializePlatforms();
  }

  initializePlatforms() {
    // Twitter/X API initialization
    if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
      this.platforms.twitter = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
      });
    }

    // Instagram API (requires Facebook Business account)
    if (process.env.INSTAGRAM_ACCESS_TOKEN) {
      this.platforms.instagram = {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        accountId: process.env.INSTAGRAM_ACCOUNT_ID
      };
    }

    // Facebook API
    if (process.env.FACEBOOK_ACCESS_TOKEN) {
      this.platforms.facebook = {
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
        pageId: process.env.FACEBOOK_PAGE_ID
      };
    }
  }

  // Twitter/X posting
  async postToTwitter(content, mediaUrls = []) {
    try {
      if (!this.platforms.twitter) {
        throw new Error('Twitter API not configured');
      }

      let mediaIds = [];
      
      // Upload media if provided
      for (const mediaUrl of mediaUrls) {
        const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        const mediaBuffer = Buffer.from(mediaResponse.data);
        const mediaUpload = await this.platforms.twitter.v1.uploadMedia(mediaBuffer, { mimeType: mediaResponse.headers['content-type'] });
        mediaIds.push(mediaUpload);
      }

      // Post tweet
      const tweet = await this.platforms.twitter.v2.tweet({
        text: content,
        ...(mediaIds.length > 0 && { media: { media_ids: mediaIds } })
      });

      return {
        success: true,
        platform: 'twitter',
        postId: tweet.data.id,
        url: `https://twitter.com/user/status/${tweet.data.id}`
      };
    } catch (error) {
      console.error('Twitter posting error:', error);
      return {
        success: false,
        platform: 'twitter',
        error: error.message
      };
    }
  }

  // Instagram posting (requires Facebook Business API)
  async postToInstagram(content, imageUrl, caption) {
    try {
      if (!this.platforms.instagram) {
        throw new Error('Instagram API not configured');
      }

      const { accessToken, accountId } = this.platforms.instagram;
      
      // Step 1: Create container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${accountId}/media`,
        {
          image_url: imageUrl,
          caption: `${content}\n\n${caption}`,
          access_token: accessToken
        }
      );

      const containerId = containerResponse.data.id;

      // Step 2: Publish container
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: accessToken
        }
      );

      return {
        success: true,
        platform: 'instagram',
        postId: publishResponse.data.id,
        url: `https://instagram.com/p/${publishResponse.data.id}`
      };
    } catch (error) {
      console.error('Instagram posting error:', error);
      return {
        success: false,
        platform: 'instagram',
        error: error.message
      };
    }
  }

  // Facebook posting
  async postToFacebook(content, linkUrl = null, imageUrl = null) {
    try {
      if (!this.platforms.facebook) {
        throw new Error('Facebook API not configured');
      }

      const { accessToken, pageId } = this.platforms.facebook;
      
      const postData = {
        message: content,
        access_token: accessToken
      };

      if (linkUrl) {
        postData.link = linkUrl;
      }

      if (imageUrl) {
        postData.picture = imageUrl;
      }

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        postData
      );

      return {
        success: true,
        platform: 'facebook',
        postId: response.data.id,
        url: `https://facebook.com/${pageId}/posts/${response.data.id.split('_')[1]}`
      };
    } catch (error) {
      console.error('Facebook posting error:', error);
      return {
        success: false,
        platform: 'facebook',
        error: error.message
      };
    }
  }

  // LinkedIn posting
  async postToLinkedIn(content, linkUrl = null) {
    try {
      if (!process.env.LINKEDIN_ACCESS_TOKEN) {
        throw new Error('LinkedIn API not configured');
      }

      const postData = {
        author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      if (linkUrl) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          originalUrl: linkUrl
        }];
      }

      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        postData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform: 'linkedin',
        postId: response.data.id,
        url: `https://linkedin.com/feed/update/${response.data.id}`
      };
    } catch (error) {
      console.error('LinkedIn posting error:', error);
      return {
        success: false,
        platform: 'linkedin',
        error: error.message
      };
    }
  }

  // Universal posting method
  async postToMultiplePlatforms(platforms, content, options = {}) {
    const results = [];

    for (const platform of platforms) {
      let result;
      
      switch (platform.toLowerCase()) {
        case 'twitter':
          result = await this.postToTwitter(content, options.mediaUrls);
          break;
        case 'instagram':
          result = await this.postToInstagram(content, options.imageUrl, options.caption || '');
          break;
        case 'facebook':
          result = await this.postToFacebook(content, options.linkUrl, options.imageUrl);
          break;
        case 'linkedin':
          result = await this.postToLinkedIn(content, options.linkUrl);
          break;
        default:
          result = {
            success: false,
            platform: platform,
            error: 'Platform not supported'
          };
      }

      results.push(result);
    }

    return results;
  }

  // Schedule a post for later
  async schedulePost(platforms, content, scheduledTime, options = {}) {
    // This would integrate with a job scheduler like node-cron or bull queue
    return {
      scheduled: true,
      platforms,
      content,
      scheduledTime,
      jobId: `post_${Date.now()}`
    };
  }

  // Get platform-specific character limits and requirements
  getPlatformLimits() {
    return {
      twitter: {
        textLimit: 280,
        mediaLimit: 4,
        videoLimit: '2:20',
        formats: ['jpg', 'png', 'gif', 'mp4']
      },
      instagram: {
        textLimit: 2200,
        mediaLimit: 10,
        requiresImage: true,
        formats: ['jpg', 'png', 'mp4']
      },
      facebook: {
        textLimit: 63206,
        mediaLimit: 'unlimited',
        formats: ['jpg', 'png', 'gif', 'mp4']
      },
      linkedin: {
        textLimit: 3000,
        mediaLimit: 1,
        formats: ['jpg', 'png', 'pdf']
      }
    };
  }
}

module.exports = SocialMediaManager;