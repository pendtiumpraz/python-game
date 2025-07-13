import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({
    level: 1,
    xp: 0,
    completedQuests: [],
    currentQuest: null,
    achievements: []
  });

  // Configure axios defaults
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Get user progress from backend
        try {
          const token = await user.getIdToken();
          const response = await axios.get(`${backendUrl}/api/user/progress`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProgress(response.data);
        } catch (error) {
          console.error('Error fetching user progress:', error);
        }
      } else {
        setCurrentUser(null);
        setUserProgress({
          level: 1,
          xp: 0,
          completedQuests: [],
          currentQuest: null,
          achievements: []
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [backendUrl]);

  const signup = async (email, password, username) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: username });
      
      // Create user profile in backend
      const token = await user.getIdToken();
      await axios.post(`${backendUrl}/api/auth/register`, {
        uid: user.uid,
        email: user.email,
        username: username
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const startGuestSession = () => {
    const guestUser = {
      uid: 'guest-' + Date.now(),
      email: 'guest@codequest.com',
      displayName: 'Guest Adventurer',
      isGuest: true
    };
    setCurrentUser(guestUser);
    setUserProgress({
      level: 1,
      xp: 0,
      completedQuests: [],
      currentQuest: null,
      achievements: []
    });
  };

  const updateUserProgress = async (progressData) => {
    if (currentUser && !currentUser.isGuest) {
      try {
        const token = await currentUser.getIdToken();
        await axios.post(`${backendUrl}/api/user/progress`, progressData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProgress(progressData);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    } else {
      // Update local storage for guest users
      setUserProgress(progressData);
      localStorage.setItem('guestProgress', JSON.stringify(progressData));
    }
  };

  const value = {
    currentUser,
    userProgress,
    signup,
    login,
    logout,
    startGuestSession,
    updateUserProgress
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};