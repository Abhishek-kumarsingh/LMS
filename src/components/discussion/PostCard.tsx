import React from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Lock,
  Eye,
  Clock,
  User,
  CheckCircle,
  HelpCircle,
  Megaphone,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { DiscussionPost, DiscussionForum, PostType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Card from '../ui/Card';

interface PostCardProps {
  post: DiscussionPost;
  forum: DiscussionForum;
  onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, forum, onClick }) => {
  const { user } = useAuthStore();

  const getPostTypeIcon = (type: PostType) => {
    switch (type) {
      case 'QUESTION':
        return HelpCircle;
      case 'ANNOUNCEMENT':
        return Megaphone;
      case 'ANSWER':
        return CheckCircle;
      case 'COMMENT':
        return MessageCircle;
      default:
        return MessageSquare;
    }
  };

  const getPostTypeColor = (type: PostType) => {
    switch (type) {
      case 'QUESTION':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'ANNOUNCEMENT':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'ANSWER':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'COMMENT':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getAuthorDisplayName = () => {
    if (post.isAnonymous && user?.id !== post.authorId) {
      return 'Anonymous';
    }
    
    if (post.author?.firstName && post.author?.lastName) {
      return `${post.author.firstName} ${post.author.lastName}`;
    }
    
    return post.author?.email || 'Unknown User';
  };

  const getAuthorInitials = () => {
    if (post.isAnonymous && user?.id !== post.authorId) {
      return '?';
    }
    
    if (post.author?.firstName && post.author?.lastName) {
      return `${post.author.firstName[0]}${post.author.lastName[0]}`;
    }
    
    return post.author?.email?.[0]?.toUpperCase() || 'U';
  };

  const getAuthorRole = () => {
    if (post.isAnonymous && user?.id !== post.authorId) {
      return null;
    }
    
    return post.author?.role;
  };

  const PostTypeIcon = getPostTypeIcon(post.postType);
  const netVotes = post.upvotes - post.downvotes;
  const authorRole = getAuthorRole();

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {getAuthorInitials()}
          </div>
        </div>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {/* Post Type Badge */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.postType)}`}>
                  <PostTypeIcon className="w-3 h-3" />
                  <span>{post.postType.replace('_', ' ')}</span>
                </div>

                {/* Status Indicators */}
                {post.isPinned && (
                  <Pin className="w-4 h-4 text-yellow-500" title="Pinned" />
                )}
                {post.isLocked && (
                  <Lock className="w-4 h-4 text-red-500" title="Locked" />
                )}
                {!post.isApproved && (
                  <Eye className="w-4 h-4 text-orange-500" title="Pending approval" />
                )}
              </div>

              {/* Title */}
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
                  {post.title}
                </h3>
              )}

              {/* Author and Date */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {getAuthorDisplayName()}
                </span>
                
                {authorRole && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    authorRole === 'INSTRUCTOR' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : authorRole === 'ADMIN'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {authorRole.toLowerCase()}
                  </span>
                )}
                
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-3">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {/* Votes */}
            <div className="flex items-center space-x-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{netVotes}</span>
            </div>

            {/* Replies */}
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>

            {/* Views */}
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount} {post.viewCount === 1 ? 'view' : 'views'}</span>
            </div>

            {/* Last Reply */}
            {post.lastReplyAt && post.lastReplyAuthor && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <span>Last reply by</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {post.lastReplyAuthor.firstName && post.lastReplyAuthor.lastName
                      ? `${post.lastReplyAuthor.firstName} ${post.lastReplyAuthor.lastName}`
                      : post.lastReplyAuthor.email
                    }
                  </span>
                  <span>{formatDate(post.lastReplyAt)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Vote Score */}
        <div className="flex-shrink-0 text-center">
          <div className={`text-lg font-bold ${
            netVotes > 0 
              ? 'text-green-600 dark:text-green-400' 
              : netVotes < 0 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {netVotes > 0 ? '+' : ''}{netVotes}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            votes
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
