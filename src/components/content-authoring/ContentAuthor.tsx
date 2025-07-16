import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Save,
  Eye,
  Share2,
  Settings,
  Layers,
  Type,
  Image,
  Video,
  Music,
  Code,
  Calculator,
  Globe,
  FileText,
  Zap,
  BarChart3,
  Map,
  FormInput,
  Undo,
  Redo,
  Copy,
  Trash2,
  Move,
  Grid,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { ContentBlock, BlockType, ContentTemplate } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import BlockEditor from './BlockEditor';
import BlockToolbar from './BlockToolbar';
import ContentPreview from './ContentPreview';
import TemplateSelector from './TemplateSelector';
import ContentSettings from './ContentSettings';
import PublishModal from './PublishModal';

interface ContentAuthorProps {
  contentId?: string;
  courseId?: string;
  templateId?: string;
}

const ContentAuthor: React.FC<ContentAuthorProps> = ({
  contentId,
  courseId,
  templateId
}) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [history, setHistory] = useState<ContentBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [contentMetadata, setContentMetadata] = useState({
    title: 'Untitled Content',
    description: '',
    tags: [] as string[],
    estimatedDuration: 0,
    difficulty: 'INTERMEDIATE' as const,
    learningObjectives: [] as string[],
    isPublished: false
  });

  useEffect(() => {
    if (contentId) {
      loadContent();
    } else if (templateId) {
      loadTemplate();
    } else {
      initializeEmptyContent();
    }
  }, [contentId, templateId]);

  useEffect(() => {
    // Auto-save every 30 seconds if there are changes
    const autoSaveInterval = setInterval(() => {
      if (isDirty && !isAutoSaving) {
        handleAutoSave();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [isDirty, isAutoSaving]);

  const loadContent = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const content = await response.json();
        setBlocks(content.blocks || []);
        setContentMetadata(content.metadata || contentMetadata);
        addToHistory(content.blocks || []);
      }
    } catch (error) {
      addToast('Failed to load content', 'error');
    }
  };

  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/content-templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const template = await response.json();
        setBlocks(template.structure || []);
        setContentMetadata({
          ...contentMetadata,
          title: `${template.name} - Copy`,
          description: template.description,
          estimatedDuration: template.metadata.estimatedDuration,
          difficulty: template.metadata.difficulty,
          learningObjectives: template.metadata.learningObjectives
        });
        addToHistory(template.structure || []);
      }
    } catch (error) {
      addToast('Failed to load template', 'error');
    }
  };

  const initializeEmptyContent = () => {
    const initialBlock: ContentBlock = {
      id: generateId(),
      type: 'TEXT',
      position: 0,
      content: {
        text: {
          html: '<h1>Welcome to Content Authoring</h1><p>Start creating your content here...</p>',
          plainText: 'Welcome to Content Authoring\nStart creating your content here...',
          wordCount: 8,
          readingTime: 1,
          links: [],
          mentions: []
        }
      },
      settings: {
        visible: true,
        locked: false,
        backgroundColor: 'transparent',
        padding: 'medium',
        margin: 'medium'
      },
      interactions: [],
      analytics: {
        views: 0,
        timeSpent: 0,
        interactions: 0,
        completionRate: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setBlocks([initialBlock]);
    addToHistory([initialBlock]);
  };

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const addToHistory = (newBlocks: ContentBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newBlocks)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      setIsDirty(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex + 1])));
      setIsDirty(true);
    }
  };

  const handleAddBlock = (type: BlockType, position?: number) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      position: position ?? blocks.length,
      content: getDefaultContent(type),
      settings: {
        visible: true,
        locked: false,
        backgroundColor: 'transparent',
        padding: 'medium',
        margin: 'medium'
      },
      interactions: [],
      analytics: {
        views: 0,
        timeSpent: 0,
        interactions: 0,
        completionRate: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newBlocks = [...blocks];
    if (position !== undefined) {
      newBlocks.splice(position, 0, newBlock);
      // Update positions
      newBlocks.forEach((block, index) => {
        block.position = index;
      });
    } else {
      newBlocks.push(newBlock);
    }

    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
    setIsDirty(true);
    addToHistory(newBlocks);
  };

  const getDefaultContent = (type: BlockType) => {
    switch (type) {
      case 'TEXT':
        return {
          text: {
            html: '<p>Enter your text here...</p>',
            plainText: 'Enter your text here...',
            wordCount: 4,
            readingTime: 1,
            links: [],
            mentions: []
          }
        };
      case 'IMAGE':
        return {
          mediaUrl: '',
          mediaType: 'IMAGE' as const,
          mediaMetadata: {
            filename: '',
            fileSize: 0,
            mimeType: '',
            altText: '',
            caption: ''
          }
        };
      case 'VIDEO':
        return {
          mediaUrl: '',
          mediaType: 'VIDEO' as const,
          mediaMetadata: {
            filename: '',
            fileSize: 0,
            mimeType: '',
            duration: 0,
            chapters: []
          }
        };
      default:
        return {};
    }
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId
        ? { ...block, ...updates, updatedAt: new Date().toISOString() }
        : block
    );
    setBlocks(newBlocks);
    setIsDirty(true);
  };

  const handleDeleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    // Update positions
    newBlocks.forEach((block, index) => {
      block.position = index;
    });
    setBlocks(newBlocks);
    setSelectedBlockId(null);
    setIsDirty(true);
    addToHistory(newBlocks);
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

    if (targetIndex >= 0 && targetIndex < newBlocks.length) {
      [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
      // Update positions
      newBlocks.forEach((block, index) => {
        block.position = index;
      });
      setBlocks(newBlocks);
      setIsDirty(true);
      addToHistory(newBlocks);
    }
  };

  const handleAutoSave = async () => {
    if (!isDirty) return;

    setIsAutoSaving(true);
    try {
      const response = await fetch(`/api/content/${contentId || 'new'}`, {
        method: contentId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          blocks,
          metadata: contentMetadata,
          courseId
        })
      });

      if (response.ok) {
        setIsDirty(false);
        addToast('Content auto-saved', 'success');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleSave = async () => {
    await handleAutoSave();
  };

  const blockTypes = [
    { type: 'TEXT', label: 'Text', icon: Type, description: 'Rich text content' },
    { type: 'IMAGE', label: 'Image', icon: Image, description: 'Images and graphics' },
    { type: 'VIDEO', label: 'Video', icon: Video, description: 'Video content' },
    { type: 'AUDIO', label: 'Audio', icon: Music, description: 'Audio files' },
    { type: 'QUIZ', label: 'Quiz', icon: Zap, description: 'Interactive quizzes' },
    { type: 'CODE', label: 'Code', icon: Code, description: 'Code snippets' },
    { type: 'MATH', label: 'Math', icon: Calculator, description: 'Mathematical formulas' },
    { type: 'EMBED', label: 'Embed', icon: Globe, description: 'External content' },
    { type: 'CHART', label: 'Chart', icon: BarChart3, description: 'Data visualizations' },
    { type: 'FORM', label: 'Form', icon: FormInput, description: 'Interactive forms' }
  ];

  const viewportModes = [
    { mode: 'desktop', icon: Monitor, label: 'Desktop' },
    { mode: 'tablet', icon: Tablet, label: 'Tablet' },
    { mode: 'mobile', icon: Smartphone, label: 'Mobile' }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {contentMetadata.title}
            </h1>
            {isDirty && (
              <span className="text-sm text-orange-600 dark:text-orange-400">
                {isAutoSaving ? 'Saving...' : 'Unsaved changes'}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Undo/Redo */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                icon={<Undo className="w-4 h-4" />}
                title="Undo"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                icon={<Redo className="w-4 h-4" />}
                title="Redo"
              />
            </div>

            {/* Viewport Modes */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {viewportModes.map((viewport) => {
                const Icon = viewport.icon;
                return (
                  <button
                    key={viewport.mode}
                    onClick={() => setViewportMode(viewport.mode as any)}
                    className={`p-2 rounded-md transition-colors ${
                      viewportMode === viewport.mode
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title={viewport.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              icon={<Eye className="w-4 h-4" />}
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              loading={isAutoSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Save
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPublish(true)}
              icon={<Share2 className="w-4 h-4" />}
            >
              Publish
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              icon={<Settings className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {!isPreviewMode && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Block Types */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Add Content Block
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {blockTypes.map((blockType) => {
                  const Icon = blockType.icon;
                  return (
                    <button
                      key={blockType.type}
                      onClick={() => handleAddBlock(blockType.type as BlockType)}
                      className="flex flex-col items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      title={blockType.description}
                    >
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {blockType.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Block List */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Content Blocks ({blocks.length})
              </h3>
              <div className="space-y-2">
                {blocks.map((block, index) => {
                  const blockType = blockTypes.find(bt => bt.type === block.type);
                  const Icon = blockType?.icon || Type;
                  
                  return (
                    <div
                      key={block.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedBlockId === block.id
                          ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {blockType?.label || block.type}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Editor/Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isPreviewMode ? (
            <ContentPreview
              blocks={blocks}
              metadata={contentMetadata}
              viewportMode={viewportMode}
            />
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className={`mx-auto transition-all duration-300 ${
                viewportMode === 'mobile' ? 'max-w-sm' :
                viewportMode === 'tablet' ? 'max-w-2xl' :
                'max-w-4xl'
              } p-6`}>
                <AnimatePresence>
                  {blocks.map((block, index) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative group mb-6 ${
                        selectedBlockId === block.id ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
                      }`}
                    >
                      <BlockEditor
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onDelete={() => handleDeleteBlock(block.id)}
                        onMove={(direction) => handleMoveBlock(block.id, direction)}
                        onAddBlock={(type) => handleAddBlock(type, index + 1)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {blocks.length === 0 && (
                  <div className="text-center py-12">
                    <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No content blocks yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Start by adding your first content block from the sidebar.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => handleAddBlock('TEXT')}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add Text Block
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={(template) => {
          setShowTemplates(false);
          // Load template logic here
        }}
      />

      <ContentSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        metadata={contentMetadata}
        onUpdate={setContentMetadata}
      />

      <PublishModal
        isOpen={showPublish}
        onClose={() => setShowPublish(false)}
        content={{ blocks, metadata: contentMetadata }}
        onPublish={(publishData) => {
          setShowPublish(false);
          // Publish logic here
        }}
      />
    </div>
  );
};

export default ContentAuthor;
