import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sword, 
  Shield, 
  Crown, 
  LogOut, 
  Menu, 
  X,
  Star,
  Trophy,
  User
} from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout, userProgress } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getXPProgress = () => {
    const currentLevelXP = userProgress.level * 100;
    const progressPercentage = (userProgress.xp % 100) / 100 * 100;
    return progressPercentage;
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border-b border-purple-500/30 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Sword className="h-8 w-8 text-gold-400" />
            <span className="text-2xl font-fantasy font-bold text-white glow-text">
              CodeQuest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-white hover:text-gold-400 transition-colors font-semibold"
            >
              Home
            </Link>
            <Link 
              to="/leaderboard" 
              className="text-white hover:text-gold-400 transition-colors font-semibold flex items-center space-x-1"
            >
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                {/* XP Progress Bar */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-gold-400" />
                    <span className="text-white font-semibold">
                      Level {userProgress.level}
                    </span>
                  </div>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-gold-400 to-gold-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getXPProgress()}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-white text-sm">{userProgress.xp} XP</span>
                  </div>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-white hover:text-gold-400 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-white hover:text-gold-400 transition-colors font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-4 py-2 rounded-md hover:from-gold-600 hover:to-gold-700 transition-all font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gold-400 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-purple-500/30">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-white hover:bg-gray-700 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/leaderboard"
              className="block px-3 py-2 text-white hover:bg-gray-700 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </Link>
            {currentUser && (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-white hover:bg-gray-700 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <div className="px-3 py-2 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="h-4 w-4 text-gold-400" />
                    <span>Level {userProgress.level}</span>
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{userProgress.xp} XP</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-gold-400 to-gold-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getXPProgress()}%` }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;