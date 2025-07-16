import React from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  Flag,
  MoreHorizontal,
  Reply
} from 'lucide-react';
import { DiscussionPost } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface PostReplyProps {
  reply: DiscussionPost;
  onVote: (voteType: 'UPVOTE' | 'DOWNVOTE') => void;
  onReply?: () => void;
  level?: number;
}

const PostReply: React.FC<PostReplyProps> = ({ 
  reply, 
  onVote, 
  onReply, 
  level = 0 
}) => {
  const { user } = useAuthStore();

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
    if (reply.isAnonymous && user?.id !== reply.authorId) {
      return 'Anonymous';
    }
    
    if (reply.author?.firstName && reply.author?.lastName) {
      return `${reply.author.firstName} ${reply.author.lastName}`;
    }
    
    return reply.author?.email || 'Unknown User';
  };

  const getAuthorInitials = () => {
    if (reply.isAnonymous && user?.id !== reply.authorId) {
      return '?';
    }
    
    if (reply.author?.firstName && reply.author?.lastName) {
      return `${reply.author.firstName[0]}${reply.author.lastName[0]}`;
    }
    
    return reply.author?.email?.[0]?.toUpperCase() || 'U';
  };

  const getAuthorRole = () => {
    if (reply.isAnonymous && user?.id !== reply.authorId) {
      return null;
    }
    
    return reply.author?.role;
  };

  const userVote = reply.userVote?.voteType;
  const netVotes = reply.upvotes - reply.downvotes;
  const authorRole = getAuthorRole();
  const isAnswer = reply.postType === 'ANSWER';

  // Indent nested replies
  const marginLeft = Math.min(level * 2, 8); // Max 8rem indentation

  return (
    <div className={`ml-${marginLeft}`}>
      <Card className={`${isAnswer ? 'border-l-4 border-green-500 bg-green-50/50 dark:bg-green-900/10' : ''}`}>
        <div className="space-y-3">
          {/* Reply Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                {getAuthorInitials()}
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
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

                  {isAnswer && (
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      <span>Answer</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(reply.createdAt)}</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={<MoreHorizontal className="w-3 h-3" />}
            />
          </div>

          {/* Reply Content */}
          <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
            {reply.content}
          </div>

          {/* Reply Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
              {/* Voting */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVote('UPVOTE')}
                  className={`text-xs ${userVote === 'UPVOTE' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : ''}`}
                  icon={<ThumbsUp className="w-3 h-3" />}
                >
                  {reply.upvotes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVote('DOWNVOTE')}
                  className={`text-xs ${userVote === 'DOWNVOTE' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : ''}`}
                  icon={<ThumbsDown className="w-3 h-3" />}
                >
                  {reply.downvotes}
                </Button>

                {netVotes !== 0 && (
                  <span className={`text-xs font-medium ${
                    netVotes > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {netVotes > 0 ? '+' : ''}{netVotes}
                  </span>
                )}
              </div>

              {/* Reply Button */}
              {onReply && level < 3 && ( // Limit nesting to 3 levels
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReply}
                  className="text-xs"
                  icon={<Reply className="w-3 h-3" />}
                >
                  Reply
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                icon={<Flag className="w-3 h-3" />}
              >
                Report
              </Button>
            </div>
          </div>

          {/* Nested Replies */}
          {reply.replies && reply.replies.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {reply.replies.map((nestedReply) => (
                <PostReply
                  key={nestedReply.id}
                  reply={nestedReply}
                  onVote={onVote}
                  onReply={onReply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PostReply;
