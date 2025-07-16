import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize,
  Minimize,
  RotateCw,
  Crop,
  Palette,
  Eye,
  Download,
  X
} from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useToastStore } from '../../../store/toastStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

interface ImageBlockEditorProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  isSelected: boolean;
}

const ImageBlockEditor: React.FC<ImageBlockEditorProps> = ({
  block,
  onUpdate,
  isSelected
}) => {
  const { addToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const [imageSettings, setImageSettings] = useState({
    alignment: 'center',
    width: '100%',
    height: 'auto',
    borderRadius: '0',
    shadow: 'none',
    filter: 'none'
  });

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      addToast('Image file size must be less than 10MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Create image to get dimensions
        const img = new Image();
        img.onload = () => {
          onUpdate({
            content: {
              ...block.content,
              mediaUrl: result.url,
              mediaType: 'IMAGE',
              mediaMetadata: {
                filename: file.name,
                fileSize: file.size,
                mimeType: file.type,
                dimensions: {
                  width: img.width,
                  height: img.height
                },
                altText: '',
                caption: ''
              }
            }
          });
        };
        img.src = result.url;

        addToast('Image uploaded successfully', 'success');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      addToast('Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) return;

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      addToast('Please enter a valid URL', 'error');
      return;
    }

    // Create image to validate and get dimensions
    const img = new Image();
    img.onload = () => {
      onUpdate({
        content: {
          ...block.content,
          mediaUrl: imageUrl,
          mediaType: 'IMAGE',
          mediaMetadata: {
            filename: imageUrl.split('/').pop() || 'image',
            fileSize: 0,
            mimeType: 'image/unknown',
            dimensions: {
              width: img.width,
              height: img.height
            },
            altText: '',
            caption: ''
          }
        }
      });
      setShowUrlInput(false);
      setImageUrl('');
    };
    img.onerror = () => {
      addToast('Failed to load image from URL', 'error');
    };
    img.src = imageUrl;
  };

  const handleAltTextChange = (altText: string) => {
    onUpdate({
      content: {
        ...block.content,
        mediaMetadata: {
          ...block.content.mediaMetadata,
          altText
        }
      }
    });
  };

  const handleCaptionChange = (caption: string) => {
    onUpdate({
      content: {
        ...block.content,
        mediaMetadata: {
          ...block.content.mediaMetadata,
          caption
        }
      }
    });
  };

  const alignmentOptions = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' }
  ];

  const sizeOptions = [
    { value: '25%', label: 'Small' },
    { value: '50%', label: 'Medium' },
    { value: '75%', label: 'Large' },
    { value: '100%', label: 'Full Width' }
  ];

  const filterOptions = [
    { value: 'none', label: 'None' },
    { value: 'grayscale(100%)', label: 'Grayscale' },
    { value: 'sepia(100%)', label: 'Sepia' },
    { value: 'blur(2px)', label: 'Blur' },
    { value: 'brightness(1.2)', label: 'Bright' },
    { value: 'contrast(1.2)', label: 'High Contrast' }
  ];

  const hasImage = block.content.mediaUrl;

  if (!hasImage) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Add an Image
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Upload an image file or add one from a URL
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            loading={isUploading}
            icon={<Upload className="w-4 h-4" />}
          >
            Upload Image
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowUrlInput(true)}
            icon={<Link className="w-4 h-4" />}
          >
            Add from URL
          </Button>
        </div>

        {showUrlInput && (
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Button
                variant="primary"
                onClick={handleUrlSubmit}
                disabled={!imageUrl.trim()}
              >
                Add
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowUrlInput(false);
                  setImageUrl('');
                }}
                icon={<X className="w-4 h-4" />}
              />
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
        />

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Supported formats: JPG, PNG, GIF, WebP (max 10MB)
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image Settings Toolbar */}
      {isSelected && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Alignment */}
          <div className="flex items-center space-x-1">
            {alignmentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={imageSettings.alignment === option.value ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setImageSettings(prev => ({ ...prev, alignment: option.value }))}
                  icon={<Icon className="w-4 h-4" />}
                  title={option.label}
                />
              );
            })}
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Size */}
          <select
            value={imageSettings.width}
            onChange={(e) => setImageSettings(prev => ({ ...prev, width: e.target.value }))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
          >
            {sizeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Effects */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            icon={<Palette className="w-4 h-4" />}
            title="Image Effects"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(block.content.mediaUrl, '_blank')}
            icon={<Eye className="w-4 h-4" />}
            title="View Full Size"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const link = document.createElement('a');
              link.href = block.content.mediaUrl || '';
              link.download = block.content.mediaMetadata?.filename || 'image';
              link.click();
            }}
            icon={<Download className="w-4 h-4" />}
            title="Download"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ content: { ...block.content, mediaUrl: '', mediaMetadata: undefined } })}
            icon={<X className="w-4 h-4" />}
            title="Remove Image"
            className="text-red-600 hover:text-red-700"
          />
        </div>
      )}

      {/* Advanced Settings */}
      {showSettings && isSelected && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Image Effects</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Border Radius
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={parseInt(imageSettings.borderRadius)}
                onChange={(e) => setImageSettings(prev => ({ ...prev, borderRadius: e.target.value + 'px' }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter
              </label>
              <select
                value={imageSettings.filter}
                onChange={(e) => setImageSettings(prev => ({ ...prev, filter: e.target.value }))}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Image Display */}
      <div
        className="relative"
        style={{
          textAlign: imageSettings.alignment as any
        }}
      >
        <img
          src={block.content.mediaUrl}
          alt={block.content.mediaMetadata?.altText || ''}
          className="max-w-full h-auto rounded transition-all duration-200"
          style={{
            width: imageSettings.width,
            height: imageSettings.height,
            borderRadius: imageSettings.borderRadius,
            filter: imageSettings.filter,
            boxShadow: imageSettings.shadow !== 'none' ? imageSettings.shadow : undefined
          }}
          onError={() => {
            addToast('Failed to load image', 'error');
          }}
        />

        {/* Image Info Overlay */}
        {isSelected && block.content.mediaMetadata?.dimensions && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {block.content.mediaMetadata.dimensions.width} × {block.content.mediaMetadata.dimensions.height}
          </div>
        )}
      </div>

      {/* Alt Text and Caption */}
      {isSelected && (
        <div className="space-y-3">
          <Input
            label="Alt Text (for accessibility)"
            value={block.content.mediaMetadata?.altText || ''}
            onChange={(e) => handleAltTextChange(e.target.value)}
            placeholder="Describe the image for screen readers..."
          />
          
          <Input
            label="Caption (optional)"
            value={block.content.mediaMetadata?.caption || ''}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Add a caption for the image..."
          />
        </div>
      )}

      {/* Caption Display */}
      {block.content.mediaMetadata?.caption && (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            {block.content.mediaMetadata.caption}
          </p>
        </div>
      )}

      {/* Image Metadata */}
      {isSelected && block.content.mediaMetadata && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>File: {block.content.mediaMetadata.filename}</div>
          {block.content.mediaMetadata.fileSize > 0 && (
            <div>Size: {(block.content.mediaMetadata.fileSize / 1024 / 1024).toFixed(2)} MB</div>
          )}
          {block.content.mediaMetadata.dimensions && (
            <div>
              Dimensions: {block.content.mediaMetadata.dimensions.width} × {block.content.mediaMetadata.dimensions.height}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageBlockEditor;
