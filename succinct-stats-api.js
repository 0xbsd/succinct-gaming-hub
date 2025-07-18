// ==========================================
// CORRECT SUCCINCT STATS API CONFIGURATION
// ==========================================

class SuccinctStatsAPI {
  constructor() {
    // CORRECT URL from the documentation
    this.baseUrl = 'https://www.succinct-stats.xyz';
    this.apiKey = null; // No API key needed
    
    console.log('✅ Succinct Stats API configured with correct URL');
  }

  async checkTwitterUser(twitterUsername) {
    try {
      // Clean the username (add @ if not present)
      const cleanUsername = twitterUsername.startsWith('@') 
        ? twitterUsername 
        : `@${twitterUsername}`;

      console.log(`🔍 Checking Succinct Stats for user: ${cleanUsername}`);

      // CORRECT API endpoint from documentation
      const apiUrl = `${this.baseUrl}/api/leaderboard?action=getByUsername&username=${encodeURIComponent(cleanUsername)}`;
      
      console.log(`📡 API URL: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Succinct-Gaming-Hub/1.0'
        },
        timeout: 10000
      });

      console.log(`📡 Succinct Stats API response: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Succinct Stats data received:', result);

        // Check if user data exists
        if (result.data && Object.keys(result.data).length > 0) {
          return {
            found: true,
            data: {
              twitterUsername: cleanUsername,
              points: result.data.stars || 0,
              rank: result.data.rank || null,
              joinDate: result.data.created_at || null,
              achievements: this.extractAchievements(result),
              isActive: true,
              // Additional Succinct Stats data
              proofs: result.progress?.proofs || 0,
              cycles: result.progress?.cycles || 0,
              stars: result.data.stars || 0,
              topPercentage: result.topPercentage || null
            }
          };
        } else {
          console.log('❌ User not found in Succinct Stats');
          return { found: false };
        }

      } else if (response.status === 404) {
        console.log('❌ User not found in Succinct Stats (404)');
        return { found: false };
      } else {
        console.error(`❌ Succinct Stats API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Succinct Stats API returned ${response.status}: ${errorText}`);
      }

    } catch (error) {
      console.error('❌ Succinct Stats API Error:', error);
      
      // For development, fall back to mock data
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Using mock data for development');
        return this.getMockSuccinctData(twitterUsername);
      }
      
      throw new Error('Failed to verify Twitter account with Succinct Stats: ' + error.message);
    }
  }

  extractAchievements(succinctData) {
    const achievements = [];
    
    if (succinctData.data?.stars > 1000) {
      achievements.push('Star Collector');
    }
    if (succinctData.data?.stars > 5000) {
      achievements.push('ZK Expert');
    }
    if (succinctData.progress?.proofs > 100) {
      achievements.push('Proof Master');
    }
    if (succinctData.topPercentage && parseFloat(succinctData.topPercentage) < 10) {
      achievements.push('Top 10%');
    }

    if (achievements.length === 0) {
      achievements.push('Succinct Community Member');
    }

    return achievements;
  }

  getMockSuccinctData(twitterUsername) {
    const mockUsers = [
      'zkdev', 'testuser', 'demo', 'succinct', 'zk_learner',
      'your_twitter_handle', 'zkgamer', 'cryptoproof'
    ];
    
    if (mockUsers.includes(twitterUsername.toLowerCase().replace('@', ''))) {
      return {
        found: true,
        data: {
          twitterUsername: twitterUsername.startsWith('@') ? twitterUsername : `@${twitterUsername}`,
          points: Math.floor(Math.random() * 5000) + 500,
          rank: Math.floor(Math.random() * 500) + 1,
          joinDate: '2024-01-15T00:00:00Z',
          achievements: ['Mock User', 'Developer'],
          isActive: true
        }
      };
    }
    
    return { found: false };
  }

  // Test method to verify the API works
  async testConnection() {
    try {
      console.log('🧪 Testing Succinct Stats API connection...');
      
      // Test the general leaderboard endpoint first
      const testUrl = `${this.baseUrl}/api/leaderboard`;
      console.log(`Testing: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Succinct-Gaming-Hub/1.0'
        }
      });

      console.log(`Test response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection successful!');
        console.log(`📊 Found ${data.total || 'unknown'} total entries`);
        return true;
      } else {
        console.error('❌ API connection failed');
        return false;
      }

    } catch (error) {
      console.error('❌ API test failed:', error);
      return false;
    }
  }
}

// ==========================================
// CORRECT ENVIRONMENT CONFIGURATION
// ==========================================

const correctEnvConfig = `
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# Succinct Stats API (CORRECTED URL)
SUCCINCT_STATS_API_URL=https://www.succinct-stats.xyz

# Security Keys
ADMIN_API_KEY=your_secure_admin_key
CLEANUP_API_KEY=your_secure_cleanup_key

# Server Configuration
PORT=3001
NODE_ENV=development
`;

// ==========================================
// TEST THE CORRECT API
// ==========================================

async function testCorrectAPI() {
  const api = new SuccinctStatsAPI();
  
  console.log('🔍 Testing correct Succinct Stats API...');
  
  // Test connection first
  const connectionOk = await api.testConnection();
  
  if (connectionOk) {
    console.log('✅ Connection successful, testing user lookup...');
    
    // Test with a mock user to see the response format
    try {
      const result = await api.checkTwitterUser('testuser');
      console.log('Test result:', result);
    } catch (error) {
      console.log('User test result (expected for non-existent user):', error.message);
    }
  } else {
    console.log('❌ Connection failed - check URL or network');
  }
}

// ==========================================
// VERIFICATION SCRIPT
// ==========================================

const verificationChecklist = `
✅ VERIFICATION CHECKLIST:

□ Base URL: https://www.succinct-stats.xyz (correct)
□ API endpoint: /api/leaderboard?action=getByUsername&username=@user
□ No API key required
□ Test connection with general leaderboard endpoint
□ Test user lookup with known username

🔧 UPDATED FILES:
□ Update SUCCINCT_STATS_API_URL in .env
□ Update backend API integration
□ Update verification site API calls
□ Test the complete flow

🧪 TESTING:
□ Visit: https://www.succinct-stats.xyz/api/leaderboard
□ Should return leaderboard data
□ Test user lookup with real username from leaderboard
`;

console.log(verificationChecklist);

module.exports = {
  SuccinctStatsAPI,
  testCorrectAPI,
  correctEnvConfig
};

// Run test if this is the main module
if (require.main === module) {
  testCorrectAPI().catch(console.error);
}
