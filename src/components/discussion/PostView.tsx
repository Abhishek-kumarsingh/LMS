import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Flag,
  MoreHorizontal,
  Pin,
  Lock,
  Eye,
  Clock,
  User,
  CheckCircle,
  Reply
} from 'lucide-react';
import { DiscussionPost, DiscussionForum } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import CreatePostModal from './CreatePostModal';
import PostReply from './PostReply';

interface PostViewProps {
  postId: string;
  forumId: string;
  courseId: string;
}

const PostView: React.FC<PostViewProps> = ({ postId, forumId, courseId }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [post, setPost] = useState<DiscussionPost | null>(null);
  const [forum, setForum] = useState<DiscussionForum | null>(null);
  const [replies, setReplies] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [sortBy, setSortBy] = useState<'oldest' | 'newest' | 'popular'>('oldest');

  useEffect(() => {
    loadPost();
    loadForum();
    loadReplies();
    incrementViewCount();
  }, [postId]);

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/discussion-posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const postData = await response.json();
        setPost(postData);
      }
    } catch (error) {
      addToast('Failed to load post', 'error');
    }
  };

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

  const loadReplies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/discussion-posts/${postId}/replies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const repliesData = await response.json();
        setReplies(repliesData);
      }
    } catch (error) {
      addToast('Failed to load replies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/discussion-posts/${postId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      // Silently fail - view counting is not critical
    }
  };

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!post) return;

    try {
      const response = await fetch(`/api/discussion-posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ voteType })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
      }
    } catch (error) {
      addToast('Failed to vote', 'error');
    }
  };

  const handleCreateReply = async (replyData: Partial<DiscussionPost>) => {
    try {
      const response = await fetch('/api/discussion-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...replyData,
          forumId,
          parentPostId: postId
        })
      });

      if (response.ok) {
        const newReply = await response.json();
        setReplies(prev => [...prev, newReply]);
        setShowReplyModal(false);
        addToast('Reply posted successfully', 'success');
        
        // Update post reply count
        if (post) {
          setPost(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
        }
      } else {
        throw new Error('Failed to create reply');
      }
    } catch (error) {
      addToast('Failed to post reply', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuthorDisplayName = (postData: DiscussionPost) => {
    if (postData.isAnonymous && user?.id !== postData.authorId) {
      return 'Anonymous';
    }
    
    if (postData.author?.firstName && postData.author?.lastName) {
      return `${postData.author.firstName} ${postData.author.lastName}`;
    }
    
    return postData.author?.email || 'Unknown User';
  };

  const getSortedReplies = () => {
    const sorted = [...replies];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'popular':
        return sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case 'oldest':
      default:
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  };

  const canReply = forum && !forum.isLocked && !post?.isLocked;
  const userVote = post?.userVote?.voteType;

  if (!post || !forum) {
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/courses/${courseId}/forums/${forumId}`)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to {forum.title}
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Share2 className="w-4 h-4" />}
          >
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Flag className="w-4 h-4" />}
          >
            Report
          </Button>
        </div>
      </div>

      {/* Main Post */}
      <Card>
        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                {post.isAnonymous && user?.id !== post.authorId 
                  ? '?' 
                  : (post.author?.firstName?.[0] || post.author?.email?.[0]?.toUpperCase() || 'U')
                }
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getAuthorDisplayName(post)}
                  </span>
                  
                  {post.author?.role && !post.isAnonymous && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.author.role === 'INSTRUCTOR' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : post.author.role === 'ADMIN'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {post.author.role.toLowerCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(post.createdAt)}</span>
                  
                  {post.isPinned && (
                    <>
                      <span>•</span>
                      <Pin className="w-4 h-4 text-yellow-500" />
                      <span>Pinned</span>
                    </>
                  )}
                  
                  {post.isLocked && (
                    <>
                      <span>•</span>
                      <Lock className="w-4 h-4 text-red-500" />
                      <span>Locked</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={<MoreHorizontal className="w-4 h-4" />}
            />
          </div>

          {/* Post Title */}
          {post.title && (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {post.title}
            </h1>
          )}

          {/* Post Content */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              {/* Voting */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('UPVOTE')}
                  className={userVote === 'UPVOTE' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : ''}
                  icon={<ThumbsUp className="w-4 h-4" />}
                >
                  {post.upvotes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('DOWNVOTE')}
                  className={userVote === 'DOWNVOTE' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : ''}
                  icon={<ThumbsDown className="w-4 h-4" />}
                >
                  {post.downvotes}
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.replyCount} replies</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount} views</span>
                </div>
              </div>
            </div>

            {canReply && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowReplyModal(true)}
                icon={<Reply className="w-4 h-4" />}
              >
                Reply
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Replies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Replies ({post.replyCount})
          </h2>
          
          {replies.length > 1 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm"
            >
              <option value="oldest">Oldest First</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : replies.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {getSortedReplies().map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostReply
                    reply={reply}
                    onVote={(voteType) => {
                      // Handle reply voting
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No replies yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Be the first to reply to this post.
            </p>
            {canReply && (
              <Button
                variant="primary"
                onClick={() => setShowReplyModal(true)}
                icon={<Reply className="w-4 h-4" />}
              >
                Write Reply
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Reply Modal */}
      {forum && (
        <CreatePostModal
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          onSubmit={handleCreateReply}
          forum={forum}
          parentPost={post}
        />
      )}
    </div>
  );
};

export default PostView;
