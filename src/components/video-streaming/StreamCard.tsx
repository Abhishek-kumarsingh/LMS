import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Users,
  Clock,
  Calendar,
  MessageSquare,
  Eye,
  Settings,
  Share2,
  Download,
  MoreVertical,
  Live,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Maximize,
  Heart,
  ThumbsUp
} from 'lucide-react';
import { VideoStream, StreamStatus } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface StreamCardProps {
  stream: VideoStream;
  viewMode: 'grid' | 'list';
  onJoin: () => void;
  onUpdate: (stream: VideoStream) => void;
}

const StreamCard: React.FC<StreamCardProps> = ({
  stream,
  viewMode,
  onJoin,
  onUpdate
}) => {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: StreamStatus) => {
    switch (status) {
      case 'LIVE':
        return 'bg-red-500 text-white';
      case 'SCHEDULED':
        return 'bg-blue-500 text-white';
      case 'ENDED':
        return 'bg-gray-500 text-white';
      case 'CANCELLED':
        return 'bg-red-500 text-white';
      case 'PROCESSING':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: StreamStatus) => {
    switch (status) {
      case 'LIVE':
        return <Live className="w-3 h-3" />;
      case 'SCHEDULED':
        return <Calendar className="w-3 h-3" />;
      case 'ENDED':
        return <Play className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
      return `in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffMins > -60) {
      return 'starting soon';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOwner = user?.id === stream.instructorId;
  const canManage = isOwner || user?.role === 'ADMIN';

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4 p-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {stream.thumbnailUrl ? (
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Status Badge */}
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(stream.status)}`}>
              {getStatusIcon(stream.status)}
              <span>{stream.status}</span>
            </div>

            {/* Live Indicator */}
            {stream.status === 'LIVE' && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {stream.title}
                </h3>
                
                {stream.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                    {stream.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{stream.currentViewers} watching</span>
                  </div>
                  
                  {stream.status === 'LIVE' && stream.actualStartTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatDuration((Date.now() - new Date(stream.actualStartTime).getTime()) / 1000)}
                      </span>
                    </div>
                  )}

                  {stream.status === 'SCHEDULED' && stream.scheduledStartTime && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatScheduledTime(stream.scheduledStartTime)}</span>
                    </div>
                  )}

                  {stream.instructor && (
                    <span>by {stream.instructor.firstName} {stream.instructor.lastName}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onJoin}
                  icon={stream.status === 'LIVE' ? <Eye className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                >
                  {stream.status === 'LIVE' ? 'Watch' : 'View'}
                </Button>

                {canManage && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMenu(!showMenu)}
                      icon={<MoreVertical className="w-4 h-4" />}
                    />
                    
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                          Edit
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                          Analytics
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                          Share
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {stream.thumbnailUrl ? (
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={onJoin}
                icon={stream.status === 'LIVE' ? <Eye className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                className="shadow-lg"
              >
                {stream.status === 'LIVE' ? 'Watch Live' : 'View'}
              </Button>
            </motion.div>
          </div>

          {/* Status Badge */}
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(stream.status)}`}>
            {getStatusIcon(stream.status)}
            <span>{stream.status}</span>
          </div>

          {/* Live Indicator */}
          {stream.status === 'LIVE' && (
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium bg-red-500 px-2 py-1 rounded">
                LIVE
              </span>
            </div>
          )}

          {/* Duration/Time */}
          {stream.status === 'ENDED' && stream.duration && (
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {formatDuration(stream.duration)}
            </div>
          )}

          {/* Viewer Count */}
          {stream.status === 'LIVE' && (
            <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{stream.currentViewers}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
              {stream.title}
            </h3>
            
            {canManage && (
              <div className="relative ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  icon={<MoreVertical className="w-4 h-4" />}
                />
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                      Edit
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                      Analytics
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                      Share
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {stream.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {stream.description}
            </p>
          )}

          {/* Instructor */}
          {stream.instructor && (
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {stream.instructor.firstName[0]}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stream.instructor.firstName} {stream.instructor.lastName}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{stream.totalViews}</span>
              </div>
              
              {stream.chatEnabled && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </div>
              )}
            </div>

            {stream.status === 'SCHEDULED' && stream.scheduledStartTime && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatScheduledTime(stream.scheduledStartTime)}</span>
              </div>
            )}

            {stream.status === 'LIVE' && stream.actualStartTime && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDuration((Date.now() - new Date(stream.actualStartTime).getTime()) / 1000)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StreamCard;
