// API Endpoint Testing Script for Not a Label Platform
const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.API_URL || 'https://not-a-label.art/api';
const TEST_TOKEN = process.env.TEST_TOKEN || '';

// Test results tracking
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper function to make API calls
async function testEndpoint(method, endpoint, data = null, requiresAuth = false) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {}
  };

  if (requiresAuth && TEST_TOKEN) {
    config.headers['Authorization'] = `Bearer ${TEST_TOKEN}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      status: error.response?.status || 'Network Error',
      error: error.response?.data || error.message 
    };
  }
}

// Test runner
async function runTest(testName, testFunc) {
  process.stdout.write(`Testing ${testName}... `);
  
  try {
    const result = await testFunc();
    if (result.success) {
      console.log('✅ PASSED'.green);
      passedTests++;
      testResults.push({ test: testName, status: 'PASSED', details: result });
    } else {
      console.log('❌ FAILED'.red);
      failedTests++;
      testResults.push({ test: testName, status: 'FAILED', details: result });
    }
  } catch (error) {
    console.log('❌ ERROR'.red);
    failedTests++;
    testResults.push({ test: testName, status: 'ERROR', error: error.message });
  }
}

// API Tests
async function runAllTests() {
  console.log('🧪 Not a Label API Endpoint Testing\n'.cyan.bold);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Authentication: ${TEST_TOKEN ? 'Token provided' : 'No token (public endpoints only)'}\n`);

  // Public Endpoints
  console.log('📡 Testing Public Endpoints'.yellow);
  
  await runTest('Health Check', async () => {
    const result = await testEndpoint('GET', '/health');
    return { success: result.status === 200 };
  });

  await runTest('Auth - Login Endpoint', async () => {
    const result = await testEndpoint('POST', '/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    return { success: [200, 401].includes(result.status) };
  });

  await runTest('Auth - Register Endpoint', async () => {
    const result = await testEndpoint('POST', '/auth/register', {
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      name: 'Test User'
    });
    return { success: [201, 400, 409].includes(result.status) };
  });

  await runTest('Contact Form', async () => {
    const result = await testEndpoint('POST', '/contact', {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'API Test',
      category: 'general',
      message: 'Testing contact form API'
    });
    return { success: [200, 201].includes(result.status) };
  });

  // Protected Endpoints (require authentication)
  if (TEST_TOKEN) {
    console.log('\n🔐 Testing Protected Endpoints'.yellow);

    await runTest('User Profile', async () => {
      const result = await testEndpoint('GET', '/user/profile', null, true);
      return { success: result.status === 200 };
    });

    await runTest('Music - Get My Tracks', async () => {
      const result = await testEndpoint('GET', '/music/my-tracks', null, true);
      return { success: result.status === 200 };
    });

    await runTest('Analytics - Overview', async () => {
      const result = await testEndpoint('GET', '/analytics/overview', null, true);
      return { success: result.status === 200 };
    });

    await runTest('Analytics - Streaming', async () => {
      const result = await testEndpoint('GET', '/analytics/streaming', null, true);
      return { success: result.status === 200 };
    });

    await runTest('Analytics - Revenue', async () => {
      const result = await testEndpoint('GET', '/analytics/revenue', null, true);
      return { success: result.status === 200 };
    });

    await runTest('Collaboration - Projects', async () => {
      const result = await testEndpoint('GET', '/collaboration/projects', null, true);
      return { success: result.status === 200 };
    });

    await runTest('Live Performance - Sessions', async () => {
      const result = await testEndpoint('GET', '/live/sessions', null, true);
      return { success: result.status === 200 };
    });

    await runTest('Education - Tutorials', async () => {
      const result = await testEndpoint('GET', '/education/tutorials', null, true);
      return { success: result.status === 200 };
    });

    await runTest('Marketplace - Beats', async () => {
      const result = await testEndpoint('GET', '/marketplace/beats', null, true);
      return { success: result.status === 200 };
    });

    await runTest('Mobile - Offline Tracks', async () => {
      const result = await testEndpoint('GET', '/mobile/offline-tracks', null, true);
      return { success: result.status === 200 };
    });

    await runTest('AI Music - Templates', async () => {
      const result = await testEndpoint('GET', '/ai-music/ai-templates', null, true);
      return { success: result.status === 200 };
    });
  }

  // Feature-specific endpoints
  console.log('\n🎯 Testing Feature Endpoints'.yellow);

  await runTest('Music Distribution - Platforms', async () => {
    const result = await testEndpoint('GET', '/music-distribution/platforms');
    return { success: [200, 401].includes(result.status) };
  });

  await runTest('Social Media - Supported Platforms', async () => {
    const result = await testEndpoint('GET', '/social/platforms');
    return { success: [200, 401].includes(result.status) };
  });

  // Test Summary
  console.log('\n📊 Test Summary'.cyan.bold);
  console.log(`Total Tests: ${passedTests + failedTests}`);
  console.log(`Passed: ${passedTests}`.green);
  console.log(`Failed: ${failedTests}`.red);
  console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

  // Failed test details
  if (failedTests > 0) {
    console.log('\n❌ Failed Tests Details:'.red);
    testResults
      .filter(r => r.status === 'FAILED' || r.status === 'ERROR')
      .forEach(r => {
        console.log(`\n${r.test}:`);
        console.log(JSON.stringify(r.details || r.error, null, 2));
      });
  }

  // Recommendations
  console.log('\n💡 Recommendations:'.yellow);
  if (!TEST_TOKEN) {
    console.log('- Provide a test token to test protected endpoints');
    console.log('  Export TEST_TOKEN="your-jwt-token" before running tests');
  }
  if (failedTests > 0) {
    console.log('- Check server logs for error details');
    console.log('- Verify database connections');
    console.log('- Ensure all required environment variables are set');
  }
}

// Performance testing
async function performanceTest() {
  console.log('\n⚡ Performance Testing'.cyan.bold);
  
  const endpoints = [
    { name: 'Health Check', url: '/health' },
    { name: 'Auth Login', url: '/auth/login' },
    { name: 'Analytics Overview', url: '/analytics/overview', auth: true }
  ];

  for (const endpoint of endpoints) {
    const times = [];
    const iterations = 10;
    
    process.stdout.write(`Testing ${endpoint.name} (${iterations} requests)... `);
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await testEndpoint('GET', endpoint.url, null, endpoint.auth);
      const end = Date.now();
      times.push(end - start);
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);
    
    console.log(`Avg: ${avg.toFixed(0)}ms, Min: ${min}ms, Max: ${max}ms`);
  }
}

// Run tests
async function main() {
  try {
    await runAllTests();
    
    // Only run performance tests if basic tests pass
    if (failedTests === 0) {
      await performanceTest();
    }
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

// Check if axios is installed
try {
  require.resolve('axios');
  require.resolve('colors');
  main();
} catch (e) {
  console.log('Installing required dependencies...');
  require('child_process').execSync('npm install axios colors', { stdio: 'inherit' });
  console.log('Dependencies installed. Please run the script again.');
}