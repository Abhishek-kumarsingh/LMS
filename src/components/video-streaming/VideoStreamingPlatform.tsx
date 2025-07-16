import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Video,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Live,
  Clock,
  Eye,
  MessageSquare,
  Download,
  Share2
} from 'lucide-react';
import { VideoStream, StreamStatus, StreamType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import StreamCard from './StreamCard';
import LiveStreamViewer from './LiveStreamViewer';
import StreamCreator from './StreamCreator';
import StreamAnalytics from './StreamAnalytics';
import RecordingLibrary from './RecordingLibrary';
import StreamScheduler from './StreamScheduler';

interface VideoStreamingPlatformProps {
  courseId?: string;
}

const VideoStreamingPlatform: React.FC<VideoStreamingPlatformProps> = ({ courseId }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [streams, setStreams] = useState<VideoStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<VideoStream | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'scheduled' | 'recordings' | 'analytics'>('live');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StreamStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<StreamType | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    loadStreams();
  }, [courseId, statusFilter, typeFilter]);

  const loadStreams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (courseId) params.append('courseId', courseId);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);

      const response = await fetch(`/api/video-streams?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const streamsData = await response.json();
        setStreams(streamsData);
      } else {
        throw new Error('Failed to load streams');
      }
    } catch (error) {
      addToast('Failed to load video streams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = async (streamData: Partial<VideoStream>) => {
    try {
      const response = await fetch('/api/video-streams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...streamData,
          ...(courseId && { courseId })
        })
      });

      if (response.ok) {
        const newStream = await response.json();
        setStreams(prev => [newStream, ...prev]);
        setShowCreateModal(false);
        addToast('Stream created successfully', 'success');
      } else {
        throw new Error('Failed to create stream');
      }
    } catch (error) {
      addToast('Failed to create stream', 'error');
    }
  };

  const handleJoinStream = (stream: VideoStream) => {
    setSelectedStream(stream);
  };

  const filteredStreams = streams.filter(stream => {
    const matchesSearch = !searchTerm || 
      stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stream.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const liveStreams = filteredStreams.filter(s => s.status === 'LIVE');
  const scheduledStreams = filteredStreams.filter(s => s.status === 'SCHEDULED');
  const endedStreams = filteredStreams.filter(s => s.status === 'ENDED');

  const tabs = [
    { 
      id: 'live', 
      label: 'Live Now', 
      icon: Live, 
      count: liveStreams.length,
      color: 'text-red-600 dark:text-red-400'
    },
    { 
      id: 'scheduled', 
      label: 'Scheduled', 
      icon: Calendar, 
      count: scheduledStreams.length,
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      id: 'recordings', 
      label: 'Recordings', 
      icon: Video, 
      count: endedStreams.length,
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      count: null,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'LIVE', label: 'Live' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'ENDED', label: 'Ended' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const typeOptions = [
    { value: 'ALL', label: 'All Types' },
    { value: 'LIVE', label: 'Live Stream' },
    { value: 'RECORDED', label: 'Recorded Video' },
    { value: 'WEBINAR', label: 'Webinar' },
    { value: 'MEETING', label: 'Meeting' },
    { value: 'PRESENTATION', label: 'Presentation' }
  ];

  const canCreateStreams = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  if (selectedStream) {
    return (
      <LiveStreamViewer
        stream={selectedStream}
        onClose={() => setSelectedStream(null)}
        onStreamUpdate={(updatedStream) => {
          setStreams(prev => prev.map(s => s.id === updatedStream.id ? updatedStream : s));
          setSelectedStream(updatedStream);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Video Streaming
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live streams, webinars, and video content
          </p>
        </div>

        {canCreateStreams && (
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
              icon={<Calendar className="w-4 h-4" />}
            >
              Schedule Stream
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Go Live
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search streams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.id === 'live' && liveStreams.length > 0 ? 'animate-pulse' : ''}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tab.id === 'live' && tab.count > 0
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'live' && (
            <div>
              {liveStreams.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {liveStreams.map((stream) => (
                    <StreamCard
                      key={stream.id}
                      stream={stream}
                      viewMode={viewMode}
                      onJoin={() => handleJoinStream(stream)}
                      onUpdate={(updatedStream) => {
                        setStreams(prev => prev.map(s => s.id === updatedStream.id ? updatedStream : s));
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <Live className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Live Streams
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    There are no live streams at the moment.
                  </p>
                  {canCreateStreams && (
                    <Button
                      variant="primary"
                      onClick={() => setShowCreateModal(true)}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Start Live Stream
                    </Button>
                  )}
                </Card>
              )}
            </div>
          )}

          {activeTab === 'scheduled' && (
            <StreamScheduler
              streams={scheduledStreams}
              viewMode={viewMode}
              onStreamUpdate={(updatedStream) => {
                setStreams(prev => prev.map(s => s.id === updatedStream.id ? updatedStream : s));
              }}
              onCreateStream={() => setShowScheduleModal(true)}
              canCreate={canCreateStreams}
            />
          )}

          {activeTab === 'recordings' && (
            <RecordingLibrary
              streams={endedStreams}
              viewMode={viewMode}
              onStreamSelect={handleJoinStream}
            />
          )}

          {activeTab === 'analytics' && (
            <StreamAnalytics
              streams={streams}
              courseId={courseId}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <StreamCreator
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateStream}
        courseId={courseId}
      />

      <StreamScheduler
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleCreateStream}
        courseId={courseId}
        isScheduling={true}
      />
    </div>
  );
};

export default VideoStreamingPlatform;
