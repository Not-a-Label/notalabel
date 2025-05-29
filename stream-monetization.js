// Stream Monetization System for Not a Label
const stripe = require('stripe');
const EventEmitter = require('events');

class StreamMonetizationSystem extends EventEmitter {
  constructor(config) {
    super();
    this.stripe = stripe(config.stripeSecretKey);
    this.platformFeePercent = config.platformFeePercent || 10;
    this.currency = config.currency || 'usd';
    
    // Revenue share configuration
    this.revenueShares = {
      artist: 70,      // 70% to artist
      platform: 20,    // 20% to platform
      moderators: 5,   // 5% to moderators
      charity: 5       // 5% to charity (optional)
    };
    
    // Monetization tiers
    this.tiers = {
      free: {
        price: 0,
        features: ['chat', 'reactions', 'standard_quality']
      },
      supporter: {
        price: 4.99,
        features: ['chat', 'reactions', 'hd_quality', 'badge', 'emotes']
      },
      vip: {
        price: 9.99,
        features: ['chat', 'reactions', '4k_quality', 'vip_badge', 'exclusive_emotes', 'backstage_access', 'meet_greet_raffle']
      },
      superfan: {
        price: 19.99,
        features: ['all_vip_features', 'monthly_merch', 'signed_items', 'personal_shoutout', 'exclusive_content']
      }
    };
  }

  // Create stream product
  async createStreamProduct(streamData) {
    try {
      // Create product for the stream
      const product = await this.stripe.products.create({
        name: `${streamData.title} - Virtual Concert`,
        description: streamData.description,
        metadata: {
          streamId: streamData.id,
          artistId: streamData.artistId,
          type: 'live_stream'
        }
      });
      
      // Create prices for different access levels
      const prices = await this.createStreamPrices(product.id, streamData);
      
      return {
        productId: product.id,
        prices,
        checkoutUrls: await this.generateCheckoutUrls(prices, streamData)
      };
    } catch (error) {
      console.error('Stream product creation error:', error);
      throw new Error('Failed to create stream product');
    }
  }

  // Create pricing tiers for stream
  async createStreamPrices(productId, streamData) {
    const prices = {};
    
    // Create ticket prices
    if (streamData.ticketPrice > 0) {
      prices.ticket = await this.stripe.prices.create({
        product: productId,
        unit_amount: Math.round(streamData.ticketPrice * 100),
        currency: this.currency,
        metadata: {
          type: 'stream_ticket',
          streamId: streamData.id
        }
      });
    }
    
    // Create tier prices
    for (const [tierName, tierData] of Object.entries(this.tiers)) {
      if (tierData.price > 0) {
        prices[tierName] = await this.stripe.prices.create({
          product: productId,
          unit_amount: Math.round(tierData.price * 100),
          currency: this.currency,
          recurring: { interval: 'month' },
          metadata: {
            type: 'stream_tier',
            tier: tierName,
            streamId: streamData.id
          }
        });
      }
    }
    
    return prices;
  }

  // Generate checkout URLs
  async generateCheckoutUrls(prices, streamData) {
    const urls = {};
    
    for (const [type, price] of Object.entries(prices)) {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: price.id,
          quantity: 1
        }],
        mode: price.recurring ? 'subscription' : 'payment',
        success_url: `https://not-a-label.art/stream/${streamData.id}?access=granted`,
        cancel_url: `https://not-a-label.art/stream/${streamData.id}?access=cancelled`,
        metadata: {
          streamId: streamData.id,
          accessType: type
        },
        payment_intent_data: price.recurring ? undefined : {
          application_fee_amount: this.calculatePlatformFee(price.unit_amount),
          transfer_data: {
            destination: streamData.artistStripeAccountId
          }
        }
      });
      
      urls[type] = session.url;
    }
    
    return urls;
  }

  // Process tip during stream
  async processTip(tipData) {
    try {
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(tipData.amount * 100),
        currency: this.currency,
        customer: tipData.customerId,
        description: `Tip for ${tipData.artistName} - ${tipData.streamTitle}`,
        metadata: {
          type: 'stream_tip',
          streamId: tipData.streamId,
          artistId: tipData.artistId,
          message: tipData.message || '',
          userName: tipData.userName
        },
        application_fee_amount: this.calculatePlatformFee(tipData.amount * 100),
        transfer_data: {
          destination: tipData.artistStripeAccountId
        }
      });
      
      // Emit tip event for real-time display
      this.emit('tipReceived', {
        streamId: tipData.streamId,
        amount: tipData.amount,
        userName: tipData.userName,
        message: tipData.message,
        timestamp: new Date()
      });
      
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Tip processing error:', error);
      throw new Error('Failed to process tip');
    }
  }

  // Process super chat
  async processSuperChat(chatData) {
    try {
      // Different tiers for super chat
      const superChatTiers = {
        blue: { min: 1, max: 4.99, duration: 60 },
        green: { min: 5, max: 9.99, duration: 120 },
        yellow: { min: 10, max: 49.99, duration: 300 },
        orange: { min: 50, max: 99.99, duration: 600 },
        red: { min: 100, max: 500, duration: 1800 }
      };
      
      // Determine tier
      let tier = 'blue';
      for (const [tierName, tierData] of Object.entries(superChatTiers)) {
        if (chatData.amount >= tierData.min && chatData.amount <= tierData.max) {
          tier = tierName;
          break;
        }
      }
      
      // Process payment
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(chatData.amount * 100),
        currency: this.currency,
        customer: chatData.customerId,
        description: `Super Chat - ${chatData.streamTitle}`,
        metadata: {
          type: 'super_chat',
          streamId: chatData.streamId,
          artistId: chatData.artistId,
          message: chatData.message,
          userName: chatData.userName,
          tier: tier
        },
        application_fee_amount: this.calculatePlatformFee(chatData.amount * 100),
        transfer_data: {
          destination: chatData.artistStripeAccountId
        }
      });
      
      // Emit super chat event
      this.emit('superChatReceived', {
        streamId: chatData.streamId,
        amount: chatData.amount,
        userName: chatData.userName,
        message: chatData.message,
        tier: tier,
        duration: superChatTiers[tier].duration,
        timestamp: new Date()
      });
      
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        tier: tier,
        duration: superChatTiers[tier].duration
      };
    } catch (error) {
      console.error('Super chat processing error:', error);
      throw new Error('Failed to process super chat');
    }
  }

  // Virtual merchandise sales during stream
  async sellVirtualMerch(merchData) {
    try {
      const items = [
        { name: 'Virtual T-Shirt', price: 15, type: 'virtual_apparel' },
        { name: 'Digital Album', price: 10, type: 'digital_music' },
        { name: 'Exclusive Wallpaper Pack', price: 5, type: 'digital_art' },
        { name: 'Virtual Meet & Greet', price: 50, type: 'experience' },
        { name: 'Signed Digital Poster', price: 25, type: 'digital_collectible' }
      ];
      
      const selectedItem = items.find(item => item.name === merchData.itemName);
      if (!selectedItem) {
        throw new Error('Invalid merchandise item');
      }
      
      // Create order
      const order = await this.stripe.paymentIntents.create({
        amount: Math.round(selectedItem.price * 100),
        currency: this.currency,
        customer: merchData.customerId,
        description: `${selectedItem.name} - ${merchData.streamTitle}`,
        metadata: {
          type: 'virtual_merch',
          itemType: selectedItem.type,
          itemName: selectedItem.name,
          streamId: merchData.streamId,
          artistId: merchData.artistId,
          buyerName: merchData.buyerName
        },
        application_fee_amount: this.calculatePlatformFee(selectedItem.price * 100),
        transfer_data: {
          destination: merchData.artistStripeAccountId
        }
      });
      
      // Emit merchandise sale event
      this.emit('merchSold', {
        streamId: merchData.streamId,
        item: selectedItem,
        buyerName: merchData.buyerName,
        timestamp: new Date()
      });
      
      return {
        success: true,
        orderId: order.id,
        item: selectedItem,
        downloadUrl: await this.generateMerchDownloadUrl(selectedItem, merchData)
      };
    } catch (error) {
      console.error('Virtual merch sale error:', error);
      throw new Error('Failed to process merchandise sale');
    }
  }

  // Stream revenue analytics
  async getStreamRevenue(streamId, artistStripeAccountId) {
    try {
      // Get all charges for this stream
      const charges = await this.stripe.charges.list({
        limit: 100,
        expand: ['data.balance_transaction'],
        metadata: { streamId }
      }, {
        stripeAccount: artistStripeAccountId
      });
      
      // Calculate revenue breakdown
      const revenue = {
        tickets: 0,
        tips: 0,
        superChats: 0,
        merchandise: 0,
        subscriptions: 0,
        total: 0,
        platformFees: 0,
        netRevenue: 0,
        transactions: []
      };
      
      charges.data.forEach(charge => {
        const amount = charge.amount / 100;
        const fee = charge.application_fee_amount / 100;
        
        switch (charge.metadata.type) {
          case 'stream_ticket':
            revenue.tickets += amount;
            break;
          case 'stream_tip':
            revenue.tips += amount;
            break;
          case 'super_chat':
            revenue.superChats += amount;
            break;
          case 'virtual_merch':
            revenue.merchandise += amount;
            break;
          case 'stream_tier':
            revenue.subscriptions += amount;
            break;
        }
        
        revenue.total += amount;
        revenue.platformFees += fee;
        
        revenue.transactions.push({
          id: charge.id,
          type: charge.metadata.type,
          amount: amount,
          fee: fee,
          net: amount - fee,
          userName: charge.metadata.userName,
          timestamp: new Date(charge.created * 1000)
        });
      });
      
      revenue.netRevenue = revenue.total - revenue.platformFees;
      
      // Calculate projections
      revenue.projections = this.calculateRevenueProjections(revenue, streamId);
      
      return revenue;
    } catch (error) {
      console.error('Revenue calculation error:', error);
      throw new Error('Failed to calculate stream revenue');
    }
  }

  // Revenue sharing distribution
  async distributeRevenue(streamId, totalRevenue) {
    try {
      const distributions = [];
      
      // Calculate shares
      const shares = {
        artist: (totalRevenue * this.revenueShares.artist) / 100,
        platform: (totalRevenue * this.revenueShares.platform) / 100,
        moderators: (totalRevenue * this.revenueShares.moderators) / 100,
        charity: (totalRevenue * this.revenueShares.charity) / 100
      };
      
      // Process payouts
      for (const [recipient, amount] of Object.entries(shares)) {
        if (amount > 0) {
          const payout = await this.processPayout(recipient, amount, streamId);
          distributions.push(payout);
        }
      }
      
      return {
        totalRevenue,
        distributions,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Revenue distribution error:', error);
      throw new Error('Failed to distribute revenue');
    }
  }

  // Subscription management
  async manageStreamSubscription(subscriptionData) {
    try {
      switch (subscriptionData.action) {
        case 'create':
          return this.createSubscription(subscriptionData);
        case 'upgrade':
          return this.upgradeSubscription(subscriptionData);
        case 'cancel':
          return this.cancelSubscription(subscriptionData);
        default:
          throw new Error('Invalid subscription action');
      }
    } catch (error) {
      console.error('Subscription management error:', error);
      throw new Error('Failed to manage subscription');
    }
  }

  // Create fan subscription
  async createSubscription(data) {
    const subscription = await this.stripe.subscriptions.create({
      customer: data.customerId,
      items: [{ price: data.priceId }],
      metadata: {
        artistId: data.artistId,
        tier: data.tier,
        fanId: data.fanId
      },
      application_fee_percent: this.platformFeePercent,
      transfer_data: {
        destination: data.artistStripeAccountId
      }
    });
    
    // Grant access
    await this.grantTierAccess(data.fanId, data.tier, data.artistId);
    
    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      tier: data.tier,
      nextBillingDate: new Date(subscription.current_period_end * 1000)
    };
  }

  // Calculate and track metrics
  calculateRevenueProjections(currentRevenue, streamId) {
    // Average revenue per viewer
    const avgRevenuePerViewer = currentRevenue.total / (currentRevenue.transactions.length || 1);
    
    // Conversion rates
    const conversionRates = {
      viewerToTipper: 0.05,      // 5% of viewers tip
      viewerToSubscriber: 0.02,   // 2% become subscribers
      viewerToMerchBuyer: 0.03    // 3% buy merchandise
    };
    
    return {
      perHour: currentRevenue.total * 2, // Assuming 30min so far
      per1000Viewers: avgRevenuePerViewer * 1000,
      projectedTotal: currentRevenue.total * 3, // 3x for full stream
      conversionRates
    };
  }

  // Helper methods
  calculatePlatformFee(amount) {
    return Math.round(amount * (this.platformFeePercent / 100));
  }

  async generateMerchDownloadUrl(item, merchData) {
    // In production, generate secure S3 presigned URL
    return `https://downloads.not-a-label.art/merch/${merchData.streamId}/${item.type}/${Date.now()}`;
  }

  async grantTierAccess(fanId, tier, artistId) {
    // Update database with tier access
    console.log(`Granting ${tier} access to fan ${fanId} for artist ${artistId}`);
  }

  async processPayout(recipient, amount, streamId) {
    // Process actual payout through Stripe Connect
    console.log(`Processing payout of $${amount} to ${recipient} for stream ${streamId}`);
    return {
      recipient,
      amount,
      status: 'pending',
      estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  // Gamification and incentives
  async processViewerRewards(viewerData) {
    const rewards = {
      watchTime: {
        30: { points: 10, badge: 'supporter' },
        60: { points: 25, badge: 'dedicated_fan' },
        120: { points: 50, badge: 'superfan' }
      },
      interactions: {
        tips: { points: 20, multiplier: 2 },
        superChats: { points: 30, multiplier: 3 },
        reactions: { points: 1, multiplier: 1 }
      }
    };
    
    let totalPoints = 0;
    let earnedBadges = [];
    
    // Calculate watch time rewards
    const watchMinutes = viewerData.watchTime / 60000;
    for (const [minutes, reward] of Object.entries(rewards.watchTime)) {
      if (watchMinutes >= parseInt(minutes)) {
        totalPoints += reward.points;
        earnedBadges.push(reward.badge);
      }
    }
    
    // Calculate interaction rewards
    if (viewerData.interactions) {
      for (const [type, count] of Object.entries(viewerData.interactions)) {
        if (rewards.interactions[type]) {
          totalPoints += rewards.interactions[type].points * count * rewards.interactions[type].multiplier;
        }
      }
    }
    
    return {
      viewerId: viewerData.viewerId,
      points: totalPoints,
      badges: earnedBadges,
      level: Math.floor(totalPoints / 100),
      nextLevelProgress: totalPoints % 100
    };
  }
}

module.exports = StreamMonetizationSystem;