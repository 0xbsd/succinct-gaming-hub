

let profileData = null;
let stats = null;
let achievements = [];

// Initialize profile page
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;
  
  await loadProfile();
  await loadStats();
  await loadAchievements();
  await loadGameHistory();
});

async function loadProfile() {
  try {
    const response = await zkAPI.user.getProfile();
    if (response.success) {
      profileData = response.data;
      displayProfile();
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}

async function loadStats() {
  try {
    const response = await zkAPI.user.getStats();
    if (response.success) {
      stats = response.data;
      displayStats();
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

async function loadAchievements() {
  try {
    const response = await zkAPI.user.getAchievements();
    if (response.success) {
      achievements = response.data;
      displayAchievements();
    }
  } catch (error) {
    console.error('Failed to load achievements:', error);
  }
}

async function loadGameHistory() {
  try {
    const response = await zkAPI.user.getGameHistory(10);
    if (response.success) {
      displayGameHistory(response.data.sessions);
    }
  } catch (error) {
    console.error('Failed to load game history:', error);
  }
}

function displayProfile() {
  document.getElementById('username').textContent = profileData.username || 'Anonymous';
  document.getElementById('userAddress').textContent = 
    profileData.address ? `\${profileData.address.slice(0, 6)}...\${profileData.address.slice(-4)}` : '';
  document.getElementById('userAvatar').textContent = profileData.avatar || '🎮';
  document.getElementById('userLevel').textContent = profileData.level || 1;
  document.getElementById('userPoints').textContent = profileData.zkPoints || 0;
}

function displayStats() {
  document.getElementById('totalGames').textContent = stats.totalGames || 0;
  document.getElementById('totalScore').textContent = stats.totalScore || 0;
  document.getElementById('avgScore').textContent = Math.round(stats.averageScore || 0);
  document.getElementById('highScore').textContent = stats.highScore || 0;
}

function displayAchievements() {
  const container = document.getElementById('achievementsGrid');
  container.innerHTML = achievements.map(a => `
    <div class="achievement-card \${a.achievement.rarity}">
      <div class="achievement-icon">\${a.achievement.iconUrl || '🏆'}</div>
      <h4>\${a.achievement.name}</h4>
      <p>\${a.achievement.description}</p>
      <div class="achievement-date">Unlocked: \${new Date(a.unlockedAt).toLocaleDateString()}</div>
    </div>
  `).join('');
}

function displayGameHistory(sessions) {
  const container = document.getElementById('gameHistory');
  container.innerHTML = sessions.map(s => `
    <div class="history-item">
      <div class="game-info">
        <span class="game-name">\${s.game.name}</span>
        <span class="game-date">\${new Date(s.startedAt).toLocaleDateString()}</span>
      </div>
      <div class="game-score">
        <span class="score">\${s.score} points</span>
        <span class="time">\${Math.round(s.timeElapsed / 60)}m</span>
      </div>
    </div>
  `).join('');
}

// Edit profile
async function editProfile() {
  const newUsername = prompt('Enter new username:', profileData.username);
  if (newUsername && newUsername !== profileData.username) {
    try {
      const response = await zkAPI.user.updateProfile({ username: newUsername });
      if (response.success) {
        profileData.username = newUsername;
        displayProfile();
        alert('Profile updated!');
      }
    } catch (error) {
      alert('Failed to update profile');
    }
  }
}

// Change avatar
function changeAvatar() {
  const avatars = ['🎮', '🎯', '🏆', '🎲', '🃏', '🚀', '🌟', '💎'];
  const currentIndex = avatars.indexOf(profileData.avatar || '🎮');
  const newAvatar = avatars[(currentIndex + 1) % avatars.length];
  
  zkAPI.user.updateProfile({ avatar: newAvatar }).then(response => {
    if (response.success) {
      profileData.avatar = newAvatar;
      displayProfile();
    }
  });
}
