import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  HelpCircle,
  Megaphone,
  BookOpen,
  Users,
  Settings,
  Shield,
  Pin,
  Lock
} from 'lucide-react';
import { DiscussionForum, ForumType } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CreateForumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (forum: Partial<DiscussionForum>) => void;
  courseId: string;
}

const CreateForumModal: React.FC<CreateForumModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courseId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    forumType: 'GENERAL' as ForumType,
    isModerated: true,
    isPinned: false,
    isLocked: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const forumTypes = [
    {
      type: 'GENERAL',
      label: 'General Discussion',
      description: 'Open discussion for any course-related topics',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      type: 'Q_AND_A',
      label: 'Q&A Forum',
      description: 'Question and answer format with voting',
      icon: HelpCircle,
      color: 'green'
    },
    {
      type: 'ANNOUNCEMENTS',
      label: 'Announcements',
      description: 'Important course announcements and updates',
      icon: Megaphone,
      color: 'red'
    },
    {
      type: 'ASSIGNMENTS',
      label: 'Assignment Discussion',
      description: 'Discuss assignments and get help',
      icon: BookOpen,
      color: 'purple'
    },
    {
      type: 'STUDY_GROUP',
      label: 'Study Group',
      description: 'Collaborative study and group work',
      icon: Users,
      color: 'yellow'
    },
    {
      type: 'TECHNICAL_SUPPORT',
      label: 'Technical Support',
      description: 'Get help with technical issues',
      icon: Settings,
      color: 'orange'
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Forum title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
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
      description: '',
      forumType: 'GENERAL',
      isModerated: true,
      isPinned: false,
      isLocked: false
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
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
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600';
    }
  };

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
                Create New Forum
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
              {/* Title */}
              <Input
                label="Forum Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter forum title..."
                error={errors.title}
                required
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this forum is for..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.description && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Forum Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Forum Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {forumTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.forumType === type.type;
                    
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
                          name="forumType"
                          value={type.type}
                          checked={isSelected}
                          onChange={(e) => setFormData(prev => ({ ...prev, forumType: e.target.value as ForumType }))}
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

              {/* Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Forum Settings
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isModerated}
                      onChange={(e) => setFormData(prev => ({ ...prev, isModerated: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                    />
                    <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Moderated Forum
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Posts require approval before being visible
                      </div>
                    </div>
                  </label>

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
                        Pin Forum
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Keep this forum at the top of the list
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isLocked}
                      onChange={(e) => setFormData(prev => ({ ...prev, isLocked: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                    />
                    <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Lock Forum
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Prevent new posts (read-only)
                      </div>
                    </div>
                  </label>
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
                  Create Forum
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateForumModal;
