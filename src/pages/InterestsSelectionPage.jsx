import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Check, ArrowRight, Music, Camera, Palette, BookOpen, Film, Utensils, Scissors, Coffee, Users, Mic } from 'lucide-react';

const interestIcons = {
  painting: Palette,
  photography: Camera,
  poetry: BookOpen,
  movies: Film,
  music: Music,
  dance: Users,
  'standup-comedy': Mic,
  cooking: Utensils,
  tailoring: Scissors,
  'kitty-party': Coffee
};

export default function InterestsSelectionPage() {
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [expandedInterests, setExpandedInterests] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getInterests, updateInterests, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      setLoading(true);
      const availableInterests = await getInterests();
      setInterests(availableInterests);

      // Set existing user interests if any
      if (userProfile?.interests) {
        setSelectedInterests(userProfile.interests);
        
        // Auto-expand music if user has music sub-interests
        const hasMusicalInterests = userProfile.interests.some(interest => 
          interest.includes('music:') || interest === 'music'
        );
        if (hasMusicalInterests) {
          setExpandedInterests(new Set(['music']));
        }
      }
    } catch (error) {
      console.error('Failed to load interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interestId) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        // Remove interest and its sub-interests
        return prev.filter(id => !id.startsWith(interestId));
      } else {
        // Add interest
        return [...prev, interestId];
      }
    });

    // Auto-expand if it has sub-interests
    const interest = interests.find(i => i.id === interestId);
    if (interest?.subInterests && interest.subInterests.length > 0) {
      setExpandedInterests(prev => new Set([...prev, interestId]));
    }
  };

  const handleSubInterestToggle = (parentId, subInterestId) => {
    const fullId = `${parentId}:${subInterestId}`;
    
    setSelectedInterests(prev => {
      if (prev.includes(fullId)) {
        return prev.filter(id => id !== fullId);
      } else {
        // Add sub-interest and ensure parent is selected
        const newSelected = prev.includes(parentId) ? prev : [...prev, parentId];
        return [...newSelected, fullId];
      }
    });
  };

  const toggleExpanded = (interestId) => {
    setExpandedInterests(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(interestId)) {
        newExpanded.delete(interestId);
      } else {
        newExpanded.add(interestId);
      }
      return newExpanded;
    });
  };

  const handleSave = async () => {
    if (selectedInterests.length === 0) {
      return;
    }

    try {
      setSaving(true);
      await updateInterests(selectedInterests);
      navigate('/home');
    } catch (error) {
      console.error('Failed to save interests:', error);
    } finally {
      setSaving(false);
    }
  };

  const isSelected = (interestId) => selectedInterests.includes(interestId);
  const isSubInterestSelected = (parentId, subInterestId) => 
    selectedInterests.includes(`${parentId}:${subInterestId}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Zentrest</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            What are you passionate about?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select your interests to connect with like-minded people and discover amazing content.
            You can always update these later in your profile.
          </p>
        </div>

        {/* Interests Grid */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interests.map((interest) => {
              const IconComponent = interestIcons[interest.id] || Heart;
              const hasSubInterests = interest.subInterests && interest.subInterests.length > 0;
              const isExpanded = expandedInterests.has(interest.id);

              return (
                <div key={interest.id} className="space-y-2">
                  {/* Main Interest */}
                  <div
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      isSelected(interest.id)
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleInterestToggle(interest.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-6 w-6 ${
                          isSelected(interest.id) ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <span className={`font-medium ${
                          isSelected(interest.id) ? 'text-primary-900' : 'text-gray-700'
                        }`}>
                          {interest.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isSelected(interest.id) && (
                          <Check className="h-5 w-5 text-primary-600" />
                        )}
                        {hasSubInterests && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(interest.id);
                            }}
                            className={`p-1 rounded transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          >
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sub-interests */}
                  {hasSubInterests && isExpanded && (
                    <div className="ml-4 space-y-2">
                      {interest.subInterests.map((subInterest) => (
                        <div
                          key={subInterest.id}
                          className={`p-3 rounded-md border cursor-pointer transition-all duration-200 ${
                            isSubInterestSelected(interest.id, subInterest.id)
                              ? 'border-secondary-400 bg-secondary-50 ring-1 ring-secondary-200'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleSubInterestToggle(interest.id, subInterest.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${
                              isSubInterestSelected(interest.id, subInterest.id)
                                ? 'text-secondary-900'
                                : 'text-gray-600'
                            }`}>
                              {subInterest.name}
                            </span>
                            {isSubInterestSelected(interest.id, subInterest.id) && (
                              <Check className="h-4 w-4 text-secondary-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Interests Summary */}
        {selectedInterests.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Your Selected Interests ({selectedInterests.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedInterests.map((interestId) => {
                const isSubInterest = interestId.includes(':');
                const displayName = isSubInterest
                  ? (() => {
                      const [parentId, subId] = interestId.split(':');
                      const parent = interests.find(i => i.id === parentId);
                      const sub = parent?.subInterests?.find(s => s.id === subId);
                      return sub?.name || interestId;
                    })()
                  : interests.find(i => i.id === interestId)?.name || interestId;

                return (
                  <span
                    key={interestId}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isSubInterest
                        ? 'bg-secondary-100 text-secondary-800'
                        : 'bg-primary-100 text-primary-800'
                    }`}
                  >
                    {displayName}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors duration-200"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={selectedInterests.length === 0 || saving}
            className="px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              `Save Interests ${selectedInterests.length > 0 ? `(${selectedInterests.length})` : ''}`
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            💡 Tip: Select Music to see sub-categories like Singing and Musical Instruments
          </p>
        </div>
      </div>
    </div>
  );
} 