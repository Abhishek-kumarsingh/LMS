import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette,
  Highlighter
} from 'lucide-react';
import { ContentBlock } from '../../../types';
import Button from '../../ui/Button';

interface TextBlockEditorProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  isSelected: boolean;
}

const TextBlockEditor: React.FC<TextBlockEditorProps> = ({
  block,
  onUpdate,
  isSelected
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isSelected && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isSelected]);

  const handleContentChange = () => {
    if (!editorRef.current) return;

    const html = editorRef.current.innerHTML;
    const plainText = editorRef.current.textContent || '';
    const wordCount = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

    // Extract links
    const links = Array.from(editorRef.current.querySelectorAll('a')).map((link, index) => ({
      url: link.getAttribute('href') || '',
      text: link.textContent || '',
      isExternal: !link.getAttribute('href')?.startsWith('/'),
      position: index
    }));

    onUpdate({
      content: {
        ...block.content,
        text: {
          html,
          plainText,
          wordCount,
          readingTime,
          links,
          mentions: [] // TODO: Extract mentions
        }
      }
    });
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          handleAddLink();
          break;
      }
    }
  };

  const handleAddLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString();
    if (!selectedText) return;

    const url = prompt('Enter URL:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleAddImage = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const formatButtons = [
    {
      group: 'text',
      buttons: [
        { command: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
        { command: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
        { command: 'underline', icon: Underline, title: 'Underline (Ctrl+U)' },
        { command: 'strikeThrough', icon: Strikethrough, title: 'Strikethrough' }
      ]
    },
    {
      group: 'headings',
      buttons: [
        { command: 'formatBlock', value: 'h1', icon: Heading1, title: 'Heading 1' },
        { command: 'formatBlock', value: 'h2', icon: Heading2, title: 'Heading 2' },
        { command: 'formatBlock', value: 'h3', icon: Heading3, title: 'Heading 3' },
        { command: 'formatBlock', value: 'p', icon: Type, title: 'Paragraph' }
      ]
    },
    {
      group: 'alignment',
      buttons: [
        { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
        { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
        { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
        { command: 'justifyFull', icon: AlignJustify, title: 'Justify' }
      ]
    },
    {
      group: 'lists',
      buttons: [
        { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
        { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List' },
        { command: 'formatBlock', value: 'blockquote', icon: Quote, title: 'Quote' }
      ]
    },
    {
      group: 'insert',
      buttons: [
        { command: 'custom', action: handleAddLink, icon: Link, title: 'Add Link (Ctrl+K)' },
        { command: 'custom', action: handleAddImage, icon: Image, title: 'Add Image' },
        { command: 'formatBlock', value: 'pre', icon: Code, title: 'Code Block' }
      ]
    }
  ];

  const colorOptions = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF0066', '#FF3366', '#FF6699', '#66FF99', '#6699FF', '#9966FF'
  ];

  return (
    <div className="relative">
      {/* Formatting Toolbar */}
      {(isSelected || showToolbar) && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-wrap items-center gap-1">
            {formatButtons.map((group, groupIndex) => (
              <React.Fragment key={group.group}>
                {groupIndex > 0 && (
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                )}
                {group.buttons.map((button) => {
                  const Icon = button.icon;
                  return (
                    <Button
                      key={button.command + (button.value || '')}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (button.action) {
                          button.action();
                        } else {
                          execCommand(button.command, button.value);
                        }
                      }}
                      icon={<Icon className="w-4 h-4" />}
                      title={button.title}
                      className="p-1.5"
                    />
                  );
                })}
              </React.Fragment>
            ))}

            {/* Color Picker */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                icon={<Palette className="w-4 h-4" />}
                title="Text Color"
                className="p-1.5"
              />
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="grid grid-cols-6 gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => execCommand('foreColor', color)}
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Highlight Color */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                icon={<Highlighter className="w-4 h-4" />}
                title="Highlight Color"
                className="p-1.5"
              />
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="grid grid-cols-6 gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => execCommand('hiliteColor', color)}
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[100px] p-4 focus:outline-none prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: block.content.text?.html || '' }}
        onInput={handleContentChange}
        onFocus={() => {
          setIsEditing(true);
          setShowToolbar(true);
        }}
        onBlur={() => {
          setIsEditing(false);
          setShowToolbar(false);
        }}
        onKeyDown={handleKeyDown}
        onMouseUp={() => {
          const selection = window.getSelection();
          setSelectedText(selection?.toString() || '');
        }}
        placeholder="Start typing..."
        style={{
          minHeight: '100px'
        }}
      />

      {/* Word Count */}
      {isSelected && block.content.text && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
          <span>
            {block.content.text.wordCount} words • {block.content.text.readingTime} min read
          </span>
          {block.content.text.links.length > 0 && (
            <span>
              {block.content.text.links.length} link{block.content.text.links.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Placeholder for empty content */}
      {!block.content.text?.html && !isEditing && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 pointer-events-none">
          <div className="text-center">
            <Type className="w-8 h-8 mx-auto mb-2" />
            <p>Click to start writing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextBlockEditor;
