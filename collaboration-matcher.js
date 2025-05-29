// Artist Collaboration Matching System for Not a Label
const OpenAI = require('openai');

class CollaborationMatcher {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.matchingCriteria = [
      'genre_compatibility',
      'skill_complementarity', 
      'audience_overlap',
      'location_proximity',
      'career_stage',
      'collaboration_goals'
    ];
  }

  // Find potential collaborators for an artist
  async findCollaborators(artistProfile, preferences = {}) {
    const {
      genres,
      skills,
      location,
      careerStage,
      collaborationTypes,
      availability
    } = artistProfile;

    const prompt = `As a music industry collaboration expert, suggest 5 potential collaborators for an artist with:
    - Genres: ${genres.join(', ')}
    - Skills: ${skills.join(', ')}
    - Location: ${location}
    - Career stage: ${careerStage}
    - Looking for: ${collaborationTypes.join(', ')}
    - Availability: ${availability}
    
    For each match, provide:
    1. Artist name and profile
    2. Compatibility score (0-100)
    3. Collaboration opportunities
    4. Why they're a good match
    5. Potential project ideas
    
    Format as JSON array.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      const matches = JSON.parse(completion.choices[0].message.content);
      return this.enhanceMatches(matches, artistProfile);
    } catch (error) {
      console.error('Collaboration matching error:', error);
      return this.getDefaultMatches(artistProfile);
    }
  }

  // Match artists based on complementary skills
  async matchBySkills(primarySkills, desiredSkills) {
    const prompt = `Find artists who have ${desiredSkills.join(', ')} skills
    to complement someone with ${primarySkills.join(', ')} skills.
    
    Suggest 5 artists with:
    - Name
    - Primary skills
    - How they complement
    - Collaboration potential
    - Success likelihood`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8
    });

    return this.parseSkillMatches(completion.choices[0].message.content);
  }

  // Find collaboration opportunities based on project type
  async findProjectPartners(projectDetails) {
    const {
      type, // album, single, tour, music video, etc.
      genre,
      budget,
      timeline,
      requirements
    } = projectDetails;

    const prompt = `Recommend 5 artists perfect for a ${type} project:
    - Genre: ${genre}
    - Budget: ${budget}
    - Timeline: ${timeline}
    - Requirements: ${requirements.join(', ')}
    
    Provide realistic matches with availability and rates.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    return this.formatProjectPartners(completion.choices[0].message.content);
  }

  // Calculate collaboration compatibility score
  async calculateCompatibility(artist1Profile, artist2Profile) {
    const factors = {
      genreOverlap: this.calculateGenreOverlap(artist1Profile.genres, artist2Profile.genres),
      audienceMatch: this.calculateAudienceMatch(artist1Profile.audience, artist2Profile.audience),
      skillComplementarity: this.calculateSkillComplementarity(artist1Profile.skills, artist2Profile.skills),
      locationScore: this.calculateLocationScore(artist1Profile.location, artist2Profile.location),
      careerAlignment: this.calculateCareerAlignment(artist1Profile.careerStage, artist2Profile.careerStage)
    };

    const weights = {
      genreOverlap: 0.25,
      audienceMatch: 0.20,
      skillComplementarity: 0.25,
      locationScore: 0.15,
      careerAlignment: 0.15
    };

    const totalScore = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + (value * weights[key]);
    }, 0);

    return {
      totalScore: Math.round(totalScore),
      factors,
      recommendation: this.getRecommendationText(totalScore),
      collaborationIdeas: await this.generateCollaborationIdeas(artist1Profile, artist2Profile, factors)
    };
  }

  // Generate specific collaboration ideas
  async generateCollaborationIdeas(artist1, artist2, compatibility) {
    if (compatibility.totalScore < 50) {
      return ['Consider building relationship first', 'Start with small projects'];
    }

    const prompt = `Suggest 3 specific collaboration ideas for:
    Artist 1: ${artist1.genres.join(', ')} artist with ${artist1.skills.join(', ')}
    Artist 2: ${artist2.genres.join(', ')} artist with ${artist2.skills.join(', ')}
    
    Make suggestions creative and commercially viable.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 300
      });

      return this.parseCollaborationIdeas(completion.choices[0].message.content);
    } catch (error) {
      return ['Cross-genre single', 'Joint live performance', 'Co-written EP'];
    }
  }

  // Create collaboration proposal
  async createProposal(initiatorProfile, targetProfile, projectIdea) {
    const prompt = `Create a professional collaboration proposal:
    From: ${initiatorProfile.name} (${initiatorProfile.genres.join(', ')})
    To: ${targetProfile.name} (${targetProfile.genres.join(', ')})
    Project: ${projectIdea}
    
    Include:
    1. Introduction and mutual benefits
    2. Project details and timeline
    3. Role distribution
    4. Revenue sharing suggestion
    5. Next steps
    
    Keep it concise and professional.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      proposal: completion.choices[0].message.content,
      timestamp: new Date().toISOString(),
      status: 'draft'
    };
  }

  // Track collaboration success metrics
  async analyzeCollaborationSuccess(collaborationData) {
    const {
      artists,
      projectType,
      duration,
      outcomes
    } = collaborationData;

    // Calculate success metrics
    const metrics = {
      audienceGrowth: this.calculateAudienceGrowth(outcomes),
      revenueImpact: this.calculateRevenueImpact(outcomes),
      creativeSuccess: await this.assessCreativeSuccess(outcomes),
      relationshipStrength: this.assessRelationshipStrength(collaborationData)
    };

    return {
      overallSuccess: this.calculateOverallSuccess(metrics),
      metrics,
      recommendations: this.generateSuccessRecommendations(metrics),
      futurePotential: this.assessFuturePotential(metrics)
    };
  }

  // Helper methods
  calculateGenreOverlap(genres1, genres2) {
    const overlap = genres1.filter(g => genres2.includes(g));
    const union = new Set([...genres1, ...genres2]);
    return (overlap.length / union.size) * 100;
  }

  calculateAudienceMatch(audience1, audience2) {
    // Simplified audience matching logic
    const ageDiff = Math.abs(audience1.avgAge - audience2.avgAge);
    const locationMatch = audience1.topLocations.filter(l => 
      audience2.topLocations.includes(l)
    ).length;
    
    return Math.max(0, 100 - ageDiff * 5 + locationMatch * 10);
  }

  calculateSkillComplementarity(skills1, skills2) {
    const unique1 = skills1.filter(s => !skills2.includes(s));
    const unique2 = skills2.filter(s => !skills1.includes(s));
    const complementScore = (unique1.length + unique2.length) / (skills1.length + skills2.length);
    
    return Math.min(100, complementScore * 100);
  }

  calculateLocationScore(location1, location2) {
    if (location1.city === location2.city) return 100;
    if (location1.country === location2.country) return 70;
    if (location1.continent === location2.continent) return 40;
    return 20; // Remote collaboration
  }

  calculateCareerAlignment(stage1, stage2) {
    const stages = ['beginner', 'emerging', 'established', 'veteran'];
    const diff = Math.abs(stages.indexOf(stage1) - stages.indexOf(stage2));
    
    return Math.max(0, 100 - diff * 25);
  }

  getRecommendationText(score) {
    if (score >= 80) return 'Excellent match - high collaboration potential';
    if (score >= 60) return 'Good match - worth exploring';
    if (score >= 40) return 'Moderate match - selective collaboration';
    return 'Low match - build relationship first';
  }

  enhanceMatches(matches, artistProfile) {
    return matches.map(match => ({
      ...match,
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contactMethod: 'platform_message',
      verificationStatus: 'pending',
      sharedConnections: []
    }));
  }

  getDefaultMatches(artistProfile) {
    return [{
      name: 'Alex Rivers',
      compatibility: 75,
      genres: ['Indie', 'Electronic'],
      opportunities: ['Single collaboration', 'Live performance'],
      reason: 'Complementary styles and similar audience',
      projectIdeas: ['Indie-electronic fusion track']
    }];
  }

  parseSkillMatches(content) {
    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  formatProjectPartners(content) {
    return this.parseSkillMatches(content);
  }

  parseCollaborationIdeas(content) {
    const ideas = content.split('\n').filter(line => line.trim());
    return ideas.slice(0, 3);
  }

  calculateAudienceGrowth(outcomes) {
    return outcomes.newFollowers / outcomes.initialFollowers * 100;
  }

  calculateRevenueImpact(outcomes) {
    return outcomes.collaborationRevenue / outcomes.averageRevenue * 100;
  }

  async assessCreativeSuccess(outcomes) {
    // Simplified creative assessment
    return outcomes.criticalReception * 20 + outcomes.fanReception * 30;
  }

  assessRelationshipStrength(data) {
    return data.communicationFrequency * 25 + data.conflictResolution * 25;
  }

  calculateOverallSuccess(metrics) {
    const weights = {
      audienceGrowth: 0.3,
      revenueImpact: 0.3,
      creativeSuccess: 0.2,
      relationshipStrength: 0.2
    };

    return Object.entries(metrics).reduce((sum, [key, value]) => {
      return sum + (value * (weights[key] || 0));
    }, 0);
  }

  generateSuccessRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.audienceGrowth > 20) {
      recommendations.push('Continue cross-promotion strategies');
    }
    if (metrics.creativeSuccess > 70) {
      recommendations.push('Explore similar creative directions');
    }
    if (metrics.relationshipStrength < 50) {
      recommendations.push('Improve communication channels');
    }
    
    return recommendations;
  }

  assessFuturePotential(metrics) {
    const avg = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.values(metrics).length;
    return avg > 60 ? 'High' : avg > 40 ? 'Medium' : 'Low';
  }
}

module.exports = CollaborationMatcher;