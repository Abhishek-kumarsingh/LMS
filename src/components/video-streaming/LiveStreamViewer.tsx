import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  MessageSquare,
  Users,
  Hand,
  Share2,
  Download,
  MoreVertical,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Heart,
  ThumbsUp,
  Smile,
  Send,
  Eye,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { VideoStream, StreamInteraction, ChatMessage } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import StreamChat from './StreamChat';
import StreamControls from './StreamControls';
import ViewersList from './ViewersList';
import StreamQA from './StreamQA';

interface LiveStreamViewerProps {
  stream: VideoStream;
  onClose: () => void;
  onStreamUpdate: (stream: VideoStream) => void;
}

const LiveStreamViewer: React.FC<LiveStreamViewerProps> = ({
  stream,
  onClose,
  onStreamUpdate
}) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<'AUTO' | '720p' | '1080p'>('AUTO');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'viewers' | 'qa'>('chat');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [reactions, setReactions] = useState<{ emoji: string; id: string; x: number; y: number }[]>([]);

  const [streamStats, setStreamStats] = useState({
    viewers: stream.currentViewers,
    duration: 0,
    bitrate: 0,
    fps: 0,
    latency: 0
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStreamStats(prev => ({
        ...prev,
        duration: prev.duration + 1,
        viewers: stream.currentViewers + Math.floor(Math.random() * 5) - 2,
        bitrate: 2500 + Math.floor(Math.random() * 500),
        fps: 30,
        latency: 2000 + Math.floor(Math.random() * 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [stream.currentViewers]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleReaction = (emoji: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const x = Math.random() * 80 + 10; // 10-90% from left
    const y = Math.random() * 60 + 20; // 20-80% from top
    
    setReactions(prev => [...prev, { emoji, id, x, y }]);
    
    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);

    // Send reaction to server
    // TODO: Implement reaction API
  };

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
    // TODO: Send hand raise status to server
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isInstructor = user?.id === stream.instructorId;
  const canInteract = stream.chatEnabled || stream.qaEnabled;

  const sidebarTabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, enabled: stream.chatEnabled },
    { id: 'viewers', label: 'Viewers', icon: Users, enabled: true },
    { id: 'qa', label: 'Q&A', icon: Hand, enabled: stream.qaEnabled }
  ].filter(tab => tab.enabled);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex ${isFullscreen ? 'cursor-none' : ''}`}
    >
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Video Player */}
        <div className="relative w-full h-full flex items-center justify-center">
          {stream.streamUrl ? (
            <video
              ref={videoRef}
              src={stream.streamUrl}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={(e) => {
                const video = e.target as HTMLVideoElement;
                setVolume(video.volume);
                setIsMuted(video.muted);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <Video className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg mb-2">Stream is starting...</p>
              <p className="text-sm opacity-75">Please wait while we connect you to the stream</p>
            </div>
          )}

          {/* Reactions Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {reactions.map((reaction) => (
                <motion.div
                  key={reaction.id}
                  initial={{ opacity: 1, scale: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 1.5, y: -100 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, ease: 'easeOut' }}
                  className="absolute text-4xl"
                  style={{ left: `${reaction.x}%`, top: `${reaction.y}%` }}
                >
                  {reaction.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Stream Info Overlay */}
          <div className="absolute top-4 left-4 flex items-center space-x-4">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>LIVE</span>
            </div>
            
            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{streamStats.viewers}</span>
            </div>

            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(streamStats.duration)}</span>
            </div>

            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="capitalize">{connectionStatus}</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Stream Controls */}
          <AnimatePresence>
            {(showControls || !isFullscreen) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4"
              >
                <StreamControls
                  isPlaying={isPlaying}
                  volume={volume}
                  isMuted={isMuted}
                  isFullscreen={isFullscreen}
                  quality={quality}
                  onPlayPause={togglePlayPause}
                  onVolumeChange={handleVolumeChange}
                  onMute={toggleMute}
                  onFullscreen={toggleFullscreen}
                  onQualityChange={setQuality}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reaction Buttons */}
          {canInteract && (
            <div className="absolute bottom-20 right-4 flex flex-col space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('❤️')}
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-75"
              >
                ❤️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('👍')}
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-75"
              >
                👍
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('👏')}
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-75"
              >
                👏
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('😂')}
                className="bg-black bg-opacity-50 text-white hover:bg-opacity-75"
              >
                😂
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRaiseHand}
                className={`bg-black bg-opacity-50 text-white hover:bg-opacity-75 ${
                  isHandRaised ? 'bg-yellow-500 bg-opacity-75' : ''
                }`}
              >
                ✋
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && !isFullscreen && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {stream.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                icon={<X className="w-4 h-4" />}
              />
            </div>

            {/* Sidebar Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {sidebarTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSidebarTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      sidebarTab === tab.id
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {sidebarTab === 'chat' && (
              <StreamChat
                streamId={stream.id}
                enabled={stream.chatEnabled}
                isInstructor={isInstructor}
              />
            )}
            
            {sidebarTab === 'viewers' && (
              <ViewersList
                streamId={stream.id}
                currentViewers={streamStats.viewers}
                isInstructor={isInstructor}
              />
            )}
            
            {sidebarTab === 'qa' && (
              <StreamQA
                streamId={stream.id}
                enabled={stream.qaEnabled}
                isInstructor={isInstructor}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Sidebar Toggle (when hidden) */}
      {!showSidebar && !isFullscreen && (
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Stream Stats (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Bitrate: {streamStats.bitrate} kbps</div>
          <div>FPS: {streamStats.fps}</div>
          <div>Latency: {streamStats.latency}ms</div>
          <div>Quality: {quality}</div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamViewer;
