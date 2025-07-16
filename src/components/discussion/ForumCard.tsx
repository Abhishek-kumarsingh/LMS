import React from 'react';
import {
  MessageSquare,
  Pin,
  Lock,
  Users,
  Clock,
  HelpCircle,
  Megaphone,
  BookOpen,
  Settings,
  Shield,
  Eye,
  TrendingUp
} from 'lucide-react';
import { DiscussionForum, ForumType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Card from '../ui/Card';

interface ForumCardProps {
  forum: DiscussionForum;
  onClick: () => void;
}

const ForumCard: React.FC<ForumCardProps> = ({ forum, onClick }) => {
  const { user } = useAuthStore();

  const getForumIcon = (type: ForumType) => {
    switch (type) {
      case 'GENERAL':
        return MessageSquare;
      case 'Q_AND_A':
        return HelpCircle;
      case 'ANNOUNCEMENTS':
        return Megaphone;
      case 'ASSIGNMENTS':
        return BookOpen;
      case 'STUDY_GROUP':
        return Users;
      case 'TECHNICAL_SUPPORT':
        return Settings;
      default:
        return MessageSquare;
    }
  };

  const getForumColor = (type: ForumType) => {
    switch (type) {
      case 'GENERAL':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'Q_AND_A':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'ANNOUNCEMENTS':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'ASSIGNMENTS':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'STUDY_GROUP':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'TECHNICAL_SUPPORT':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const getForumTypeLabel = (type: ForumType) => {
    switch (type) {
      case 'GENERAL':
        return 'General Discussion';
      case 'Q_AND_A':
        return 'Q&A';
      case 'ANNOUNCEMENTS':
        return 'Announcements';
      case 'ASSIGNMENTS':
        return 'Assignments';
      case 'STUDY_GROUP':
        return 'Study Group';
      case 'TECHNICAL_SUPPORT':
        return 'Tech Support';
      default:
        return type;
    }
  };

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'No activity yet';
    
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
        day: 'numeric'
      });
    }
  };

  const Icon = getForumIcon(forum.forumType);
  const isModerator = forum.moderators.includes(user?.id || '');
  const canModerate = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' || isModerator;

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        {/* Forum Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getForumColor(forum.forumType)}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Forum Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                  {forum.title}
                </h3>
                
                {/* Status Indicators */}
                <div className="flex items-center space-x-1">
                  {forum.isPinned && (
                    <Pin className="w-4 h-4 text-yellow-500" title="Pinned" />
                  )}
                  {forum.isLocked && (
                    <Lock className="w-4 h-4 text-red-500" title="Locked" />
                  )}
                  {forum.isModerated && (
                    <Shield className="w-4 h-4 text-blue-500" title="Moderated" />
                  )}
                  {canModerate && (
                    <Eye className="w-4 h-4 text-purple-500" title="You can moderate" />
                  )}
                </div>
              </div>

              {/* Forum Type Badge */}
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getForumColor(forum.forumType)}`}>
                  {getForumTypeLabel(forum.forumType)}
                </span>
              </div>

              {/* Description */}
              {forum.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                  {forum.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{forum.postCount} {forum.postCount === 1 ? 'post' : 'posts'}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatLastActivity(forum.lastPostAt)}</span>
                </div>

                {forum.forumType === 'Q_AND_A' && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Q&A Format</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Last Activity */}
          {forum.lastPostBy && forum.lastPostAuthor && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {forum.lastPostAuthor.firstName?.[0] || forum.lastPostAuthor.email[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  Last activity by{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {forum.lastPostAuthor.firstName && forum.lastPostAuthor.lastName
                      ? `${forum.lastPostAuthor.firstName} ${forum.lastPostAuthor.lastName}`
                      : forum.lastPostAuthor.email
                    }
                  </span>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  • {formatLastActivity(forum.lastPostAt)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Activity Indicator */}
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {forum.postCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {forum.postCount === 1 ? 'post' : 'posts'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ForumCard;
