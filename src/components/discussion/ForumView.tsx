import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  SortDesc,
  Pin,
  Lock,
  Shield,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Eye,
  Settings
} from 'lucide-react';
import { DiscussionForum, DiscussionPost, PostType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';

interface ForumViewProps {
  forumId: string;
  courseId: string;
}

const ForumView: React.FC<ForumViewProps> = ({ forumId, courseId }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [forum, setForum] = useState<DiscussionForum | null>(null);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<PostType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'oldest'>('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadForum();
    loadPosts();
  }, [forumId]);

  const loadForum = async () => {
    try {
      const response = await fetch(`/api/discussion-forums/${forumId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const forumData = await response.json();
        setForum(forumData);
      }
    } catch (error) {
      addToast('Failed to load forum', 'error');
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/discussion-posts/forum/${forumId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      }
    } catch (error) {
      addToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: Partial<DiscussionPost>) => {
    try {
      const response = await fetch('/api/discussion-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...postData,
          forumId
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        setShowCreateModal(false);
        addToast('Post created successfully', 'success');
        
        // Update forum post count
        if (forum) {
          setForum(prev => prev ? { ...prev, postCount: prev.postCount + 1 } : null);
        }
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      addToast('Failed to create post', 'error');
    }
  };

  const postTypes = [
    { type: 'ALL', label: 'All Posts', icon: MessageSquare },
    { type: 'DISCUSSION', label: 'Discussions', icon: MessageSquare },
    { type: 'QUESTION', label: 'Questions', icon: MessageSquare },
    { type: 'ANNOUNCEMENT', label: 'Announcements', icon: MessageSquare },
    { type: 'ANSWER', label: 'Answers', icon: MessageSquare },
    { type: 'COMMENT', label: 'Comments', icon: MessageSquare }
  ];

  const getFilteredAndSortedPosts = () => {
    let filtered = posts.filter(post => !post.parentPostId); // Only top-level posts

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(post => post.postType === selectedType);
    }

    // Sort posts
    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => 
          new Date(b.lastReplyAt || b.createdAt).getTime() - new Date(a.lastReplyAt || a.createdAt).getTime()
        );
      case 'popular':
        return filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case 'oldest':
        return filtered.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return filtered;
    }
  };

  const canPost = forum && !forum.isLocked && (
    !forum.isModerated || 
    user?.role === 'INSTRUCTOR' || 
    user?.role === 'ADMIN' || 
    forum.moderators.includes(user?.id || '')
  );

  const canModerate = forum && (
    user?.role === 'INSTRUCTOR' || 
    user?.role === 'ADMIN' || 
    forum.moderators.includes(user?.id || '')
  );

  if (!forum) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/courses/${courseId}/forums`)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Forums
          </Button>
          
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {forum.title}
              </h1>
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-1">
                {forum.isPinned && (
                  <Pin className="w-5 h-5 text-yellow-500" title="Pinned" />
                )}
                {forum.isLocked && (
                  <Lock className="w-5 h-5 text-red-500" title="Locked" />
                )}
                {forum.isModerated && (
                  <Shield className="w-5 h-5 text-blue-500" title="Moderated" />
                )}
              </div>
            </div>
            
            {forum.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {forum.description}
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{forum.postCount} posts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{forum.forumType.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canModerate && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
            >
              Moderate
            </Button>
          )}
          
          {canPost && (
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              New Post
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as PostType | 'ALL')}
                  className="bg-transparent border-none text-sm text-gray-600 dark:text-gray-400 focus:outline-none"
                >
                  {postTypes.map(type => (
                    <option key={type.type} value={type.type}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <SortDesc className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-sm text-gray-600 dark:text-gray-400 focus:outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {getFilteredAndSortedPosts().length} post{getFilteredAndSortedPosts().length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : getFilteredAndSortedPosts().length > 0 ? (
            getFilteredAndSortedPosts().map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard
                  post={post}
                  forum={forum}
                  onClick={() => navigate(`/courses/${courseId}/forums/${forumId}/posts/${post.id}`)}
                />
              </motion.div>
            ))
          ) : (
            <Card className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <MessageSquare className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || selectedType !== 'ALL' ? 'No posts found' : 'No posts yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || selectedType !== 'ALL' 
                  ? 'Try adjusting your search or filters.'
                  : 'Be the first to start a discussion!'
                }
              </p>
              {canPost && !searchTerm && selectedType === 'ALL' && (
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create First Post
                </Button>
              )}
            </Card>
          )}
        </AnimatePresence>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
        forum={forum}
      />
    </div>
  );
};

export default ForumView;
