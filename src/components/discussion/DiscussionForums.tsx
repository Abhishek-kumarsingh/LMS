import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Pin,
  Lock,
  Users,
  Clock,
  TrendingUp,
  HelpCircle,
  Megaphone,
  BookOpen,
  Settings,
  AlertCircle
} from 'lucide-react';
import { DiscussionForum, ForumType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ForumCard from './ForumCard';
import CreateForumModal from './CreateForumModal';

interface DiscussionForumsProps {
  courseId: string;
}

const DiscussionForums: React.FC<DiscussionForumsProps> = ({ courseId }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [forums, setForums] = useState<DiscussionForum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ForumType | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alphabetical'>('recent');

  useEffect(() => {
    loadForums();
  }, [courseId]);

  const loadForums = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/discussion-forums/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const forumsData = await response.json();
        setForums(forumsData);
      }
    } catch (error) {
      addToast('Failed to load forums', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async (forumData: Partial<DiscussionForum>) => {
    try {
      const response = await fetch('/api/discussion-forums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...forumData,
          courseId
        })
      });

      if (response.ok) {
        const newForum = await response.json();
        setForums(prev => [newForum, ...prev]);
        setShowCreateModal(false);
        addToast('Forum created successfully', 'success');
      } else {
        throw new Error('Failed to create forum');
      }
    } catch (error) {
      addToast('Failed to create forum', 'error');
    }
  };

  const forumTypes = [
    { type: 'ALL', label: 'All Forums', icon: MessageSquare, color: 'gray' },
    { type: 'GENERAL', label: 'General Discussion', icon: MessageSquare, color: 'blue' },
    { type: 'Q_AND_A', label: 'Q&A', icon: HelpCircle, color: 'green' },
    { type: 'ANNOUNCEMENTS', label: 'Announcements', icon: Megaphone, color: 'red' },
    { type: 'ASSIGNMENTS', label: 'Assignments', icon: BookOpen, color: 'purple' },
    { type: 'STUDY_GROUP', label: 'Study Groups', icon: Users, color: 'yellow' },
    { type: 'TECHNICAL_SUPPORT', label: 'Tech Support', icon: Settings, color: 'orange' }
  ];

  const getFilteredAndSortedForums = () => {
    let filtered = forums;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(forum =>
        forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forum.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(forum => forum.forumType === selectedType);
    }

    // Sort forums
    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => 
          new Date(b.lastPostAt || b.createdAt).getTime() - new Date(a.lastPostAt || a.createdAt).getTime()
        );
      case 'popular':
        return filtered.sort((a, b) => b.postCount - a.postCount);
      case 'alphabetical':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  };

  const canCreateForum = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Discussion Forums
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Engage with your classmates and instructors
          </p>
        </div>

        {canCreateForum && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Forum
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {forumTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.type;
              
              return (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type as ForumType | 'ALL')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-primary-600 dark:text-primary-400 font-medium focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {getFilteredAndSortedForums().length} forum{getFilteredAndSortedForums().length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </Card>

      {/* Forums List */}
      <div className="space-y-4">
        <AnimatePresence>
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="flex space-x-4">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : getFilteredAndSortedForums().length > 0 ? (
            getFilteredAndSortedForums().map((forum, index) => (
              <motion.div
                key={forum.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <ForumCard
                  forum={forum}
                  onClick={() => navigate(`/courses/${courseId}/forums/${forum.id}`)}
                />
              </motion.div>
            ))
          ) : (
            <Card className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <MessageSquare className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || selectedType !== 'ALL' ? 'No forums found' : 'No forums yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || selectedType !== 'ALL' 
                  ? 'Try adjusting your search or filters.'
                  : 'Be the first to start a discussion!'
                }
              </p>
              {canCreateForum && !searchTerm && selectedType === 'ALL' && (
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create First Forum
                </Button>
              )}
            </Card>
          )}
        </AnimatePresence>
      </div>

      {/* Create Forum Modal */}
      <CreateForumModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateForum}
        courseId={courseId}
      />
    </div>
  );
};

export default DiscussionForums;
