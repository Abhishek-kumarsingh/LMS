import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Video,
  Mic,
  Monitor,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Users,
  MessageSquare,
  Hand,
  Calendar,
  Clock,
  Upload,
  Camera,
  Palette
} from 'lucide-react';
import { VideoStream, StreamType, VideoQuality, AccessControl } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

interface StreamCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (streamData: Partial<VideoStream>) => void;
  courseId?: string;
}

const StreamCreator: React.FC<StreamCreatorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courseId
}) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [streamData, setStreamData] = useState({
    title: '',
    description: '',
    streamType: 'LIVE' as StreamType,
    thumbnailUrl: '',
    chatEnabled: true,
    qaEnabled: true,
    pollsEnabled: true,
    screenShareEnabled: true,
    maxViewers: undefined as number | undefined,
    settings: {
      quality: 'AUTO' as VideoQuality,
      autoRecord: true,
      allowDownload: false,
      requireAuth: true,
      moderationEnabled: true,
      chatModeration: true,
      waitingRoom: false,
      password: '',
      accessControl: {
        type: courseId ? 'COURSE' : 'PUBLIC',
        allowedUsers: [],
        allowedRoles: [],
        registrationRequired: false,
        approvalRequired: false
      } as AccessControl,
      notifications: {
        emailReminders: true,
        pushNotifications: true,
        reminderTimes: [15, 60],
        notifyOnStart: true,
        notifyOnEnd: false
      },
      branding: {
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          background: '#FFFFFF',
          text: '#111827'
        }
      }
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const streamTypes = [
    {
      type: 'LIVE',
      label: 'Live Stream',
      description: 'Real-time streaming with audience interaction',
      icon: Video,
      features: ['Real-time chat', 'Q&A', 'Polls', 'Screen sharing']
    },
    {
      type: 'WEBINAR',
      label: 'Webinar',
      description: 'Professional presentation with moderated interaction',
      icon: Monitor,
      features: ['Moderated Q&A', 'Registration', 'Recording', 'Analytics']
    },
    {
      type: 'MEETING',
      label: 'Meeting',
      description: 'Interactive meeting with participants',
      icon: Users,
      features: ['Two-way video', 'Screen sharing', 'Breakout rooms', 'Recording']
    },
    {
      type: 'PRESENTATION',
      label: 'Presentation',
      description: 'One-way presentation with minimal interaction',
      icon: Monitor,
      features: ['Screen sharing', 'Basic chat', 'Recording', 'Simple setup']
    }
  ];

  const accessTypes = [
    {
      type: 'PUBLIC',
      label: 'Public',
      description: 'Anyone can join without authentication',
      icon: Globe
    },
    {
      type: 'COURSE',
      label: 'Course Only',
      description: 'Only course members can join',
      icon: Users,
      disabled: !courseId
    },
    {
      type: 'PRIVATE',
      label: 'Private',
      description: 'Only invited users can join',
      icon: Lock
    },
    {
      type: 'PASSWORD',
      label: 'Password Protected',
      description: 'Requires password to join',
      icon: Eye
    }
  ];

  const qualityOptions = [
    { value: 'AUTO', label: 'Auto (Adaptive)', description: 'Automatically adjusts based on connection' },
    { value: '720p', label: '720p HD', description: 'Good quality for most streams' },
    { value: '1080p', label: '1080p Full HD', description: 'High quality, requires good connection' },
    { value: '4K', label: '4K Ultra HD', description: 'Maximum quality, requires excellent connection' }
  ];

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!streamData.title.trim()) {
        newErrors.title = 'Stream title is required';
      }
      if (!streamData.streamType) {
        newErrors.streamType = 'Please select a stream type';
      }
    }

    if (stepNumber === 2) {
      if (streamData.settings.accessControl.type === 'PASSWORD' && !streamData.settings.password) {
        newErrors.password = 'Password is required for password-protected streams';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleThumbnailUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'thumbnail');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setStreamData(prev => ({ ...prev, thumbnailUrl: result.url }));
        addToast('Thumbnail uploaded successfully', 'success');
      }
    } catch (error) {
      addToast('Failed to upload thumbnail', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...streamData,
        instructorId: user?.id,
        status: 'SCHEDULED',
        currentViewers: 0,
        totalViews: 0,
        analytics: {
          totalViews: 0,
          uniqueViewers: 0,
          averageWatchTime: 0,
          peakViewers: 0,
          engagementRate: 0,
          chatMessages: 0,
          pollResponses: 0,
          qaQuestions: 0,
          dropOffPoints: [],
          viewerRetention: [],
          geographicData: [],
          deviceData: [],
          qualityMetrics: {
            averageBitrate: 0,
            bufferingEvents: 0,
            averageBufferTime: 0,
            qualityChanges: 0,
            errorRate: 0,
            latency: 0
          }
        },
        interactions: [],
        recordings: []
      });
      
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setStreamData({
      title: '',
      description: '',
      streamType: 'LIVE',
      thumbnailUrl: '',
      chatEnabled: true,
      qaEnabled: true,
      pollsEnabled: true,
      screenShareEnabled: true,
      maxViewers: undefined,
      settings: {
        quality: 'AUTO',
        autoRecord: true,
        allowDownload: false,
        requireAuth: true,
        moderationEnabled: true,
        chatModeration: true,
        waitingRoom: false,
        password: '',
        accessControl: {
          type: courseId ? 'COURSE' : 'PUBLIC',
          allowedUsers: [],
          allowedRoles: [],
          registrationRequired: false,
          approvalRequired: false
        },
        notifications: {
          emailReminders: true,
          pushNotifications: true,
          reminderTimes: [15, 60],
          notifyOnStart: true,
          notifyOnEnd: false
        },
        branding: {
          colors: {
            primary: '#3B82F6',
            secondary: '#6B7280',
            background: '#FFFFFF',
            text: '#111827'
          }
        }
      }
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create Live Stream
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Step {step} of 3 - Set up your live stream
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step > stepNumber
                          ? 'bg-primary-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Basic Info</span>
                <span>Settings</span>
                <span>Review</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <Input
                    label="Stream Title"
                    value={streamData.title}
                    onChange={(e) => setStreamData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a descriptive title for your stream..."
                    error={errors.title}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={streamData.description}
                      onChange={(e) => setStreamData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what your stream will cover..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Stream Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {streamTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = streamData.streamType === type.type;
                        
                        return (
                          <label
                            key={type.type}
                            className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="streamType"
                              value={type.type}
                              checked={isSelected}
                              onChange={(e) => setStreamData(prev => ({ ...prev, streamType: e.target.value as StreamType }))}
                              className="sr-only"
                            />
                            
                            <div className="flex items-center space-x-3 mb-2">
                              <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {type.label}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {type.description}
                            </p>
                            
                            <div className="space-y-1">
                              {type.features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {errors.streamType && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.streamType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thumbnail (Optional)
                    </label>
                    <div className="flex items-center space-x-4">
                      {streamData.thumbnailUrl ? (
                        <div className="relative">
                          <img
                            src={streamData.thumbnailUrl}
                            alt="Stream thumbnail"
                            className="w-32 h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setStreamData(prev => ({ ...prev, thumbnailUrl: '' }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => thumbnailInputRef.current?.click()}
                        icon={<Upload className="w-4 h-4" />}
                      >
                        Upload Thumbnail
                      </Button>
                      
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleThumbnailUpload(file);
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Settings */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Access Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Who can join this stream?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {accessTypes.map((access) => {
                        const Icon = access.icon;
                        const isSelected = streamData.settings.accessControl.type === access.type;
                        const isDisabled = access.disabled;
                        
                        return (
                          <label
                            key={access.type}
                            className={`relative flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              isDisabled
                                ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700'
                                : isSelected
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="accessType"
                              value={access.type}
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={(e) => setStreamData(prev => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  accessControl: {
                                    ...prev.settings.accessControl,
                                    type: e.target.value as any
                                  }
                                }
                              }))}
                              className="sr-only"
                            />
                            
                            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {access.label}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {access.description}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Password Field */}
                  {streamData.settings.accessControl.type === 'PASSWORD' && (
                    <Input
                      label="Stream Password"
                      type="password"
                      value={streamData.settings.password}
                      onChange={(e) => setStreamData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, password: e.target.value }
                      }))}
                      placeholder="Enter password for the stream..."
                      error={errors.password}
                      required
                    />
                  )}

                  {/* Stream Quality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Stream Quality
                    </label>
                    <div className="space-y-2">
                      {qualityOptions.map((quality) => (
                        <label
                          key={quality.value}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                            streamData.settings.quality === quality.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="quality"
                              value={quality.value}
                              checked={streamData.settings.quality === quality.value}
                              onChange={(e) => setStreamData(prev => ({
                                ...prev,
                                settings: { ...prev.settings, quality: e.target.value as VideoQuality }
                              }))}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {quality.label}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {quality.description}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Interactive Features
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={streamData.chatEnabled}
                          onChange={(e) => setStreamData(prev => ({ ...prev, chatEnabled: e.target.checked }))}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                        />
                        <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Enable Chat
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Allow viewers to chat during the stream
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={streamData.qaEnabled}
                          onChange={(e) => setStreamData(prev => ({ ...prev, qaEnabled: e.target.checked }))}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                        />
                        <Hand className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Enable Q&A
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Allow viewers to ask questions
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={streamData.settings.autoRecord}
                          onChange={(e) => setStreamData(prev => ({
                            ...prev,
                            settings: { ...prev.settings, autoRecord: e.target.checked }
                          }))}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                        />
                        <Video className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Auto Record
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Automatically record the stream for later viewing
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-6">
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Stream Summary
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-500">Title:</span> {streamData.title}</div>
                          <div><span className="text-gray-500">Type:</span> {streamData.streamType}</div>
                          {streamData.description && (
                            <div><span className="text-gray-500">Description:</span> {streamData.description}</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-500">Access:</span> {streamData.settings.accessControl.type}</div>
                          <div><span className="text-gray-500">Quality:</span> {streamData.settings.quality}</div>
                          <div><span className="text-gray-500">Chat:</span> {streamData.chatEnabled ? 'Enabled' : 'Disabled'}</div>
                          <div><span className="text-gray-500">Q&A:</span> {streamData.qaEnabled ? 'Enabled' : 'Disabled'}</div>
                          <div><span className="text-gray-500">Recording:</span> {streamData.settings.autoRecord ? 'Enabled' : 'Disabled'}</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Ready to Go Live?
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Once you create this stream, you'll be able to start broadcasting immediately. 
                      Make sure your camera and microphone are ready!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                
                {step < 3 ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    icon={<Video className="w-4 h-4" />}
                  >
                    Create Stream
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreamCreator;
