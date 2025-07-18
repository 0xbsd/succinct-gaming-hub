// zkapi-mock.js
// Provides a global mock zkAPI object to prevent frontend errors when backend is missing

window.zkAPI = {
  user: {
    getProfile: async () => ({
      username: 'demo_user',
      avatar: 'default.png',
      email: 'demo@example.com',
      joined: '2024-01-01',
      bio: 'This is a demo user profile.'
    }),
    getStats: async () => ({
      gamesPlayed: 42,
      wins: 21,
      losses: 21,
      score: 1234
    }),
    getAchievements: async () => ([
      { id: 1, name: 'First Win', unlocked: true },
      { id: 2, name: 'Puzzle Master', unlocked: false }
    ]),
    getGameHistory: async (limit = 10) => ([
      { game: 'Sudoku', result: 'win', date: '2025-07-01' },
      { game: 'Proof Puzzle', result: 'loss', date: '2025-06-28' }
    ].slice(0, limit)),
    updateProfile: async (data) => ({
      success: true,
      ...data
    })
  }
};

console.info('Mock zkAPI loaded. All API calls are simulated.');
