import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Calendar,
  BookOpen,
  Award,
  Video,
  Phone,
  ChevronDown,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { CalendarEvent, EventType } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  loading: boolean;
}

const AgendaView: React.FC<AgendaViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  loading
}) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<EventType | 'ALL'>('ALL');

  const groupedEvents = useMemo(() => {
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 30); // Show 30 days before
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 60); // Show 60 days after

    const filtered = events.filter(event => {
      const eventDate = new Date(event.startTime);
      const matchesDate = eventDate >= startDate && eventDate <= endDate;
      const matchesSearch = !searchTerm || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || event.eventType === filterType;
      
      return matchesDate && matchesSearch && matchesType;
    });

    const grouped = filtered.reduce((acc, event) => {
      const eventDate = new Date(event.startTime);
      const dateKey = eventDate.toDateString();
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: eventDate,
          events: []
        };
      }
      
      acc[dateKey].events.push(event);
      return acc;
    }, {} as Record<string, { date: Date; events: CalendarEvent[] }>);

    // Sort events within each day
    Object.values(grouped).forEach(day => {
      day.events.sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
    });

    return Object.values(grouped).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, currentDate, searchTerm, filterType]);

  const toggleDayExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDays(newExpanded);
  };

  const getEventIcon = (eventType: EventType) => {
    switch (eventType) {
      case 'ASSIGNMENT':
        return BookOpen;
      case 'QUIZ':
      case 'EXAM':
        return Award;
      case 'LESSON':
      case 'LECTURE':
        return Calendar;
      case 'MEETING':
      case 'OFFICE_HOURS':
        return Users;
      case 'DEADLINE':
        return AlertTriangle;
      default:
        return Calendar;
    }
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.isCancelled) {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600';
    }

    switch (event.eventType) {
      case 'ASSIGNMENT':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'QUIZ':
      case 'EXAM':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'LESSON':
      case 'LECTURE':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'MEETING':
      case 'OFFICE_HOURS':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'DEADLINE':
        return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'PERSONAL':
        return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) return 'All day';
    
    const startTime = new Date(event.startTime);
    const endTime = event.endTime ? new Date(event.endTime) : null;
    
    const timeFormat: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    if (endTime) {
      return `${startTime.toLocaleTimeString('en-US', timeFormat)} - ${endTime.toLocaleTimeString('en-US', timeFormat)}`;
    }
    
    return startTime.toLocaleTimeString('en-US', timeFormat);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const eventTypes = [
    { value: 'ALL', label: 'All Events' },
    { value: 'ASSIGNMENT', label: 'Assignments' },
    { value: 'QUIZ', label: 'Quizzes' },
    { value: 'EXAM', label: 'Exams' },
    { value: 'LESSON', label: 'Lessons' },
    { value: 'LECTURE', label: 'Lectures' },
    { value: 'MEETING', label: 'Meetings' },
    { value: 'DEADLINE', label: 'Deadlines' },
    { value: 'PERSONAL', label: 'Personal' }
  ];

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="flex space-x-4 mb-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as EventType | 'ALL')}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
        >
          {eventTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <AnimatePresence>
          {groupedEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No events found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterType !== 'ALL' 
                  ? 'Try adjusting your search or filters.'
                  : 'No events scheduled in the selected time range.'
                }
              </p>
            </motion.div>
          ) : (
            groupedEvents.map((day, dayIndex) => {
              const dateKey = day.date.toDateString();
              const isExpanded = expandedDays.has(dateKey);
              const dayIsToday = isToday(day.date);
              const dayIsPast = isPast(day.date);
              
              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                  className={`border rounded-lg overflow-hidden ${
                    dayIsToday 
                      ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Day Header */}
                  <button
                    onClick={() => toggleDayExpansion(dateKey)}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      dayIsToday ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                        
                        <div>
                          <h3 className={`font-semibold ${
                            dayIsToday 
                              ? 'text-primary-900 dark:text-primary-100'
                              : dayIsPast
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {day.date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          {dayIsToday && (
                            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                              Today
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          dayIsToday 
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {day.events.length} event{day.events.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Events */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="p-4 space-y-3">
                          {day.events.map((event, eventIndex) => {
                            const Icon = getEventIcon(event.eventType);
                            
                            return (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: eventIndex * 0.05 }}
                                className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getEventColor(event)}`}
                                onClick={() => onEventClick(event)}
                              >
                                <div className="flex items-start space-x-3">
                                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold truncate">
                                          {event.title}
                                        </h4>
                                        
                                        <div className="flex items-center space-x-4 mt-1 text-sm opacity-75">
                                          <div className="flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatEventTime(event)}</span>
                                          </div>
                                          
                                          {event.location && (
                                            <div className="flex items-center space-x-1">
                                              <MapPin className="w-3 h-3" />
                                              <span className="truncate">{event.location}</span>
                                            </div>
                                          )}
                                          
                                          {event.attendees.length > 0 && (
                                            <div className="flex items-center space-x-1">
                                              <Users className="w-3 h-3" />
                                              <span>{event.attendees.length} attendees</span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {event.description && (
                                          <p className="text-sm opacity-75 mt-2 line-clamp-2">
                                            {event.description}
                                          </p>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center space-x-2 ml-4">
                                        {event.meetingUrl && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.open(event.meetingUrl, '_blank');
                                            }}
                                            icon={<Video className="w-4 h-4" />}
                                            title="Join meeting"
                                          />
                                        )}
                                        
                                        {event.priority === 'URGENT' && (
                                          <div className="w-2 h-2 bg-red-500 rounded-full" title="Urgent" />
                                        )}
                                        
                                        {event.isCancelled && (
                                          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                                            Cancelled
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default AgendaView;
