import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Image,
  Video,
  Music,
  Code,
  Calculator,
  Globe,
  Zap,
  BarChart3,
  FormInput,
  Settings,
  Move,
  Copy,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { ContentBlock, BlockType } from '../../types';
import Button from '../ui/Button';
import TextBlockEditor from './blocks/TextBlockEditor';
import ImageBlockEditor from './blocks/ImageBlockEditor';
import VideoBlockEditor from './blocks/VideoBlockEditor';
import AudioBlockEditor from './blocks/AudioBlockEditor';
import QuizBlockEditor from './blocks/QuizBlockEditor';
import CodeBlockEditor from './blocks/CodeBlockEditor';
import MathBlockEditor from './blocks/MathBlockEditor';
import EmbedBlockEditor from './blocks/EmbedBlockEditor';
import ChartBlockEditor from './blocks/ChartBlockEditor';
import FormBlockEditor from './blocks/FormBlockEditor';
import BlockToolbar from './BlockToolbar';

interface BlockEditorProps {
  block: ContentBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onSelect: () => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  onMove,
  onAddBlock
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'TEXT':
        return Type;
      case 'IMAGE':
        return Image;
      case 'VIDEO':
        return Video;
      case 'AUDIO':
        return Music;
      case 'QUIZ':
        return Zap;
      case 'CODE':
        return Code;
      case 'MATH':
        return Calculator;
      case 'EMBED':
        return Globe;
      case 'CHART':
        return BarChart3;
      case 'FORM':
        return FormInput;
      default:
        return Type;
    }
  };

  const renderBlockEditor = () => {
    const commonProps = {
      block,
      onUpdate,
      isSelected
    };

    switch (block.type) {
      case 'TEXT':
        return <TextBlockEditor {...commonProps} />;
      case 'IMAGE':
        return <ImageBlockEditor {...commonProps} />;
      case 'VIDEO':
        return <VideoBlockEditor {...commonProps} />;
      case 'AUDIO':
        return <AudioBlockEditor {...commonProps} />;
      case 'QUIZ':
        return <QuizBlockEditor {...commonProps} />;
      case 'CODE':
        return <CodeBlockEditor {...commonProps} />;
      case 'MATH':
        return <MathBlockEditor {...commonProps} />;
      case 'EMBED':
        return <EmbedBlockEditor {...commonProps} />;
      case 'CHART':
        return <ChartBlockEditor {...commonProps} />;
      case 'FORM':
        return <FormBlockEditor {...commonProps} />;
      default:
        return (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Unsupported block type: {block.type}
          </div>
        );
    }
  };

  const blockTypes = [
    { type: 'TEXT', label: 'Text', icon: Type },
    { type: 'IMAGE', label: 'Image', icon: Image },
    { type: 'VIDEO', label: 'Video', icon: Video },
    { type: 'AUDIO', label: 'Audio', icon: Music },
    { type: 'QUIZ', label: 'Quiz', icon: Zap },
    { type: 'CODE', label: 'Code', icon: Code },
    { type: 'MATH', label: 'Math', icon: Calculator },
    { type: 'EMBED', label: 'Embed', icon: Globe },
    { type: 'CHART', label: 'Chart', icon: BarChart3 },
    { type: 'FORM', label: 'Form', icon: FormInput }
  ];

  const BlockIcon = getBlockIcon(block.type);

  return (
    <div
      className={`relative group transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
      }`}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => {
        setShowToolbar(false);
        setShowAddMenu(false);
      }}
    >
      {/* Block Toolbar */}
      <AnimatePresence>
        {(showToolbar || isSelected) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-12 left-0 right-0 z-10"
          >
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2">
              {/* Block Info */}
              <div className="flex items-center space-x-2">
                <BlockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {block.type.charAt(0) + block.type.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMove('up')}
                  icon={<ChevronUp className="w-4 h-4" />}
                  title="Move up"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMove('down')}
                  icon={<ChevronDown className="w-4 h-4" />}
                  title="Move down"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Copy block logic
                  }}
                  icon={<Copy className="w-4 h-4" />}
                  title="Duplicate"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onUpdate({
                      settings: {
                        ...block.settings,
                        visible: !block.settings?.visible
                      }
                    });
                  }}
                  icon={block.settings?.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  title={block.settings?.visible !== false ? "Hide" : "Show"}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  icon={<Trash2 className="w-4 h-4" />}
                  title="Delete"
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Block Menu */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
              <div className="grid grid-cols-5 gap-1">
                {blockTypes.map((blockType) => {
                  const Icon = blockType.icon;
                  return (
                    <button
                      key={blockType.type}
                      onClick={() => {
                        onAddBlock(blockType.type as BlockType);
                        setShowAddMenu(false);
                      }}
                      className="flex flex-col items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={blockType.label}
                    >
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {blockType.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Content */}
      <div
        className={`relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 ${
          isSelected ? 'border-primary-300 dark:border-primary-600' : ''
        } ${
          block.settings?.visible === false ? 'opacity-50' : ''
        }`}
        onClick={onSelect}
        style={{
          backgroundColor: block.settings?.backgroundColor !== 'transparent' 
            ? block.settings?.backgroundColor 
            : undefined,
          padding: block.settings?.padding === 'small' ? '0.5rem' :
                   block.settings?.padding === 'large' ? '2rem' : '1rem',
          margin: block.settings?.margin === 'small' ? '0.5rem 0' :
                  block.settings?.margin === 'large' ? '2rem 0' : '1rem 0'
        }}
      >
        {renderBlockEditor()}

        {/* Block Settings Overlay */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <BlockToolbar
              block={block}
              onUpdate={onUpdate}
            />
          </div>
        )}
      </div>

      {/* Add Block Button */}
      <div className="flex justify-center mt-2">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className={`w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-all duration-200 ${
            showAddMenu ? 'rotate-45' : ''
          } ${
            showToolbar || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Add block below"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BlockEditor;
