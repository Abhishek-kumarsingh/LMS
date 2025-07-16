import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Calendar,
  BookOpen,
  Award,
  Plus,
  Video,
  Phone
} from 'lucide-react';
import { CalendarEvent, EventType } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  loading: boolean;
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  loading
}) => {
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({
          hour,
          minute,
          time: new Date(0, 0, 0, hour, minute).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          isHourStart: minute === 0
        });
      }
    }
    return slots;
  }, []);

  const dayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === currentDate.toDateString();
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [events, currentDate]);

  const getEventPosition = (event: CalendarEvent) => {
    const startTime = new Date(event.startTime);
    const endTime = event.endTime ? new Date(event.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000);
    
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const duration = endMinutes - startMinutes;
    
    return {
      top: `${(startMinutes / (24 * 60)) * 100}%`,
      height: `${Math.max((duration / (24 * 60)) * 100, 1)}%` // Minimum 1% height
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
      case 'PERSONAL':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700';
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

  const isToday = currentDate.toDateString() === new Date().toDateString();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Calendar View */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                {isToday && (
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    Today
                  </p>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateClick(currentDate)}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Event
              </Button>
            </div>
          </div>

          {/* All-day events */}
          {dayEvents.filter(event => event.isAllDay).length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                All Day
              </h3>
              <div className="space-y-2">
                {dayEvents.filter(event => event.isAllDay).map((event, index) => {
                  const Icon = getEventIcon(event.eventType);
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-sm opacity-75 mt-1">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Grid */}
          <div className="relative">
            <div className="flex">
              {/* Time column */}
              <div className="w-20 bg-gray-50 dark:bg-gray-800">
                {timeSlots.filter(slot => slot.isHourStart).map((slot) => (
                  <div
                    key={`${slot.hour}-${slot.minute}`}
                    className="h-16 border-b border-gray-200 dark:border-gray-700 p-2 text-xs text-gray-500 dark:text-gray-400"
                  >
                    {slot.time}
                  </div>
                ))}
              </div>

              {/* Events column */}
              <div className="flex-1 relative bg-white dark:bg-gray-800">
                {/* Time slots */}
                {timeSlots.filter(slot => slot.isHourStart).map((slot) => (
                  <div
                    key={`${slot.hour}-${slot.minute}`}
                    className="h-16 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => {
                      const clickedDate = new Date(currentDate);
                      clickedDate.setHours(slot.hour, slot.minute);
                      onDateClick(clickedDate);
                    }}
                  />
                ))}

                {/* Events */}
                <div className="absolute inset-0 pointer-events-none">
                  {dayEvents.filter(event => !event.isAllDay).map((event, eventIndex) => {
                    const position = getEventPosition(event);
                    const Icon = getEventIcon(event.eventType);
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: eventIndex * 0.05 }}
                        className={`absolute left-2 right-2 rounded-lg border-l-4 p-3 cursor-pointer pointer-events-auto hover:shadow-lg transition-shadow ${getEventColor(event)}`}
                        style={{
                          top: position.top,
                          height: position.height,
                          zIndex: 10 + eventIndex
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex items-start space-x-2 h-full">
                          <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="font-medium truncate">
                              {event.title}
                            </div>
                            <div className="text-sm opacity-75 truncate">
                              {formatEventTime(event)}
                            </div>
                            {event.location && (
                              <div className="flex items-center space-x-1 text-sm opacity-75 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            {event.attendees.length > 0 && (
                              <div className="flex items-center space-x-1 text-sm opacity-75 mt-1">
                                <Users className="w-3 h-3" />
                                <span>{event.attendees.length} attendees</span>
                              </div>
                            )}
                          </div>
                          
                          {event.meetingUrl && (
                            <div className="flex space-x-1">
                              <Video className="w-4 h-4 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Current time indicator */}
                {isToday && (() => {
                  const now = new Date();
                  const currentMinutes = now.getHours() * 60 + now.getMinutes();
                  const topPosition = (currentMinutes / (24 * 60)) * 100;
                  
                  return (
                    <div
                      className="absolute left-0 right-0 pointer-events-none z-20"
                      style={{ top: `${topPosition}%` }}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="flex-1 h-0.5 bg-red-500"></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Today's Events Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isToday ? "Today's Events" : "Day's Events"}
          </h3>
          
          {dayEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No events scheduled for this day
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event, index) => {
                const Icon = getEventIcon(event.eventType);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {event.title}
                        </div>
                        <div className="text-sm opacity-75">
                          {formatEventTime(event)}
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1 text-sm opacity-75 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.meetingUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(event.meetingUrl, '_blank');
                          }}
                          icon={<Video className="w-4 h-4" />}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onDateClick(currentDate)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Event
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={<Calendar className="w-4 h-4" />}
            >
              View Week
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={<Clock className="w-4 h-4" />}
            >
              Set Reminder
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DayView;
