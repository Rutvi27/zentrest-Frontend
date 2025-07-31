import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Image, Video, Tag, FileText } from 'lucide-react';

export default function UploadContentModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { uploadContent } = useAuth();

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setDescription('');
    setTags('');
    setUploading(false);
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setPreview(e.target.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/'))) {
      setFile(droppedFile);

      // Create preview
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setPreview(e.target.result);
      };
      fileReader.readAsDataURL(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) return;

    try {
      setUploading(true);
      
      // Parse tags
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const result = await uploadContent(file, description, tagArray);
      
      // Notify parent component
      if (onUpload) {
        onUpload(result.content);
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const isVideo = file && file.type.startsWith('video/');
  const fileSize = file ? (file.size / 1024 / 1024).toFixed(1) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Share Your Content</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 disabled:opacity-50"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo or Video
              </label>
              
              {!file ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-200 cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports images and videos up to 10MB
                  </p>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Image className="h-4 w-4" />
                      <span className="text-xs">JPG, PNG, GIF</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Video className="h-4 w-4" />
                      <span className="text-xs">MP4, MOV, AVI</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Preview */}
                  <div className="relative rounded-lg overflow-hidden bg-gray-100">
                    {isVideo ? (
                      <video
                        src={preview}
                        className="w-full h-64 object-contain"
                        controls
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-contain"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{file.name}</span>
                    <span>{fileSize} MB</span>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4" />
                <span>Description</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
                placeholder="Tell us about your content..."
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="music, photography, art (comma separated)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Add relevant tags to help others discover your content
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Share Content</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 