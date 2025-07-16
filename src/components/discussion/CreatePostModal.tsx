import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  HelpCircle,
  Megaphone,
  CheckCircle,
  MessageCircle,
  Pin,
  Lock,
  EyeOff,
  Paperclip,
  Hash
} from 'lucide-react';
import { DiscussionPost, DiscussionForum, PostType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Partial<DiscussionPost>) => void;
  forum: DiscussionForum;
  parentPost?: DiscussionPost;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  forum,
  parentPost
}) => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: (parentPost ? 'COMMENT' : 'DISCUSSION') as PostType,
    isAnonymous: false,
    isPinned: false,
    tags: [] as string[],
    tagInput: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postTypes = [
    {
      type: 'DISCUSSION',
      label: 'Discussion',
      description: 'Start a general discussion',
      icon: MessageSquare,
      color: 'purple'
    },
    {
      type: 'QUESTION',
      label: 'Question',
      description: 'Ask a question that needs answers',
      icon: HelpCircle,
      color: 'blue'
    },
    {
      type: 'ANNOUNCEMENT',
      label: 'Announcement',
      description: 'Make an important announcement',
      icon: Megaphone,
      color: 'red',
      restricted: true
    },
    {
      type: 'ANSWER',
      label: 'Answer',
      description: 'Provide an answer to a question',
      icon: CheckCircle,
      color: 'green'
    },
    {
      type: 'COMMENT',
      label: 'Comment',
      description: 'Add a comment or reply',
      icon: MessageCircle,
      color: 'gray'
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!parentPost && !formData.title.trim()) {
      newErrors.title = 'Title is required for new posts';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    } else if (formData.content.length > 10000) {
      newErrors.content = 'Content must be less than 10,000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const postData: Partial<DiscussionPost> = {
        title: parentPost ? undefined : formData.title,
        content: formData.content,
        postType: formData.postType,
        isAnonymous: formData.isAnonymous,
        isPinned: formData.isPinned,
        tags: formData.tags,
        parentPostId: parentPost?.id
      };

      await onSubmit(postData);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      postType: parentPost ? 'COMMENT' : 'DISCUSSION',
      isAnonymous: false,
      isPinned: false,
      tags: [],
      tagInput: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleAddTag = () => {
    const tag = formData.tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getTypeColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'red':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'gray':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600';
    }
  };

  const canPin = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' || forum.moderators.includes(user?.id || '');
  const canAnnounce = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  const availableTypes = postTypes.filter(type => {
    if (parentPost) {
      return ['COMMENT', 'ANSWER'].includes(type.type);
    }
    if (type.restricted && !canAnnounce) {
      return false;
    }
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {parentPost ? 'Reply to Post' : 'Create New Post'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Post Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Post Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.postType === type.type;
                    
                    return (
                      <label
                        key={type.type}
                        className={`relative flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? getTypeColor(type.color)
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="postType"
                          value={type.type}
                          checked={isSelected}
                          onChange={(e) => setFormData(prev => ({ ...prev, postType: e.target.value as PostType }))}
                          className="sr-only"
                        />
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {type.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {type.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Title (only for top-level posts) */}
              {!parentPost && (
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title..."
                  error={errors.title}
                  required
                />
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={parentPost ? "Write your reply..." : "Write your post content..."}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.content && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.content}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.content.length}/10,000 characters
                </p>
              </div>

              {/* Tags (only for top-level posts) */}
              {!parentPost && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (Optional)
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.tagInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a tag..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!formData.tagInput.trim() || formData.tags.length >= 5}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-primary-500 hover:text-primary-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Add up to 5 tags to help categorize your post
                  </p>
                </div>
              )}

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Post Options
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                    />
                    <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Post Anonymously
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Your name will be hidden from other students
                      </div>
                    </div>
                  </label>

                  {canPin && !parentPost && (
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <Pin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Pin Post
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Keep this post at the top of the forum
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="flex-1"
                >
                  {parentPost ? 'Post Reply' : 'Create Post'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
