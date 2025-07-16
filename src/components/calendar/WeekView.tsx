import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Calendar,
  BookOpen,
  Award
} from 'lucide-react';
import { CalendarEvent, EventType } from '../../types';
import Card from '../ui/Card';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  loading: boolean;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  loading
}) => {
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        hour,
        time: new Date(0, 0, 0, hour).toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true
        })
      });
    }
    return slots;
  }, []);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventPosition = (event: CalendarEvent) => {
    const startTime = new Date(event.startTime);
    const endTime = event.endTime ? new Date(event.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
    
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
    const duration = endHour - startHour;
    
    return {
      top: `${(startHour / 24) * 100}%`,
      height: `${Math.max((duration / 24) * 100, 2)}%` // Minimum 2% height
    };
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.isCancelled) {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600';
    }

    switch (event.eventType) {
      case 'ASSIGNMENT':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'QUIZ':
      case 'EXAM':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'LESSON':
      case 'LECTURE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'MEETING':
      case 'OFFICE_HOURS':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'DEADLINE':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
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

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          {/* Header */}
          <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700 mb-4">
            <div className="bg-white dark:bg-gray-800 p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            {[...Array(7)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Time Grid */}
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700">
        {/* Time column header */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4"></div>
        
        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`bg-gray-50 dark:bg-gray-800 p-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              isToday(day) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
            }`}
            onClick={() => onDateClick(day)}
          >
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div
              className={`text-lg font-semibold mt-1 ${
                isToday(day)
                  ? 'bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="relative">
        <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700">
          {/* Time column */}
          <div className="bg-white dark:bg-gray-800">
            {timeSlots.map((slot) => (
              <div
                key={slot.hour}
                className="h-16 border-b border-gray-200 dark:border-gray-700 p-2 text-xs text-gray-500 dark:text-gray-400"
              >
                {slot.hour % 2 === 0 && slot.time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div key={dayIndex} className="bg-white dark:bg-gray-800 relative">
                {/* Time slots */}
                {timeSlots.map((slot) => (
                  <div
                    key={slot.hour}
                    className="h-16 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => {
                      const clickedDate = new Date(day);
                      clickedDate.setHours(slot.hour);
                      onDateClick(clickedDate);
                    }}
                  />
                ))}

                {/* Events */}
                <div className="absolute inset-0 pointer-events-none">
                  {dayEvents.map((event, eventIndex) => {
                    if (event.isAllDay) return null; // All-day events handled separately
                    
                    const position = getEventPosition(event);
                    const Icon = getEventIcon(event.eventType);
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: eventIndex * 0.05 }}
                        className={`absolute left-1 right-1 rounded border-l-4 p-1 cursor-pointer pointer-events-auto hover:shadow-md transition-shadow ${getEventColor(event)}`}
                        style={{
                          top: position.top,
                          height: position.height,
                          zIndex: 10 + eventIndex
                        }}
                        onClick={() => onEventClick(event)}
                        title={`${event.title}\n${formatEventTime(event)}${event.location ? `\n${event.location}` : ''}`}
                      >
                        <div className="flex items-start space-x-1 h-full">
                          <Icon className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-xs font-medium truncate">
                              {event.title}
                            </div>
                            <div className="text-xs opacity-75 truncate">
                              {formatEventTime(event)}
                            </div>
                            {event.location && (
                              <div className="flex items-center space-x-1 text-xs opacity-75">
                                <MapPin className="w-2 h-2" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* All-day events */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-8 gap-px">
            <div className="p-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
              All day
            </div>
            {weekDays.map((day, dayIndex) => {
              const allDayEvents = getEventsForDay(day).filter(event => event.isAllDay);
              
              return (
                <div key={dayIndex} className="p-1 min-h-[40px]">
                  {allDayEvents.map((event, eventIndex) => {
                    const Icon = getEventIcon(event.eventType);
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: eventIndex * 0.05 }}
                        className={`text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
                        onClick={() => onEventClick(event)}
                        title={event.title}
                      >
                        <div className="flex items-center space-x-1">
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate font-medium">
                            {event.title}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current time indicator */}
        {(() => {
          const now = new Date();
          const currentWeekDay = weekDays.find(day => day.toDateString() === now.toDateString());
          
          if (currentWeekDay) {
            const dayIndex = weekDays.indexOf(currentWeekDay);
            const currentHour = now.getHours() + now.getMinutes() / 60;
            const topPosition = (currentHour / 24) * 100;
            
            return (
              <div
                className="absolute left-0 right-0 pointer-events-none z-20"
                style={{ top: `${topPosition}%` }}
              >
                <div className="flex items-center">
                  <div className="w-16 bg-red-500 h-0.5"></div>
                  <div className="flex-1 grid grid-cols-7 gap-px">
                    {weekDays.map((_, index) => (
                      <div
                        key={index}
                        className={`h-0.5 ${index === dayIndex ? 'bg-red-500' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
                <div
                  className="absolute left-0 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${((dayIndex + 1) / 8) * 100}%` }}
                />
              </div>
            );
          }
          
          return null;
        })()}
      </div>
    </Card>
  );
};

export default WeekView;
