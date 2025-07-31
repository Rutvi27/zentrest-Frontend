import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Heart, Sparkles } from 'lucide-react';

export default function SuggestedFollows() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getSuggestedFollows } = useAuth();

  useEffect(() => {
    loadSuggestedFollows();
  }, []);

  const loadSuggestedFollows = async () => {
    try {
      setLoading(true);
      const suggestions = await getSuggestedFollows();
      setSuggestedUsers(suggestions);
    } catch (error) {
      console.error('Failed to load suggested follows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = (userId) => {
    // TODO: Implement follow functionality
    console.log('Follow user:', userId);
    setSuggestedUsers(prev => prev.filter(user => user.uid !== userId));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Suggested Follows</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Suggested Follows</h3>
        </div>
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Add more interests to discover people to follow!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Suggested Follows</h3>
        </div>

        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.uid} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                )}

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {user.commonInterestsCount} common interest{user.commonInterestsCount !== 1 ? 's' : ''}
                    </p>
                    {user.commonInterests.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {user.commonInterests.slice(0, 2).map((interest, index) => {
                          const displayName = interest.includes(':') 
                            ? interest.split(':')[1].replace('-', ' ')
                            : interest.replace('-', ' ');
                          
                          return (
                            <span
                              key={index}
                              className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                            >
                              {displayName}
                            </span>
                          );
                        })}
                        {user.commonInterests.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{user.commonInterests.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => handleFollow(user.uid)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Follow
              </button>
            </div>
          ))}
        </div>

        {suggestedUsers.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={loadSuggestedFollows}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Refresh suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 