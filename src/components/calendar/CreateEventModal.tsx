import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Bell,
  Repeat,
  Video,
  Paperclip,
  Hash,
  AlertTriangle,
  BookOpen,
  Award,
  MessageSquare
} from 'lucide-react';
import { CalendarEvent, EventType, EventPriority, RecurrencePattern } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Partial<CalendarEvent>) => void;
  courseId?: string;
  initialDate?: Date;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  courseId,
  initialDate
}) => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'MEETING' as EventType,
    startTime: '',
    endTime: '',
    isAllDay: false,
    location: '',
    meetingUrl: '',
    attendees: [] as string[],
    reminderMinutes: 15,
    isRecurring: false,
    recurrencePattern: null as RecurrencePattern | null,
    priority: 'MEDIUM' as EventPriority,
    tags: [] as string[],
    tagInput: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && initialDate) {
      const startTime = new Date(initialDate);
      startTime.setMinutes(0, 0, 0); // Round to nearest hour
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      setFormData(prev => ({
        ...prev,
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16)
      }));
    }
  }, [isOpen, initialDate]);

  const eventTypes = [
    { type: 'ASSIGNMENT', label: 'Assignment', icon: BookOpen, description: 'Course assignment or homework' },
    { type: 'QUIZ', label: 'Quiz', icon: Award, description: 'Quiz or test' },
    { type: 'EXAM', label: 'Exam', icon: Award, description: 'Major examination' },
    { type: 'LESSON', label: 'Lesson', icon: Calendar, description: 'Regular class lesson' },
    { type: 'LECTURE', label: 'Lecture', icon: Calendar, description: 'Lecture or presentation' },
    { type: 'MEETING', label: 'Meeting', icon: Users, description: 'Meeting or discussion' },
    { type: 'OFFICE_HOURS', label: 'Office Hours', icon: Users, description: 'Instructor office hours' },
    { type: 'DEADLINE', label: 'Deadline', icon: AlertTriangle, description: 'Important deadline' },
    { type: 'STUDY_SESSION', label: 'Study Session', icon: BookOpen, description: 'Study or review session' },
    { type: 'PERSONAL', label: 'Personal', icon: Calendar, description: 'Personal event' }
  ];

  const reminderOptions = [
    { value: 0, label: 'No reminder' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' },
    { value: 10080, label: '1 week before' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.isAllDay && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.meetingUrl && !isValidUrl(formData.meetingUrl)) {
      newErrors.meetingUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const eventData: Partial<CalendarEvent> = {
        title: formData.title,
        description: formData.description || undefined,
        eventType: formData.eventType,
        startTime: formData.startTime,
        endTime: formData.isAllDay ? undefined : formData.endTime || undefined,
        isAllDay: formData.isAllDay,
        location: formData.location || undefined,
        meetingUrl: formData.meetingUrl || undefined,
        attendees: formData.attendees,
        reminderMinutes: formData.reminderMinutes,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.recurrencePattern,
        priority: formData.priority,
        tags: formData.tags,
        visibility: courseId ? 'COURSE' : 'PRIVATE'
      };

      await onSubmit(eventData);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      eventType: 'MEETING',
      startTime: '',
      endTime: '',
      isAllDay: false,
      location: '',
      meetingUrl: '',
      attendees: [],
      reminderMinutes: 15,
      isRecurring: false,
      recurrencePattern: null,
      priority: 'MEDIUM',
      tags: [],
      tagInput: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleAddTag = () => {
    const tag = formData.tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Event
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <Input
                label="Event Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title..."
                error={errors.title}
                required
              />

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Event Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {eventTypes.slice(0, 6).map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.eventType === type.type;
                    
                    return (
                      <label
                        key={type.type}
                        className={`relative flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="eventType"
                          value={type.type}
                          checked={isSelected}
                          onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as EventType }))}
                          className="sr-only"
                        />
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {type.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {type.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                  />
                  {errors.startTime && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    disabled={formData.isAllDay}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  />
                  {errors.endTime && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.endTime}</p>
                  )}
                </div>
              </div>

              {/* All Day Toggle */}
              <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    All Day Event
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    This event lasts the entire day
                  </div>
                </div>
              </label>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add event description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Location and Meeting URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Location (Optional)"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location..."
                  icon={<MapPin className="w-4 h-4" />}
                />

                <Input
                  label="Meeting URL (Optional)"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                  placeholder="https://..."
                  icon={<Video className="w-4 h-4" />}
                  error={errors.meetingUrl}
                />
              </div>

              {/* Priority and Reminder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as EventPriority }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reminder
                  </label>
                  <select
                    value={formData.reminderMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderMinutes: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    {reminderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (Optional)
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.tagInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!formData.tagInput.trim() || formData.tags.length >= 5}
                  >
                    Add
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-primary-500 hover:text-primary-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="flex-1"
                >
                  Create Event
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateEventModal;
