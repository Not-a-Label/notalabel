// YouTube Music Integration for Not a Label
const { google } = require('googleapis');
const youtube = google.youtube('v3');

class YouTubeMusicIntegration {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri || 'https://not-a-label.art/callback/youtube';
    
    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
    
    this.scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtubepartner',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ];
  }

  // Generate authorization URL
  getAuthorizationUrl(state) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      state: state,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async handleCallback(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date
      };
    } catch (error) {
      console.error('YouTube auth error:', error);
      throw new Error('Failed to authenticate with YouTube');
    }
  }

  // Get channel statistics
  async getChannelStats(accessToken) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    try {
      const response = await youtube.channels.list({
        auth: this.oauth2Client,
        part: ['snippet', 'statistics', 'contentDetails'],
        mine: true
      });
      
      const channel = response.data.items[0];
      
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        thumbnail: channel.snippet.thumbnails.high.url,
        statistics: {
          viewCount: parseInt(channel.statistics.viewCount),
          subscriberCount: parseInt(channel.statistics.subscriberCount),
          videoCount: parseInt(channel.statistics.videoCount)
        },
        uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads
      };
    } catch (error) {
      console.error('Channel stats error:', error);
      throw new Error('Failed to fetch channel statistics');
    }
  }

  // Get video analytics
  async getVideoAnalytics(accessToken, videoId) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    try {
      const response = await youtube.videos.list({
        auth: this.oauth2Client,
        part: ['statistics', 'snippet', 'contentDetails'],
        id: [videoId]
      });
      
      const video = response.data.items[0];
      
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        duration: this.parseDuration(video.contentDetails.duration),
        statistics: {
          viewCount: parseInt(video.statistics.viewCount || 0),
          likeCount: parseInt(video.statistics.likeCount || 0),
          commentCount: parseInt(video.statistics.commentCount || 0)
        },
        thumbnail: video.snippet.thumbnails.high.url,
        tags: video.snippet.tags || []
      };
    } catch (error) {
      console.error('Video analytics error:', error);
      throw new Error('Failed to fetch video analytics');
    }
  }

  // Get music videos from channel
  async getMusicVideos(accessToken, limit = 20) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    try {
      // First get the channel's uploads playlist
      const channelResponse = await youtube.channels.list({
        auth: this.oauth2Client,
        part: ['contentDetails'],
        mine: true
      });
      
      const uploadsPlaylistId = channelResponse.data.items[0]
        .contentDetails.relatedPlaylists.uploads;
      
      // Get videos from uploads playlist
      const playlistResponse = await youtube.playlistItems.list({
        auth: this.oauth2Client,
        part: ['snippet', 'contentDetails'],
        playlistId: uploadsPlaylistId,
        maxResults: limit
      });
      
      // Get detailed stats for each video
      const videoIds = playlistResponse.data.items.map(
        item => item.contentDetails.videoId
      );
      
      const videosResponse = await youtube.videos.list({
        auth: this.oauth2Client,
        part: ['statistics', 'contentDetails', 'snippet'],
        id: videoIds
      });
      
      return videosResponse.data.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        publishedAt: video.snippet.publishedAt,
        duration: this.parseDuration(video.contentDetails.duration),
        viewCount: parseInt(video.statistics.viewCount || 0),
        likeCount: parseInt(video.statistics.likeCount || 0),
        thumbnail: video.snippet.thumbnails.high.url,
        url: `https://www.youtube.com/watch?v=${video.id}`
      }));
    } catch (error) {
      console.error('Music videos error:', error);
      throw new Error('Failed to fetch music videos');
    }
  }

  // Upload video
  async uploadVideo(accessToken, videoData) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    try {
      const response = await youtube.videos.insert({
        auth: this.oauth2Client,
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: videoData.title,
            description: videoData.description,
            tags: videoData.tags,
            categoryId: '10' // Music category
          },
          status: {
            privacyStatus: videoData.privacy || 'private',
            madeForKids: false
          }
        },
        media: {
          body: videoData.fileStream
        }
      });
      
      return {
        id: response.data.id,
        title: response.data.snippet.title,
        url: `https://www.youtube.com/watch?v=${response.data.id}`,
        status: response.data.status.uploadStatus
      };
    } catch (error) {
      console.error('Video upload error:', error);
      throw new Error('Failed to upload video');
    }
  }

  // Create playlist
  async createPlaylist(accessToken, playlistData) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    try {
      const response = await youtube.playlists.insert({
        auth: this.oauth2Client,
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: playlistData.title,
            description: playlistData.description,
            tags: playlistData.tags || ['music']
          },
          status: {
            privacyStatus: playlistData.privacy || 'public'
          }
        }
      });
      
      return {
        id: response.data.id,
        title: response.data.snippet.title,
        url: `https://www.youtube.com/playlist?list=${response.data.id}`
      };
    } catch (error) {
      console.error('Playlist creation error:', error);
      throw new Error('Failed to create playlist');
    }
  }

  // Add video to playlist
  async addToPlaylist(accessToken, playlistId, videoId) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    try {
      const response = await youtube.playlistItems.insert({
        auth: this.oauth2Client,
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId
            }
          }
        }
      });
      
      return {
        id: response.data.id,
        position: response.data.snippet.position
      };
    } catch (error) {
      console.error('Add to playlist error:', error);
      throw new Error('Failed to add video to playlist');
    }
  }

  // Search for music
  async searchMusic(query, options = {}) {
    try {
      const response = await youtube.search.list({
        key: this.apiKey,
        part: ['snippet'],
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: options.limit || 20,
        order: options.order || 'relevance'
      });
      
      return response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
    } catch (error) {
      console.error('Music search error:', error);
      throw new Error('Failed to search music');
    }
  }

  // Get trending music
  async getTrendingMusic(region = 'US', limit = 20) {
    try {
      const response = await youtube.videos.list({
        key: this.apiKey,
        part: ['snippet', 'statistics'],
        chart: 'mostPopular',
        videoCategoryId: '10', // Music category
        regionCode: region,
        maxResults: limit
      });
      
      return response.data.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        viewCount: parseInt(video.statistics.viewCount),
        likeCount: parseInt(video.statistics.likeCount || 0),
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails.high.url,
        url: `https://www.youtube.com/watch?v=${video.id}`
      }));
    } catch (error) {
      console.error('Trending music error:', error);
      throw new Error('Failed to fetch trending music');
    }
  }

  // Analyze video performance
  async analyzePerformance(accessToken, videoIds) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    try {
      const response = await youtube.videos.list({
        auth: this.oauth2Client,
        part: ['statistics', 'snippet'],
        id: videoIds
      });
      
      const totalViews = response.data.items.reduce(
        (sum, video) => sum + parseInt(video.statistics.viewCount || 0), 0
      );
      
      const totalLikes = response.data.items.reduce(
        (sum, video) => sum + parseInt(video.statistics.likeCount || 0), 0
      );
      
      const avgEngagementRate = response.data.items.map(video => {
        const views = parseInt(video.statistics.viewCount || 1);
        const likes = parseInt(video.statistics.likeCount || 0);
        const comments = parseInt(video.statistics.commentCount || 0);
        return ((likes + comments) / views) * 100;
      }).reduce((a, b) => a + b, 0) / response.data.items.length;
      
      return {
        totalVideos: response.data.items.length,
        totalViews,
        totalLikes,
        avgViewsPerVideo: Math.floor(totalViews / response.data.items.length),
        avgEngagementRate: avgEngagementRate.toFixed(2) + '%',
        topPerformer: response.data.items.sort(
          (a, b) => parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount)
        )[0]
      };
    } catch (error) {
      console.error('Performance analysis error:', error);
      throw new Error('Failed to analyze performance');
    }
  }

  // Helper: Parse ISO 8601 duration
  parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    return {
      hours: parseInt(hours) || 0,
      minutes: parseInt(minutes) || 0,
      seconds: parseInt(seconds) || 0,
      formatted: `${hours || '0'}:${(minutes || '0').padStart(2, '0')}:${(seconds || '0').padStart(2, '0')}`
    };
  }

  // Sync YouTube channel with Not a Label
  async syncChannelData(accessToken) {
    try {
      const [channelStats, recentVideos] = await Promise.all([
        this.getChannelStats(accessToken),
        this.getMusicVideos(accessToken, 50)
      ]);
      
      const videoIds = recentVideos.map(v => v.id);
      const performance = await this.analyzePerformance(accessToken, videoIds);
      
      return {
        channel: channelStats,
        recentVideos: recentVideos.slice(0, 10),
        performance,
        syncedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Channel sync error:', error);
      throw new Error('Failed to sync YouTube channel');
    }
  }
}

module.exports = YouTubeMusicIntegration;