import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SuggestedFollows from '../components/SuggestedFollows';
import UploadContentModal from '../components/UploadContentModal';
import { Plus, Heart, MessageCircle, Share, User, Calendar, Tag } from 'lucide-react';

export default function HomePage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { userProfile, api } = useAuth();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await api.get('/content/feed?limit=20');
      setContent(response.data.content);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentUpload = (newContent) => {
    setContent(prev => [newContent, ...prev]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ContentCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* User Info Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {item.user?.profileImageUrl ? (
            <img
              src={item.user.profileImageUrl}
              alt={item.user.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {item.user?.username || 'Unknown User'}
            </p>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={item.description}
            className="w-full h-auto max-h-96 object-cover"
          />
        ) : (
          <video
            src={item.url}
            controls
            className="w-full h-auto max-h-96"
          />
        )}
      </div>

      {/* Content Details */}
      <div className="p-4">
        {item.description && (
          <p className="text-gray-800 text-sm mb-3">{item.description}</p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors duration-200">
              <Heart className="h-5 w-5" />
              <span className="text-sm">Like</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors duration-200">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">Comment</span>
            </button>
          </div>
          <button className="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition-colors duration-200">
            <Share className="h-5 w-5" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
      <div className="max-w-md mx-auto">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Welcome to Zentrest!
        </h3>
        <p className="text-gray-500 mb-6">
          Start by sharing your first photo or video, or follow people with similar interests to see their content.
        </p>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Share Your First Post
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.username}!
          </h1>
          <p className="text-gray-600">
            Discover and share content with people who share your interests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Feed */}
          <div className="lg:col-span-3">
            {/* Quick Share Button */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
              >
                <Plus className="h-5 w-5" />
                <span>Share something amazing</span>
              </button>
            </div>

            {/* Content Feed */}
            <div className="space-y-6">
              {loading ? (
                // Loading skeleton
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3 animate-pulse">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                    <div className="h-64 bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-3 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : content.length > 0 ? (
                content.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))
              ) : (
                <EmptyState />
              )}
            </div>

            {/* Load More Button */}
            {content.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadContent}
                  className="px-6 py-2 text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors duration-200"
                >
                  Load More
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* User Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  {userProfile?.profileImageUrl ? (
                    <img
                      src={userProfile.profileImageUrl}
                      alt={userProfile.username}
                      className="h-16 w-16 rounded-full object-cover mx-auto mb-3"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-primary-600" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {userProfile?.username}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {userProfile?.interests?.length || 0} interests
                  </p>

                  {/* Quick Interest Tags */}
                  {userProfile?.interests && userProfile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {userProfile.interests.slice(0, 3).map((interest, index) => {
                        const displayName = interest.includes(':') 
                          ? interest.split(':')[1].replace('-', ' ')
                          : interest.replace('-', ' ');
                        
                        return (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                          >
                            {displayName}
                          </span>
                        );
                      })}
                      {userProfile.interests.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{userProfile.interests.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Suggested Follows */}
              <SuggestedFollows />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadContentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleContentUpload}
      />
    </div>
  );
} 