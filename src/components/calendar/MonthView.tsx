import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BookOpen,
  Award,
  MessageSquare
} from 'lucide-react';
import { CalendarEvent, EventType } from '../../types';
import Card from '../ui/Card';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  loading: boolean;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  loading
}) => {
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday
      });
    }

    // Add empty cells for days after the last day of the month
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
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
      return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
    }

    if (event.color) {
      return event.color;
    }

    switch (event.eventType) {
      case 'ASSIGNMENT':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'QUIZ':
      case 'EXAM':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'LESSON':
      case 'LECTURE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'MEETING':
      case 'OFFICE_HOURS':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'DEADLINE':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'HOLIDAY':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300';
      case 'PERSONAL':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-4 border-red-500';
      case 'HIGH':
        return 'border-l-4 border-orange-500';
      case 'MEDIUM':
        return 'border-l-4 border-yellow-500';
      case 'LOW':
        return 'border-l-4 border-green-500';
      default:
        return '';
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) {
      return 'All day';
    }

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

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          {/* Header */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="bg-white dark:bg-gray-800 p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {[...Array(42)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 h-32 p-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gray-50 dark:bg-gray-800 p-4 text-center font-medium text-gray-700 dark:text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`bg-white dark:bg-gray-800 min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !day.isCurrentMonth ? 'opacity-50' : ''
              }`}
              onClick={() => onDateClick(day.date)}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    day.isToday
                      ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                      : day.isCurrentMonth
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {day.date.getDate()}
                </span>
                
                {hasEvents && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => {
                  const Icon = getEventIcon(event.eventType);
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: eventIndex * 0.05 }}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)} ${getPriorityIndicator(event.priority)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      title={`${event.title}\n${formatEventTime(event)}${event.location ? `\n${event.location}` : ''}`}
                    >
                      <div className="flex items-center space-x-1">
                        <Icon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate font-medium">
                          {event.title}
                        </span>
                      </div>
                      
                      {!event.isAllDay && (
                        <div className="flex items-center space-x-1 mt-0.5 opacity-75">
                          <Clock className="w-2 h-2" />
                          <span className="truncate">
                            {new Date(event.startTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 p-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

export default MonthView;
