import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedProfile = localStorage.getItem('userProfile');

        if (token && savedProfile) {
          const profile = JSON.parse(savedProfile);
          setCurrentUser({ token });
          setUserProfile(profile);

          // Verify token is still valid by fetching fresh profile
          try {
            const response = await api.get('/auth/profile');
            setUserProfile(response.data.user);
            localStorage.setItem('userProfile', JSON.stringify(response.data.user));
          } catch (error) {
            // Token invalid, clear auth
            localStorage.removeItem('authToken');
            localStorage.removeItem('userProfile');
            setCurrentUser(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register new user
  const register = async (email, password, username) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        username
      });

      const { user, token } = response.data;

      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userProfile', JSON.stringify(user));

      setCurrentUser({ token });
      setUserProfile(user);

      toast.success('Account created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create account';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { user, token } = response.data;

      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userProfile', JSON.stringify(user));

      setCurrentUser({ token });
      setUserProfile(user);

      toast.success('Logged in successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to login';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');

      // Clear state
      setCurrentUser(null);
      setUserProfile(null);

      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Failed to logout');
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      if (currentUser) {
        const response = await api.get('/auth/profile');
        setUserProfile(response.data.user);
        localStorage.setItem('userProfile', JSON.stringify(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  // Update user interests
  const updateInterests = async (interests) => {
    try {
      if (currentUser && userProfile) {
        const response = await api.patch(`/interests/${userProfile._id}/interests`, {
          interests
        });
        
        // Update local profile
        const updatedProfile = {
          ...userProfile,
          interests: interests
        };
        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        toast.success('Interests updated successfully!');
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update interests';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Upload content
  const uploadContent = async (file, description, tags) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('tags', tags.join(','));

      const response = await api.post('/content/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Content uploaded successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to upload content';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Get suggested follows
  const getSuggestedFollows = async () => {
    try {
      const response = await api.get('/users/suggested-follows');
      return response.data.suggestedUsers;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch suggestions';
      if (error.response?.status !== 401) {
        toast.error(message);
      }
      return [];
    }
  };

  // Get interests
  const getInterests = async () => {
    try {
      const response = await api.get('/interests/all');
      return response.data.interests;
    } catch (error) {
      console.error('Failed to fetch interests:', error);
      return [];
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      if (currentUser && userProfile) {
        const response = await api.patch(`/users/${userProfile._id}`, profileData);
        
        const updatedProfile = response.data.user;
        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        toast.success('Profile updated successfully!');
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    getUserProfile,
    updateInterests,
    uploadContent,
    getSuggestedFollows,
    getInterests,
    updateProfile,
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 