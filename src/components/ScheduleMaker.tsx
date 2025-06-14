
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, Clock, BookOpen, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

interface ScheduleEvent {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  day: string;
  type: 'study' | 'assignment' | 'exam' | 'break';
  color: string;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const ScheduleMaker = () => {
  const { getThemeColors, isDarkMode } = useTheme();
  const colors = getThemeColors();
  
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [newEvent, setNewEvent] = useState({
    title: '',
    subject: '',
    startTime: '09:00',
    endTime: '10:00',
    day: 'Monday',
    type: 'study' as const
  });

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = () => {
    const saved = localStorage.getItem('studymate-schedule');
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  };

  const saveSchedule = (updatedEvents: ScheduleEvent[]) => {
    localStorage.setItem('studymate-schedule', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'study': return 'bg-blue-500';
      case 'assignment': return 'bg-orange-500';
      case 'exam': return 'bg-red-500';
      case 'break': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const createEvent = () => {
    if (!newEvent.title.trim() || !newEvent.subject.trim()) return;
    
    const event: ScheduleEvent = {
      id: Date.now().toString(),
      ...newEvent,
      color: getTypeColor(newEvent.type)
    };
    
    const updated = [...events, event];
    saveSchedule(updated);
    
    setNewEvent({
      title: '',
      subject: '',
      startTime: '09:00',
      endTime: '10:00',
      day: 'Monday',
      type: 'study'
    });
    setShowCreateEvent(false);
  };

  const deleteEvent = (eventId: string) => {
    const updated = events.filter(e => e.id !== eventId);
    saveSchedule(updated);
  };

  const getEventsForDay = (day: string) => {
    return events
      .filter(event => event.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`bg-gradient-to-br ${colors.cardGradient} border-0 shadow-lg ${isDarkMode ? 'bg-opacity-90' : ''}`}>
          <CardHeader className="text-center">
            <CardTitle className={`flex items-center justify-center text-2xl ${isDarkMode ? 'text-white' : `text-${colors.textColor}`}`}>
              <CalendarDays className="mr-2" size={24} />
              Weekly Schedule
            </CardTitle>
            <p className={`mt-2 opacity-80 ${isDarkMode ? 'text-gray-300' : `text-${colors.textColor}`}`}>
              Plan your study sessions and activities
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowCreateEvent(true)}
                className={`bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl`}
              >
                <Plus size={16} className="mr-2" />
                Add Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showCreateEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${colors.cardGradient} rounded-2xl p-6 shadow-lg border-0 ${isDarkMode ? 'bg-opacity-90' : ''}`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : `text-${colors.textColor}`}`}>Add New Event</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Event title..."
                className="rounded-xl"
              />
              <Input
                value={newEvent.subject}
                onChange={(e) => setNewEvent({...newEvent, subject: e.target.value})}
                placeholder="Subject..."
                className="rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={newEvent.day}
                onChange={(e) => setNewEvent({...newEvent, day: e.target.value})}
                className={`rounded-xl p-2 border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              
              <select
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                className={`rounded-xl p-2 border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{formatTime(time)}</option>
                ))}
              </select>
              
              <select
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                className={`rounded-xl p-2 border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{formatTime(time)}</option>
                ))}
              </select>
              
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                className={`rounded-xl p-2 border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="study">Study</option>
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="break">Break</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={createEvent}
                disabled={!newEvent.title.trim() || !newEvent.subject.trim()}
                className={`flex-1 bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl`}
              >
                Add Event
              </Button>
              <Button
                onClick={() => setShowCreateEvent(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Day Selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {daysOfWeek.map(day => (
          <Button
            key={day}
            onClick={() => setSelectedDay(day)}
            variant={selectedDay === day ? "default" : "outline"}
            className={`rounded-xl min-w-fit ${
              selectedDay === day 
                ? `bg-gradient-to-r ${colors.headerGradient}` 
                : ''
            }`}
          >
            {day.slice(0, 3)}
          </Button>
        ))}
      </div>

      {/* Events for Selected Day */}
      <Card className={`shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <CalendarDays className="mr-2" size={20} />
            {selectedDay}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getEventsForDay(selectedDay).length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No events scheduled for {selectedDay}
                </p>
              </div>
            ) : (
              getEventsForDay(selectedDay).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-l-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                  style={{ borderLeftColor: event.color }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {event.title}
                        </h3>
                        <Badge 
                          className={`text-white ${event.color}`}
                          style={{ backgroundColor: event.color }}
                        >
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Clock size={14} className="mr-1" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </span>
                        <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <BookOpen size={14} className="mr-1" />
                          {event.subject}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteEvent(event.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleMaker;
