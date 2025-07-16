import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Settings,
  Download,
  Upload,
  Bell,
  Grid3X3,
  List,
  Clock,
  MapPin
} from 'lucide-react';
import { CalendarEvent, CalendarViewType, CalendarFilters } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import AgendaView from './AgendaView';
import CreateEventModal from './CreateEventModal';
import EventDetailsModal from './EventDetailsModal';
import CalendarFiltersModal from './CalendarFiltersModal';
import CalendarSettingsModal from './CalendarSettingsModal';

interface CalendarProps {
  courseId?: string;
}

const Calendar: React.FC<CalendarProps> = ({ courseId }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('MONTH');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [filters, setFilters] = useState<CalendarFilters>({
    eventTypes: [],
    courseIds: courseId ? [courseId] : [],
    priorities: [],
    showCompleted: true,
    showCancelled: false
  });

  useEffect(() => {
    loadEvents();
  }, [currentDate, courseId]);

  useEffect(() => {
    applyFilters();
  }, [events, filters, searchTerm]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
      
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        ...(courseId && { courseId })
      });

      const response = await fetch(`/api/calendar/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      } else {
        throw new Error('Failed to load events');
      }
    } catch (error) {
      addToast('Failed to load calendar events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filters
    if (filters.eventTypes.length > 0) {
      filtered = filtered.filter(event => filters.eventTypes.includes(event.eventType));
    }

    // Apply course filters
    if (filters.courseIds.length > 0) {
      filtered = filtered.filter(event => 
        !event.courseId || filters.courseIds.includes(event.courseId)
      );
    }

    // Apply priority filters
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(event => filters.priorities.includes(event.priority));
    }

    // Apply completion filter
    if (!filters.showCompleted) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate >= new Date();
      });
    }

    // Apply cancellation filter
    if (!filters.showCancelled) {
      filtered = filtered.filter(event => !event.isCancelled);
    }

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...eventData,
          ...(courseId && { courseId })
        })
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => [...prev, newEvent]);
        setShowCreateModal(false);
        addToast('Event created successfully', 'success');
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      addToast('Failed to create event', 'error');
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewType) {
      case 'MONTH':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'WEEK':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'DAY':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (viewType) {
      case 'MONTH':
        options.year = 'numeric';
        options.month = 'long';
        break;
      case 'WEEK':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${weekStart.getFullYear()}`;
        }
      case 'DAY':
        options.weekday = 'long';
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
      default:
        options.year = 'numeric';
        options.month = 'long';
    }
    
    return currentDate.toLocaleDateString('en-US', options);
  };

  const viewTypes = [
    { type: 'MONTH', label: 'Month', icon: Grid3X3 },
    { type: 'WEEK', label: 'Week', icon: CalendarIcon },
    { type: 'DAY', label: 'Day', icon: Clock },
    { type: 'AGENDA', label: 'Agenda', icon: List }
  ];

  const renderCalendarView = () => {
    const commonProps = {
      currentDate,
      events: filteredEvents,
      onEventClick: handleEventClick,
      onDateClick: (date: Date) => {
        setCurrentDate(date);
        if (viewType !== 'DAY') {
          setViewType('DAY');
        }
      },
      loading
    };

    switch (viewType) {
      case 'MONTH':
        return <MonthView {...commonProps} />;
      case 'WEEK':
        return <WeekView {...commonProps} />;
      case 'DAY':
        return <DayView {...commonProps} />;
      case 'AGENDA':
        return <AgendaView {...commonProps} />;
      default:
        return <MonthView {...commonProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {courseId ? 'Course Calendar' : 'Calendar'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your schedule and important dates
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            icon={<Settings className="w-4 h-4" />}
          >
            Settings
          </Button>
          
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Event
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('prev')}
                icon={<ChevronLeft className="w-4 h-4" />}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="min-w-[80px]"
              >
                Today
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDate('next')}
                icon={<ChevronRight className="w-4 h-4" />}
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDateHeader()}
            </h2>
          </div>

          {/* View Types and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Filters */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              icon={<Filter className="w-4 h-4" />}
            >
              Filters
            </Button>

            {/* View Types */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {viewTypes.map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.type}
                    onClick={() => setViewType(view.type as CalendarViewType)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewType === view.type
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{view.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderCalendarView()}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
        courseId={courseId}
        initialDate={currentDate}
      />

      <EventDetailsModal
        isOpen={showEventDetails}
        onClose={() => setShowEventDetails(false)}
        event={selectedEvent}
        onUpdate={(updatedEvent) => {
          setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
          setSelectedEvent(updatedEvent);
        }}
        onDelete={(eventId) => {
          setEvents(prev => prev.filter(e => e.id !== eventId));
          setShowEventDetails(false);
        }}
      />

      <CalendarFiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <CalendarSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default Calendar;
