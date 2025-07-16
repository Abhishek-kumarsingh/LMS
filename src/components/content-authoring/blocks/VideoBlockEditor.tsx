import React, { useState, useRef } from 'react';
import {
  Upload,
  Video as VideoIcon,
  Link,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Download,
  X,
  Clock,
  FileText,
  Scissors,
  Plus
} from 'lucide-react';
import { ContentBlock, MediaChapter } from '../../../types';
import { useToastStore } from '../../../store/toastStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

interface VideoBlockEditorProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  isSelected: boolean;
}

const VideoBlockEditor: React.FC<VideoBlockEditorProps> = ({
  block,
  onUpdate,
  isSelected
}) => {
  const { addToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: '', startTime: 0 });

  const [videoSettings, setVideoSettings] = useState({
    autoplay: false,
    loop: false,
    muted: false,
    controls: true,
    width: '100%',
    aspectRatio: '16:9'
  });

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      addToast('Please select a video file', 'error');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      addToast('Video file size must be less than 100MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        onUpdate({
          content: {
            ...block.content,
            mediaUrl: result.url,
            mediaType: 'VIDEO',
            mediaMetadata: {
              filename: file.name,
              fileSize: file.size,
              mimeType: file.type,
              duration: 0, // Will be updated when video loads
              chapters: [],
              transcript: ''
            }
          }
        });

        addToast('Video uploaded successfully', 'success');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      addToast('Failed to upload video', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!videoUrl.trim()) return;

    // Handle YouTube, Vimeo, and other video URLs
    let embedUrl = videoUrl;
    
    // YouTube URL conversion
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo URL conversion
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    onUpdate({
      content: {
        ...block.content,
        mediaUrl: embedUrl,
        mediaType: 'VIDEO',
        mediaMetadata: {
          filename: 'embedded-video',
          fileSize: 0,
          mimeType: 'video/embed',
          duration: 0,
          chapters: [],
          transcript: ''
        }
      }
    });

    setShowUrlInput(false);
    setVideoUrl('');
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      onUpdate({
        content: {
          ...block.content,
          mediaMetadata: {
            ...block.content.mediaMetadata,
            duration: Math.round(duration)
          }
        }
      });
    }
  };

  const handleAddChapter = () => {
    if (!newChapter.title.trim()) return;

    const chapters = block.content.mediaMetadata?.chapters || [];
    const chapter: MediaChapter = {
      id: Math.random().toString(36).substr(2, 9),
      title: newChapter.title,
      startTime: newChapter.startTime,
      endTime: newChapter.startTime + 60, // Default 1 minute duration
      description: ''
    };

    onUpdate({
      content: {
        ...block.content,
        mediaMetadata: {
          ...block.content.mediaMetadata,
          chapters: [...chapters, chapter].sort((a, b) => a.startTime - b.startTime)
        }
      }
    });

    setNewChapter({ title: '', startTime: 0 });
  };

  const handleRemoveChapter = (chapterId: string) => {
    const chapters = block.content.mediaMetadata?.chapters || [];
    onUpdate({
      content: {
        ...block.content,
        mediaMetadata: {
          ...block.content.mediaMetadata,
          chapters: chapters.filter(c => c.id !== chapterId)
        }
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isEmbedded = block.content.mediaUrl?.includes('youtube.com/embed') || 
                   block.content.mediaUrl?.includes('player.vimeo.com');

  const hasVideo = block.content.mediaUrl;

  if (!hasVideo) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Add a Video
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Upload a video file or embed from YouTube/Vimeo
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            loading={isUploading}
            icon={<Upload className="w-4 h-4" />}
          >
            Upload Video
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowUrlInput(true)}
            icon={<Link className="w-4 h-4" />}
          >
            Embed Video
          </Button>
        </div>

        {showUrlInput && (
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Enter YouTube or Vimeo URL..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Button
                variant="primary"
                onClick={handleUrlSubmit}
                disabled={!videoUrl.trim()}
              >
                Embed
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowUrlInput(false);
                  setVideoUrl('');
                }}
                icon={<X className="w-4 h-4" />}
              />
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
        />

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Supported formats: MP4, WebM, MOV (max 100MB) or YouTube/Vimeo URLs
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Settings Toolbar */}
      {isSelected && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            icon={<Settings className="w-4 h-4" />}
            title="Video Settings"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChapters(!showChapters)}
            icon={<Scissors className="w-4 h-4" />}
            title="Chapters"
          />

          {!isEmbedded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = block.content.mediaUrl || '';
                link.download = block.content.mediaMetadata?.filename || 'video';
                link.click();
              }}
              icon={<Download className="w-4 h-4" />}
              title="Download"
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ content: { ...block.content, mediaUrl: '', mediaMetadata: undefined } })}
            icon={<X className="w-4 h-4" />}
            title="Remove Video"
            className="text-red-600 hover:text-red-700"
          />

          {block.content.mediaMetadata?.duration && (
            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              Duration: {formatTime(block.content.mediaMetadata.duration)}
            </div>
          )}
        </div>
      )}

      {/* Video Settings */}
      {showSettings && isSelected && !isEmbedded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Video Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={videoSettings.autoplay}
                onChange={(e) => setVideoSettings(prev => ({ ...prev, autoplay: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Autoplay</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={videoSettings.loop}
                onChange={(e) => setVideoSettings(prev => ({ ...prev, loop: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Loop</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={videoSettings.muted}
                onChange={(e) => setVideoSettings(prev => ({ ...prev, muted: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Muted</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={videoSettings.controls}
                onChange={(e) => setVideoSettings(prev => ({ ...prev, controls: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Controls</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Aspect Ratio
            </label>
            <select
              value={videoSettings.aspectRatio}
              onChange={(e) => setVideoSettings(prev => ({ ...prev, aspectRatio: e.target.value }))}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
            >
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="9:16">9:16 (Vertical)</option>
            </select>
          </div>
        </div>
      )}

      {/* Chapters Management */}
      {showChapters && isSelected && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Video Chapters</h4>
          
          {/* Add Chapter */}
          <div className="flex gap-2">
            <Input
              placeholder="Chapter title..."
              value={newChapter.title}
              onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Start time (seconds)"
              value={newChapter.startTime}
              onChange={(e) => setNewChapter(prev => ({ ...prev, startTime: parseInt(e.target.value) || 0 }))}
              className="w-32"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddChapter}
              disabled={!newChapter.title.trim()}
              icon={<Plus className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>

          {/* Chapter List */}
          <div className="space-y-2">
            {(block.content.mediaMetadata?.chapters || []).map((chapter) => (
              <div key={chapter.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">{chapter.title}</div>
                    <div className="text-xs text-gray-500">
                      {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveChapter(chapter.id)}
                  icon={<X className="w-4 h-4" />}
                  className="text-red-600 hover:text-red-700"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Player */}
      <div className="relative">
        {isEmbedded ? (
          <div 
            className="relative w-full"
            style={{ 
              paddingBottom: videoSettings.aspectRatio === '16:9' ? '56.25%' : 
                             videoSettings.aspectRatio === '4:3' ? '75%' : 
                             videoSettings.aspectRatio === '1:1' ? '100%' : '177.78%'
            }}
          >
            <iframe
              src={block.content.mediaUrl}
              className="absolute inset-0 w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={block.content.mediaUrl}
            className="w-full rounded-lg"
            controls={videoSettings.controls}
            autoPlay={videoSettings.autoplay}
            loop={videoSettings.loop}
            muted={videoSettings.muted}
            onLoadedMetadata={handleVideoLoad}
            style={{ width: videoSettings.width }}
          />
        )}
      </div>

      {/* Transcript */}
      {isSelected && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Video Transcript (optional)
            </label>
            <textarea
              value={block.content.mediaMetadata?.transcript || ''}
              onChange={(e) => onUpdate({
                content: {
                  ...block.content,
                  mediaMetadata: {
                    ...block.content.mediaMetadata,
                    transcript: e.target.value
                  }
                }
              })}
              placeholder="Add a transcript for accessibility..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      {/* Video Metadata */}
      {isSelected && block.content.mediaMetadata && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>File: {block.content.mediaMetadata.filename}</div>
          {block.content.mediaMetadata.fileSize > 0 && (
            <div>Size: {(block.content.mediaMetadata.fileSize / 1024 / 1024).toFixed(2)} MB</div>
          )}
          {block.content.mediaMetadata.duration > 0 && (
            <div>Duration: {formatTime(block.content.mediaMetadata.duration)}</div>
          )}
          {block.content.mediaMetadata.chapters && block.content.mediaMetadata.chapters.length > 0 && (
            <div>Chapters: {block.content.mediaMetadata.chapters.length}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoBlockEditor;
