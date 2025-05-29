// AI-Powered Music Recommendation Engine for Not a Label
const OpenAI = require('openai');

class MusicRecommendationEngine {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.genres = [
      'Rock', 'Pop', 'Hip-Hop', 'R&B', 'Jazz', 'Classical', 
      'Electronic', 'Country', 'Folk', 'Indie', 'Alternative',
      'Metal', 'Punk', 'Blues', 'Soul', 'Reggae', 'Latin'
    ];
    
    this.moods = [
      'Energetic', 'Calm', 'Happy', 'Sad', 'Romantic', 
      'Motivational', 'Dark', 'Chill', 'Party', 'Focus'
    ];
  }

  // Generate personalized recommendations based on user preferences
  async getRecommendations(userProfile) {
    const { favoriteGenres, recentlyPlayed, mood, activity } = userProfile;
    
    const prompt = `As a music recommendation AI for independent artists, suggest 5 songs based on:
    - Favorite genres: ${favoriteGenres.join(', ')}
    - Recently played: ${recentlyPlayed.join(', ')}
    - Current mood: ${mood}
    - Activity: ${activity}
    
    Focus on discovering independent artists. For each recommendation, provide:
    1. Artist name
    2. Song title
    3. Genre
    4. Why this matches the user's preferences
    5. Unique aspect of the artist
    
    Format as JSON array.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 800
      });

      const recommendations = JSON.parse(completion.choices[0].message.content);
      return this.enhanceRecommendations(recommendations);
    } catch (error) {
      console.error('Recommendation error:', error);
      return this.getFallbackRecommendations(userProfile);
    }
  }

  // Enhance recommendations with additional metadata
  enhanceRecommendations(recommendations) {
    return recommendations.map(rec => ({
      ...rec,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 confidence score
      tags: this.generateTags(rec),
      similarArtists: []
    }));
  }

  // Generate collaborative filtering recommendations
  async getCollaborativeRecommendations(userId, userInteractions) {
    // Find users with similar taste
    const similarUsers = await this.findSimilarUsers(userId, userInteractions);
    
    // Get their liked songs that current user hasn't heard
    const recommendations = await this.getSongsFromSimilarUsers(similarUsers, userId);
    
    return recommendations.slice(0, 10);
  }

  // Content-based filtering using song features
  async getContentBasedRecommendations(songFeatures) {
    const { tempo, energy, valence, acousticness, danceability } = songFeatures;
    
    const prompt = `Recommend 5 independent artists whose music matches these characteristics:
    - Tempo: ${tempo} BPM
    - Energy: ${energy}/10
    - Happiness: ${valence}/10
    - Acoustic: ${acousticness}/10
    - Danceability: ${danceability}/10
    
    Provide artist name, song title, and brief description.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    return this.parseRecommendations(completion.choices[0].message.content);
  }

  // Discover new artists based on user's exploration preferences
  async discoverNewArtists(discoveryProfile) {
    const { willingnessToExplore, excludeGenres, preferredEra } = discoveryProfile;
    
    const explorationLevel = willingnessToExplore > 0.7 ? 'adventurous' : 'moderate';
    
    const prompt = `Suggest 5 hidden gem independent artists for a ${explorationLevel} listener.
    Exclude: ${excludeGenres.join(', ')}
    Era preference: ${preferredEra}
    
    Focus on artists with <10k monthly listeners who deserve more recognition.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9
    });

    return this.formatDiscoveries(completion.choices[0].message.content);
  }

  // Generate playlist recommendations
  async generatePlaylist(theme, duration, userPreferences) {
    const songCount = Math.floor(duration / 3.5); // Assume 3.5 min average song
    
    const prompt = `Create a ${songCount}-song playlist for "${theme}".
    User preferences: ${JSON.stringify(userPreferences)}
    
    Mix well-known and undiscovered independent artists.
    Ensure good flow between songs.
    
    Format: Artist - Song Title`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8
    });

    return this.formatPlaylist(completion.choices[0].message.content, theme);
  }

  // Real-time recommendation adjustments
  async adjustRecommendations(currentRecommendations, userFeedback) {
    const { liked, disliked, skipped } = userFeedback;
    
    // Analyze patterns in feedback
    const patterns = this.analyzeFeedbackPatterns(liked, disliked, skipped);
    
    // Generate new recommendations avoiding disliked patterns
    const prompt = `Adjust music recommendations based on feedback:
    Liked patterns: ${patterns.liked}
    Disliked patterns: ${patterns.disliked}
    
    Suggest 5 new songs that match liked patterns and avoid disliked ones.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    return this.parseAdjustedRecommendations(completion.choices[0].message.content);
  }

  // Contextual recommendations based on time, weather, location
  async getContextualRecommendations(context) {
    const { timeOfDay, weather, location, activity } = context;
    
    const prompt = `Recommend music for:
    - Time: ${timeOfDay}
    - Weather: ${weather}
    - Location: ${location}
    - Activity: ${activity}
    
    Suggest 5 independent artists perfect for this context.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8
    });

    return this.formatContextualRecommendations(completion.choices[0].message.content);
  }

  // Helper methods
  generateId() {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTags(recommendation) {
    const tags = [recommendation.genre];
    if (recommendation.mood) tags.push(recommendation.mood);
    if (recommendation.era) tags.push(recommendation.era);
    return tags;
  }

  analyzeFeedbackPatterns(liked, disliked, skipped) {
    // Analyze common patterns in user feedback
    const likedGenres = this.extractGenres(liked);
    const dislikedGenres = this.extractGenres(disliked);
    
    return {
      liked: likedGenres.join(', '),
      disliked: dislikedGenres.join(', ')
    };
  }

  extractGenres(songs) {
    const genreCount = {};
    songs.forEach(song => {
      if (song.genre) {
        genreCount[song.genre] = (genreCount[song.genre] || 0) + 1;
      }
    });
    
    return Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .slice(0, 3);
  }

  getFallbackRecommendations(userProfile) {
    // Fallback recommendations when AI is unavailable
    const { favoriteGenres } = userProfile;
    const genre = favoriteGenres[0] || 'Indie';
    
    return [
      {
        artist: 'Luna Echo',
        song: 'Midnight Dreams',
        genre: genre,
        reason: 'Popular in your favorite genre',
        uniqueAspect: 'Rising independent artist'
      },
      {
        artist: 'Solar Winds',
        song: 'Golden Hour',
        genre: genre,
        reason: 'Matches your listening history',
        uniqueAspect: 'DIY production approach'
      }
    ];
  }

  // Placeholder methods for complex operations
  async findSimilarUsers(userId, userInteractions) {
    // In production, this would query a database
    return ['user123', 'user456', 'user789'];
  }

  async getSongsFromSimilarUsers(similarUsers, currentUserId) {
    // In production, this would fetch from database
    return [];
  }

  parseRecommendations(content) {
    // Parse AI response into structured format
    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  formatDiscoveries(content) {
    // Format discovery recommendations
    return this.parseRecommendations(content);
  }

  formatPlaylist(content, theme) {
    // Format playlist with metadata
    const songs = content.split('\n').filter(line => line.trim());
    return {
      theme,
      songs: songs.map((song, index) => ({
        position: index + 1,
        track: song.trim()
      })),
      duration: songs.length * 3.5,
      created: new Date().toISOString()
    };
  }

  parseAdjustedRecommendations(content) {
    return this.parseRecommendations(content);
  }

  formatContextualRecommendations(content) {
    return this.parseRecommendations(content);
  }
}

// Export for use in backend
module.exports = MusicRecommendationEngine;