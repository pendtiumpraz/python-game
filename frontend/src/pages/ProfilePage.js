import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Crown, 
  Star, 
  Trophy, 
  Calendar, 
  Target,
  Share2,
  Download,
  Edit,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { currentUser, userProgress } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const shareAchievement = (platform) => {
    const message = `I just reached level ${userProgress.level} on CodeQuest! 🎮✨ Learning Python through gamified quests. Check it out! #CodeQuest #PythonLearning`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    toast.success('Shared successfully!');
  };

  const downloadProgress = () => {
    const progressData = {
      user: currentUser.displayName || currentUser.email,
      level: userProgress.level,
      xp: userProgress.xp,
      completedQuests: userProgress.completedQuests,
      achievements: userProgress.achievements,
      exportDate: new Date().toISOString()
    };
    
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(progressData, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'codequest_progress.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Progress downloaded!');
  };

  const getXPProgress = () => {
    const currentLevelXP = userProgress.level * 100;
    const progressPercentage = (userProgress.xp % 100) / 100 * 100;
    return progressPercentage;
  };

  const getXPToNextLevel = () => {
    return (userProgress.level * 100) - (userProgress.xp % 100);
  };

  const mockAchievements = [
    { id: 1, name: 'First Quest', description: 'Complete your first quest', icon: '🎯', unlocked: true },
    { id: 2, name: 'Python Novice', description: 'Complete 5 basic quests', icon: '🐍', unlocked: true },
    { id: 3, name: 'Code Warrior', description: 'Reach level 5', icon: '⚔️', unlocked: userProgress.level >= 5 },
    { id: 4, name: 'OOP Master', description: 'Complete all OOP quests', icon: '🏛️', unlocked: false },
    { id: 5, name: 'Data Structures Hero', description: 'Complete all data structure quests', icon: '📊', unlocked: false },
    { id: 6, name: 'Speed Demon', description: 'Complete a quest in under 5 minutes', icon: '⚡', unlocked: false },
  ];

  const questCategories = [
    { name: 'Basics', completed: 2, total: 5, color: 'bg-blue-500' },
    { name: 'OOP', completed: 0, total: 4, color: 'bg-purple-500' },
    { name: 'Data Structures', completed: 0, total: 3, color: 'bg-green-500' },
    { name: 'Algorithms', completed: 0, total: 4, color: 'bg-red-500' },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-glass-effect rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="bg-gradient-to-r from-gold-400 to-gold-600 rounded-full w-24 h-24 flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            
            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-fantasy font-bold text-white mb-2">
                {currentUser.displayName || currentUser.email}
              </h1>
              {currentUser.isGuest && (
                <p className="text-yellow-400 mb-2">Guest User</p>
              )}
              <div className="flex items-center justify-center md:justify-start space-x-6 mb-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-gold-400" />
                  <span className="text-white font-semibold">Level {userProgress.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-white">{userProgress.xp} XP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-purple-400" />
                  <span className="text-white">{userProgress.completedQuests.length} Quests</span>
                </div>
              </div>
              
              {/* XP Progress */}
              <div className="w-full max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Level {userProgress.level}</span>
                  <span>{getXPToNextLevel()} XP to next level</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-gold-400 to-gold-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getXPProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={downloadProgress}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Progress</span>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => shareAchievement('twitter')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors"
                  title="Share on Twitter"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => shareAchievement('facebook')}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-lg transition-colors"
                  title="Share on Facebook"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => shareAchievement('linkedin')}
                  className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-2 rounded-lg transition-colors"
                  title="Share on LinkedIn"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => shareAchievement('whatsapp')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
                  title="Share on WhatsApp"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {['overview', 'achievements', 'progress'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-2 rounded-md font-semibold transition-colors capitalize
                  ${activeTab === tab 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === 'overview' && (
            <>
              {/* Quest Progress */}
              <div className="lg:col-span-2">
                <div className="bg-glass-effect rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Quest Progress</h2>
                  <div className="space-y-4">
                    {questCategories.map((category, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{category.name}</h3>
                          <span className="text-gray-400 text-sm">
                            {category.completed}/{category.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`${category.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${(category.completed / category.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <div className="bg-glass-effect rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Total XP</span>
                      <span className="text-white font-semibold">{userProgress.xp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Current Level</span>
                      <span className="text-white font-semibold">{userProgress.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Quests Completed</span>
                      <span className="text-white font-semibold">{userProgress.completedQuests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Achievements</span>
                      <span className="text-white font-semibold">{mockAchievements.filter(a => a.unlocked).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'achievements' && (
            <div className="lg:col-span-3">
              <div className="bg-glass-effect rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`
                        bg-gray-800 rounded-lg p-4 border transition-all
                        ${achievement.unlocked 
                          ? 'border-gold-500 bg-gold-500/10' 
                          : 'border-gray-600 opacity-50'
                        }
                      `}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h3 className="font-semibold text-white mb-1">{achievement.name}</h3>
                        <p className="text-gray-300 text-sm">{achievement.description}</p>
                        {achievement.unlocked && (
                          <div className="mt-2 text-gold-400 text-sm font-semibold">
                            ✓ Unlocked
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="lg:col-span-3">
              <div className="bg-glass-effect rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Learning Progress</h2>
                <div className="space-y-6">
                  {questCategories.map((category, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        <span className="text-gray-400">
                          {category.completed}/{category.total} completed
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                        <div 
                          className={`${category.color} h-3 rounded-full transition-all duration-300`}
                          style={{ width: `${(category.completed / category.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-300">
                        {category.completed > 0 
                          ? `Great progress! Keep going to master ${category.name.toLowerCase()}.`
                          : `Start your journey with ${category.name.toLowerCase()} quests.`
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;