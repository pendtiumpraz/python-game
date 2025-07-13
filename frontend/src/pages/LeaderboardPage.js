import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, 
  Crown, 
  Star, 
  Medal, 
  User,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';
import axios from 'axios';

const LeaderboardPage = () => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter, categoryFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/leaderboard`, {
        params: {
          timeFilter,
          categoryFilter
        }
      });
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Mock data for development
      setLeaderboard([
        {
          id: 1,
          username: 'CodeMaster',
          level: 15,
          xp: 2450,
          completedQuests: 23,
          achievements: 12,
          avatar: null,
          isCurrentUser: false
        },
        {
          id: 2,
          username: 'PythonNinja',
          level: 12,
          xp: 1980,
          completedQuests: 19,
          achievements: 10,
          avatar: null,
          isCurrentUser: false
        },
        {
          id: 3,
          username: 'DataWizard',
          level: 11,
          xp: 1750,
          completedQuests: 17,
          achievements: 9,
          avatar: null,
          isCurrentUser: false
        },
        {
          id: 4,
          username: currentUser?.displayName || 'You',
          level: 8,
          xp: 1200,
          completedQuests: 12,
          achievements: 6,
          avatar: null,
          isCurrentUser: true
        },
        {
          id: 5,
          username: 'AlgoExpert',
          level: 7,
          xp: 1050,
          completedQuests: 10,
          achievements: 5,
          avatar: null,
          isCurrentUser: false
        }
      ]);
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'border-yellow-400 bg-yellow-400/10';
      case 2:
        return 'border-gray-400 bg-gray-400/10';
      case 3:
        return 'border-amber-600 bg-amber-600/10';
      default:
        return 'border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-400 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-fantasy font-bold text-white mb-4">
            Hall of Fame
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See how you stack up against other Python adventurers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-glass-effect rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                >
                  <option value="all-time">All Time</option>
                  <option value="monthly">This Month</option>
                  <option value="weekly">This Week</option>
                  <option value="daily">Today</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Categories</option>
                  <option value="basics">Basics</option>
                  <option value="oop">OOP</option>
                  <option value="data-structures">Data Structures</option>
                  <option value="algorithms">Algorithms</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {leaderboard.slice(0, 3).map((user, index) => (
            <div
              key={user.id}
              className={`
                bg-glass-effect rounded-lg p-6 text-center border-2 transition-all hover:scale-105
                ${getRankColor(index + 1)}
                ${index === 0 ? 'md:order-2 transform md:scale-110' : ''}
                ${index === 1 ? 'md:order-1' : ''}
                ${index === 2 ? 'md:order-3' : ''}
              `}
            >
              <div className="mb-4">
                {getRankIcon(index + 1)}
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {user.username}
              </h3>
              
              <div className="flex items-center justify-center space-x-4 text-sm mb-4">
                <div className="flex items-center space-x-1">
                  <Crown className="h-4 w-4 text-gold-400" />
                  <span className="text-white">Level {user.level}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-white">{user.xp} XP</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                {user.completedQuests} quests completed
              </div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard */}
        <div className="bg-glass-effect rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Full Rankings</span>
            </h2>
          </div>
          
          <div className="divide-y divide-gray-700">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`
                  px-6 py-4 flex items-center space-x-4 hover:bg-gray-800/50 transition-colors
                  ${user.isCurrentUser ? 'bg-purple-900/20 border-l-4 border-purple-500' : ''}
                `}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {getRankIcon(index + 1)}
                </div>
                
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-12 h-12 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white truncate">
                      {user.username}
                    </h3>
                    {user.isCurrentUser && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{user.completedQuests} quests</span>
                    <span>{user.achievements} achievements</span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Crown className="h-4 w-4 text-gold-400" />
                    <span className="text-white font-semibold">Level {user.level}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-white font-semibold">{user.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-glass-effect rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Ready to climb the ranks?
            </h2>
            <p className="text-gray-300 mb-6">
              Complete more quests, earn XP, and rise through the leaderboard!
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-gold-600 hover:to-gold-700 transition-all"
            >
              Start a Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;