// Spotify API Integration for Not a Label
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');

class SpotifyIntegration {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri || 'https://not-a-label.art/callback/spotify';
    
    this.spotifyApi = new SpotifyWebApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri
    });
    
    this.scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-read-currently-playing',
      'user-top-read',
      'user-library-read',
      'streaming',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-follow-read',
      'user-follow-modify'
    ];
  }

  // Generate authorization URL
  getAuthorizationUrl(state) {
    return this.spotifyApi.createAuthorizeURL(this.scopes, state);
  }

  // Exchange authorization code for access token
  async handleCallback(code) {
    try {
      const data = await this.spotifyApi.authorizationCodeGrant(code);
      
      // Set tokens
      this.spotifyApi.setAccessToken(data.body.access_token);
      this.spotifyApi.setRefreshToken(data.body.refresh_token);
      
      return {
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in
      };
    } catch (error) {
      console.error('Spotify auth error:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    this.spotifyApi.setRefreshToken(refreshToken);
    
    try {
      const data = await this.spotifyApi.refreshAccessToken();
      this.spotifyApi.setAccessToken(data.body.access_token);
      
      return {
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh Spotify token');
    }
  }

  // Get user profile
  async getUserProfile(accessToken) {
    this.spotifyApi.setAccessToken(accessToken);
    
    try {
      const userData = await this.spotifyApi.getMe();
      
      return {
        id: userData.body.id,
        displayName: userData.body.display_name,
        email: userData.body.email,
        country: userData.body.country,
        product: userData.body.product,
        followers: userData.body.followers?.total || 0,
        images: userData.body.images,
        spotifyUrl: userData.body.external_urls.spotify
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw new Error('Failed to fetch Spotify profile');
    }
  }

  // Get user's top artists
  async getTopArtists(accessToken, timeRange = 'medium_term', limit = 20) {
    this.spotifyApi.setAccessToken(accessToken);
    
    try {
      const data = await this.spotifyApi.getMyTopArtists({
        time_range: timeRange,
        limit: limit
      });
      
      return data.body.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        images: artist.images,
        spotifyUrl: artist.external_urls.spotify
      }));
    } catch (error) {
      console.error('Top artists fetch error:', error);
      throw new Error('Failed to fetch top artists');
    }
  }

  // Get user's top tracks
  async getTopTracks(accessToken, timeRange = 'medium_term', limit = 20) {
    this.spotifyApi.setAccessToken(accessToken);
    
    try {
      const data = await this.spotifyApi.getMyTopTracks({
        time_range: timeRange,
        limit: limit
      });
      
      return data.body.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name),
        album: track.album.name,
        duration: track.duration_ms,
        popularity: track.popularity,
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Top tracks fetch error:', error);
      throw new Error('Failed to fetch top tracks');
    }
  }

  // Get artist's streaming statistics
  async getArtistStats(accessToken, artistId) {
    this.spotifyApi.setAccessToken(accessToken);
    
    try {
      const [artist, topTracks, albums] = await Promise.all([
        this.spotifyApi.getArtist(artistId),
        this.spotifyApi.getArtistTopTracks(artistId, 'US'),
        this.spotifyApi.getArtistAlbums(artistId, { limit: 50 })
      ]);
      
      // Calculate total streams estimate (based on popularity metrics)
      const estimatedStreams = this.estimateStreams(
        artist.body.popularity,
        artist.body.followers.total
      );
      
      return {
        artist: {
          name: artist.body.name,
          followers: artist.body.followers.total,
          popularity: artist.body.popularity,
          genres: artist.body.genres
        },
        topTracks: topTracks.body.tracks.slice(0, 5).map(track => ({
          name: track.name,
          popularity: track.popularity,
          previewUrl: track.preview_url
        })),
        albums: albums.body.items.length,
        estimatedMonthlyListeners: Math.floor(artist.body.followers.total * 0.22),
        estimatedTotalStreams: estimatedStreams
      };
    } catch (error) {
      console.error('Artist stats error:', error);
      throw new Error('Failed to fetch artist statistics');
    }
  }

  // Create playlist for user
  async createPlaylist(accessToken, userId, playlistData) {
    this.spotifyApi.setAccessToken(accessToken);
    
    try {
      const playlist = await this.spotifyApi.createPlaylist(userId, playlistData.name, {
        description: playlistData.description,
        public: playlistData.public || false,
        collaborative: playlistData.collaborative || false
      });
      
      // Add tracks if provided
      if (playlistData.tracks && playlistData.tracks.length > 0) {
        await this.spotifyApi.addTracksToPlaylist(
          playlist.body.id,
          playlistData.tracks.map(id => `spotify:track:${id}`)
        );
      }
      
      return {
        id: playlist.body.id,
        name: playlist.body.name,
        url: playlist.body.external_urls.spotify,
        uri: playlist.body.uri
      };
    } catch (error) {
      console.error('Playlist creation error:', error);
      throw new Error('Failed to create playlist');
    }
  }

  // Search for tracks
  async searchTracks(accessToken, query, limit = 20) {
    this.spotifyApi.setAccessToken(accessToken);
    
    try {
      const data = await this.spotifyApi.searchTracks(query, { limit });
      
      return data.body.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => ({ id: a.id, name: a.name })),
        album: {
          id: track.album.id,
          name: track.album.name,
          images: track.album.images
        },
        duration: track.duration_ms,
        popularity: track.popularity,
        previewUrl: track.preview_url,
        uri: track.uri
      }));
    } catch (error) {
      console.error('Track search error:', error);
      throw new Error('Failed to search tracks');
    }
  }

  // Get audio features for tracks
  async getAudioFeatures(accessToken, trackIds) {
    this.spotifyApi.setAccessToken(accessToken);
    
    try {
      const data = await this.spotifyApi.getAudioFeaturesForTracks(trackIds);
      
      return data.body.audio_features.map(features => ({
        id: features.id,
        danceability: features.danceability,
        energy: features.energy,
        key: features.key,
        loudness: features.loudness,
        mode: features.mode,
        speechiness: features.speechiness,
        acousticness: features.acousticness,
        instrumentalness: features.instrumentalness,
        liveness: features.liveness,
        valence: features.valence,
        tempo: features.tempo,
        duration: features.duration_ms,
        timeSignature: features.time_signature
      }));
    } catch (error) {
      console.error('Audio features error:', error);
      throw new Error('Failed to fetch audio features');
    }
  }

  // Get recommendations based on seed data
  async getRecommendations(accessToken, seeds) {
    this.spotifyApi.setAccessToken(accessToken);
    
    try {
      const options = {
        seed_artists: seeds.artists?.slice(0, 2),
        seed_tracks: seeds.tracks?.slice(0, 2),
        seed_genres: seeds.genres?.slice(0, 1),
        limit: seeds.limit || 20,
        market: 'US'
      };
      
      // Add optional parameters
      if (seeds.targetEnergy) options.target_energy = seeds.targetEnergy;
      if (seeds.targetValence) options.target_valence = seeds.targetValence;
      if (seeds.targetTempo) options.target_tempo = seeds.targetTempo;
      
      const data = await this.spotifyApi.getRecommendations(options);
      
      return data.body.tracks.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => ({ id: a.id, name: a.name })),
        album: track.album.name,
        popularity: track.popularity,
        previewUrl: track.preview_url,
        uri: track.uri
      }));
    } catch (error) {
      console.error('Recommendations error:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  // Sync user's Spotify data with Not a Label
  async syncUserData(accessToken, userId) {
    try {
      const [profile, topArtists, topTracks] = await Promise.all([
        this.getUserProfile(accessToken),
        this.getTopArtists(accessToken, 'long_term', 50),
        this.getTopTracks(accessToken, 'long_term', 50)
      ]);
      
      // Extract genres from top artists
      const genreMap = {};
      topArtists.forEach(artist => {
        artist.genres.forEach(genre => {
          genreMap[genre] = (genreMap[genre] || 0) + 1;
        });
      });
      
      const topGenres = Object.entries(genreMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([genre]) => genre);
      
      return {
        profile,
        musicTaste: {
          topGenres,
          topArtists: topArtists.slice(0, 10),
          topTracks: topTracks.slice(0, 10)
        },
        syncedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Data sync error:', error);
      throw new Error('Failed to sync Spotify data');
    }
  }

  // Helper: Estimate streams based on popularity and followers
  estimateStreams(popularity, followers) {
    // Rough estimation formula based on Spotify's metrics
    const popularityMultiplier = Math.pow(popularity / 10, 2);
    const baseStreams = followers * 150; // Average streams per follower
    return Math.floor(baseStreams * popularityMultiplier);
  }

  // Check if artist exists on Spotify
  async findArtist(accessToken, artistName) {
    this.spotifyApi.setAccessToken(accessToken);
    
    try {
      const data = await this.spotifyApi.searchArtists(artistName, { limit: 5 });
      
      return data.body.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        followers: artist.followers.total,
        popularity: artist.popularity,
        images: artist.images,
        genres: artist.genres,
        spotifyUrl: artist.external_urls.spotify
      }));
    } catch (error) {
      console.error('Artist search error:', error);
      throw new Error('Failed to search for artist');
    }
  }
}

module.exports = SpotifyIntegration;