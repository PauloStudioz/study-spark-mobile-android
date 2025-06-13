
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Search, Tag, X, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuickNotes = () => {
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    subject: '',
    tags: ''
  });

  const subjects = ['Math', 'Science', 'History', 'Language', 'Art', 'Other'];

  useEffect(() => {
    const savedNotes = localStorage.getItem('studymate-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('studymate-notes', JSON.stringify(updatedNotes));
  };

  const addNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      subject: newNote.subject || 'Other',
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    saveNotes([...notes, note]);
    setNewNote({ title: '', content: '', subject: '', tags: '' });
    setShowAddNote(false);
  };

  const updateNote = () => {
    if (!editingNote || !newNote.title.trim() || !newNote.content.trim()) return;

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? {
            ...note,
            title: newNote.title,
            content: newNote.content,
            subject: newNote.subject || 'Other',
            tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            updatedAt: new Date()
          }
        : note
    );

    saveNotes(updatedNotes);
    setEditingNote(null);
    setNewNote({ title: '', content: '', subject: '', tags: '' });
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(note => note.id !== id));
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      subject: note.subject,
      tags: note.tags.join(', ')
    });
    setShowAddNote(true);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`bg-gradient-to-br ${colors.cardGradient} border-0 shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className={`flex items-center justify-center text-2xl text-${colors.textColor}`}>
              <StickyNote className="mr-2" size={24} />
              Quick Notes
            </CardTitle>
            <p className={`text-${colors.textColor} mt-2 opacity-80`}>
              Capture your thoughts instantly
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notes..."
                  className="pl-10 rounded-xl"
                />
              </div>
              <Button
                onClick={() => setShowAddNote(true)}
                className={`bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl`}
              >
                <Plus size={16} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedSubject('')}
                variant={selectedSubject === '' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                All
              </Button>
              {subjects.map(subject => (
                <Button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  variant={selectedSubject === subject ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                >
                  {subject}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showAddNote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {editingNote ? 'Edit Note' : 'Add New Note'}
                </CardTitle>
                <Button
                  onClick={() => {
                    setShowAddNote(false);
                    setEditingNote(null);
                    setNewNote({ title: '', content: '', subject: '', tags: '' });
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X size={16} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Note title..."
                  className="rounded-xl"
                />
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note here..."
                  className="w-full h-32 p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex space-x-2">
                  <select
                    value={newNote.subject}
                    onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                    className="flex-1 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <Input
                    value={newNote.tags}
                    onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                    placeholder="Tags (comma separated)"
                    className="flex-1 rounded-xl"
                  />
                </div>
                <Button
                  onClick={editingNote ? updateNote : addNote}
                  className={`w-full bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl`}
                >
                  {editingNote ? 'Update Note' : 'Add Note'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {filteredNotes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{note.title}</h3>
                  <div className="flex space-x-1">
                    <Button
                      onClick={() => startEdit(note)}
                      variant="ghost"
                      size="sm"
                      className="p-1"
                    >
                      <Edit3 size={14} />
                    </Button>
                    <Button
                      onClick={() => deleteNote(note.id)}
                      variant="ghost"
                      size="sm"
                      className="p-1 text-red-500"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{note.content}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {note.subject}
                    </Badge>
                    {note.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag size={10} className="mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {note.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <StickyNote size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {searchTerm || selectedSubject ? 'No notes found' : 'Start taking notes!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickNotes;
