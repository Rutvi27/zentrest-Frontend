import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UploadContentModal from '../components/UploadContentModal';
import { 
  User, 
  Heart, 
  Grid, 
  Settings, 
  Plus, 
  Camera, 
  Video, 
  Tag,
  Calendar,
  Edit3,
  X
} from 'lucide-react';

export default function ProfilePage() {
  const [userContent, setUserContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const { userProfile, api } = useAuth();

  useEffect(() => {
    loadUserContent();
  }, []);

  const loadUserContent = async () => {
    try {
      setLoading(true);
      if (userProfile?.uid) {
        const response = await api.get(`/content/user/${userProfile.uid}`);
        setUserContent(response.data.content);
      }
    } catch (error) {
      console.error('Failed to load user content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentUpload = (newContent) => {
    setUserContent(prev => [newContent, ...prev]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ContentGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {userContent.map((item) => (
        <div
          key={item.id}
          className="relative group cursor-pointer bg-gray-100 rounded-lg overflow-hidden aspect-square"
          onClick={() => setSelectedContent(item)}
        >
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt={item.description}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={item.url}
                className="w-full h-full object-cover"
                muted
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <Video className="h-8 w-8 text-white" />
              </div>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-end">
            <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-sm font-medium truncate">
                {item.description || 'No description'}
              </p>
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center space-x-1 mt-1">
                  <Tag className="h-3 w-3" />
                  <span className="text-xs">
                    {item.tags.slice(0, 2).join(', ')}
                    {item.tags.length > 2 && '...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyContent = () => (
    <div className="text-center py-12">
      <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
      <p className="text-gray-500 mb-6">
        Share your first photo or video to get started!
      </p>
      <button
        onClick={() => setShowUploadModal(true)}
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Upload Content
      </button>
    </div>
  );

  const ContentModal = ({ content, onClose }) => {
    if (!content) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex">
            {/* Content */}
            <div className="flex-1">
              {content.type === 'image' ? (
                <img
                  src={content.url}
                  alt={content.description}
                  className="w-full h-auto max-h-[90vh] object-contain"
                />
              ) : (
                <video
                  src={content.url}
                  controls
                  className="w-full h-auto max-h-[90vh]"
                />
              )}
            </div>

            {/* Details */}
            <div className="w-80 p-6 border-l border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {content.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                    <p className="text-sm text-gray-600">{content.description}</p>
                  </div>
                )}

                {content.tags && content.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {content.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Uploaded</h4>
                  <p className="text-sm text-gray-600">{formatDate(content.createdAt)}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Type</h4>
                  <p className="text-sm text-gray-600 capitalize">{content.type}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              {userProfile?.profileImageUrl ? (
                <img
                  src={userProfile.profileImageUrl}
                  alt={userProfile.username}
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <User className="h-16 w-16 text-primary-600" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors duration-200">
                <Edit3 className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userProfile?.username}
                </h1>
                <Link
                  to="/interests"
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors duration-200"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Edit Profile
                </Link>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-4">
                <div className="flex justify-center md:justify-start space-x-6 mb-4 md:mb-0">
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900">
                      {userContent.length}
                    </p>
                    <p className="text-sm text-gray-500">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900">
                      {userProfile?.interests?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500">Interests</p>
                  </div>
                </div>
              </div>

              {/* Interests */}
              {userProfile?.interests && userProfile.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {userProfile.interests.map((interest, index) => {
                      const displayName = interest.includes(':') 
                        ? interest.split(':')[1].replace('-', ' ')
                        : interest.replace('-', ' ');
                      
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full"
                        >
                          {displayName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Join Date */}
              <div className="mt-4 flex items-center justify-center md:justify-start text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Joined {formatDate(userProfile?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-1">
                <Grid className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Your Content</span>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Content
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : userContent.length > 0 ? (
              <ContentGrid />
            ) : (
              <EmptyContent />
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadContentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleContentUpload}
      />

      {/* Content Detail Modal */}
      <ContentModal
        content={selectedContent}
        onClose={() => setSelectedContent(null)}
      />
    </div>
  );
} 