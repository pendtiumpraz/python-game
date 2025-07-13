import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Sword, 
  Shield, 
  Crown, 
  Star, 
  Play, 
  Lock,
  Trophy,
  BookOpen,
  Code,
  Zap
} from 'lucide-react';
import AuthModal from '../components/AuthModal';
import QuestCard from '../components/QuestCard';
import axios from 'axios';

const HomePage = () => {
  const { currentUser, userProgress, startGuestSession } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/quests`);
      setQuests(response.data);
    } catch (error) {
      console.error('Error fetching quests:', error);
      // Mock data for development
      setQuests([
        {
          id: 'basic-1',
          title: 'Variables & Data Types',
          description: 'Learn the fundamentals of Python variables and basic data types',
          difficulty: 'beginner',
          category: 'basics',
          xp_reward: 50,
          estimated_time: '15 min',
          topics: ['Variables', 'Strings', 'Numbers', 'Booleans']
        },
        {
          id: 'basic-2',
          title: 'Control Flow',
          description: 'Master if statements, loops, and conditional logic',
          difficulty: 'beginner',
          category: 'basics',
          xp_reward: 75,
          estimated_time: '20 min',
          topics: ['If statements', 'For loops', 'While loops']
        },
        {
          id: 'basic-3',
          title: 'Functions',
          description: 'Create reusable code with functions and parameters',
          difficulty: 'beginner',
          category: 'basics',
          xp_reward: 100,
          estimated_time: '25 min',
          topics: ['Functions', 'Parameters', 'Return values']
        },
        {
          id: 'oop-1',
          title: 'Classes & Objects',
          description: 'Dive into Object-Oriented Programming with classes',
          difficulty: 'intermediate',
          category: 'oop',
          xp_reward: 150,
          estimated_time: '30 min',
          topics: ['Classes', 'Objects', 'Methods', 'Attributes']
        },
        {
          id: 'oop-2',
          title: 'Inheritance',
          description: 'Learn about class inheritance and method overriding',
          difficulty: 'intermediate',
          category: 'oop',
          xp_reward: 200,
          estimated_time: '35 min',
          topics: ['Inheritance', 'Super', 'Method overriding']
        },
        {
          id: 'ds-1',
          title: 'Lists & Dictionaries',
          description: 'Master Python data structures and their operations',
          difficulty: 'intermediate',
          category: 'data-structures',
          xp_reward: 175,
          estimated_time: '30 min',
          topics: ['Lists', 'Dictionaries', 'Tuples', 'Sets']
        }
      ]);
    }
    setLoading(false);
  };

  const handleStartQuest = (questId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    navigate(`/quest/${questId}`);
  };

  const handleGuestStart = () => {
    startGuestSession();
    setShowAuthModal(false);
    // Start with first quest
    navigate('/quest/basic-1');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'basics': return <BookOpen className="h-5 w-5" />;
      case 'oop': return <Shield className="h-5 w-5" />;
      case 'data-structures': return <Code className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const isQuestUnlocked = (quest) => {
    if (!currentUser) return quest.difficulty === 'beginner';
    // Logic to check if quest is unlocked based on user progress
    return true; // For now, all quests are unlocked
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-400 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-fantasy font-bold text-white mb-6 glow-text">
            Welcome to CodeQuest
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Embark on an epic journey to master Python programming through interactive quests and challenges
          </p>
          
          {currentUser ? (
            <div className="bg-glass-effect rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Welcome back, {currentUser.displayName || 'Adventurer'}!
              </h3>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-gold-400" />
                  <span className="text-white font-semibold">Level {userProgress.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-yellow-400" />
                  <span className="text-white">{userProgress.xp} XP</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-gold-400 to-gold-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(userProgress.xp % 100)}%` }}
                ></div>
              </div>
              <p className="text-gray-300">
                {userProgress.completedQuests.length} quests completed
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-gold-600 hover:to-gold-700 transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <Sword className="h-5 w-5" />
                <span>Start Your Quest</span>
              </button>
              <button
                onClick={handleGuestStart}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-900 transition-all"
              >
                Try as Guest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quests Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-fantasy font-bold text-white mb-4">
              Choose Your Adventure
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Progress through carefully crafted quests that take you from Python basics to advanced concepts
            </p>
          </div>

          {/* Quest Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isUnlocked={isQuestUnlocked(quest)}
                isCompleted={userProgress.completedQuests.includes(quest.id)}
                onStartQuest={() => handleStartQuest(quest.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-fantasy font-bold text-white mb-4">
              Why Choose CodeQuest?
            </h2>
            <p className="text-xl text-gray-300">
              Experience the most engaging way to learn Python programming
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-glass-effect rounded-lg p-6 text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Learning</h3>
              <p className="text-gray-300">
                Write and execute real Python code in our interactive environment
              </p>
            </div>

            <div className="bg-glass-effect rounded-lg p-6 text-center">
              <div className="bg-gradient-to-r from-gold-500 to-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gamified Experience</h3>
              <p className="text-gray-300">
                Earn XP, level up, and unlock achievements as you progress
              </p>
            </div>

            <div className="bg-glass-effect rounded-lg p-6 text-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Hints</h3>
              <p className="text-gray-300">
                Get personalized hints and explanations powered by AI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onGuestStart={handleGuestStart}
        />
      )}
    </div>
  );
};

export default HomePage;