import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Search, Tag, X, Edit3, Trash2, BookOpen, Calendar, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [subjects, setSubjects] = useState(['Math', 'Science', 'History', 'Language', 'Art', 'Other']);
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    subject: '',
    tags: ''
  });

  useEffect(() => {
    const savedNotes = localStorage.getItem('studymate-notes');
    const savedSubjects = localStorage.getItem('studymate-subjects');
    
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    }
    
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('studymate-notes', JSON.stringify(updatedNotes));
  };

  const saveSubjects = (updatedSubjects: string[]) => {
    setSubjects(updatedSubjects);
    localStorage.setItem('studymate-subjects', JSON.stringify(updatedSubjects));
  };

  const addSubject = () => {
    if (!newSubjectName.trim() || subjects.includes(newSubjectName.trim())) return;
    
    const updatedSubjects = [...subjects, newSubjectName.trim()];
    saveSubjects(updatedSubjects);
    setNewSubjectName('');
  };

  const editSubject = (oldName: string, newName: string) => {
    if (!newName.trim() || subjects.includes(newName.trim()) || oldName === newName.trim()) {
      setEditingSubject(null);
      setNewSubjectName('');
      return;
    }

    // Update subject name in subjects array
    const updatedSubjects = subjects.map(subject => 
      subject === oldName ? newName.trim() : subject
    );
    saveSubjects(updatedSubjects);

    // Update all notes that use this subject
    const updatedNotes = notes.map(note => 
      note.subject === oldName ? { ...note, subject: newName.trim() } : note
    );
    saveNotes(updatedNotes);

    // Update selected subject if it was the one being edited
    if (selectedSubject === oldName) {
      setSelectedSubject(newName.trim());
    }

    setEditingSubject(null);
    setNewSubjectName('');
  };

  const deleteSubject = (subjectToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete the "${subjectToDelete}" subject? All notes in this subject will also be deleted.`)) {
      // Remove subject from subjects array
      const updatedSubjects = subjects.filter(subject => subject !== subjectToDelete);
      saveSubjects(updatedSubjects);

      // Remove all notes with this subject
      const updatedNotes = notes.filter(note => note.subject !== subjectToDelete);
      saveNotes(updatedNotes);

      // Clear selected subject if it was deleted
      if (selectedSubject === subjectToDelete) {
        setSelectedSubject('');
      }
    }
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

    saveNotes([note, ...notes]);
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
    setShowAddNote(false);
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(note => note.id !== id));
    if (expandedNote === id) {
      setExpandedNote(null);
    }
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

  const deleteAllSubjectNotes = (subject: string) => {
    if (window.confirm(`Are you sure you want to delete all ${subject} notes?`)) {
      saveNotes(notes.filter(note => note.subject !== subject));
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getSubjectNoteCounts = () => {
    return subjects.map(subject => ({
      subject,
      count: notes.filter(note => note.subject === subject).length
    }));
  };

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
              <BookOpen className="mr-2" size={24} />
              Study Notes
              <Button
                onClick={() => setShowSubjectManager(!showSubjectManager)}
                variant="ghost"
                size="sm"
                className="ml-2 hover:bg-white/20"
                title="Manage subjects"
              >
                <Settings size={16} />
              </Button>
            </CardTitle>
            <p className={`text-${colors.textColor} mt-2 opacity-80`}>
              Organize your notes by subject
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
                className={`bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl px-6`}
              >
                <Plus size={16} className="mr-2" />
                Add Note
              </Button>
            </div>

            <AnimatePresence>
              {showSubjectManager && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/20 p-4 rounded-xl space-y-3"
                >
                  <h3 className={`font-semibold text-${colors.textColor}`}>Manage Subjects</h3>
                  <div className="flex space-x-2">
                    <Input
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="New subject name..."
                      className="flex-1 rounded-xl"
                      onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                    />
                    <Button
                      onClick={addSubject}
                      disabled={!newSubjectName.trim() || subjects.includes(newSubjectName.trim())}
                      className="bg-green-500 hover:bg-green-600 rounded-xl"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {subjects.map(subject => (
                      <div key={subject} className="flex items-center justify-between bg-white/10 p-2 rounded-lg">
                        {editingSubject === subject ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <Input
                              value={newSubjectName}
                              onChange={(e) => setNewSubjectName(e.target.value)}
                              className="flex-1 rounded-lg"
                              onKeyPress={(e) => e.key === 'Enter' && editSubject(subject, newSubjectName)}
                              autoFocus
                            />
                            <Button
                              onClick={() => editSubject(subject, newSubjectName)}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 p-2"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingSubject(null);
                                setNewSubjectName('');
                              }}
                              size="sm"
                              variant="ghost"
                              className="p-2"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className={`text-${colors.textColor} font-medium`}>{subject}</span>
                            <div className="flex space-x-1">
                              <Button
                                onClick={() => {
                                  setEditingSubject(subject);
                                  setNewSubjectName(subject);
                                }}
                                size="sm"
                                variant="ghost"
                                className="p-2 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit3 size={14} />
                              </Button>
                              <Button
                                onClick={() => deleteSubject(subject)}
                                size="sm"
                                variant="ghost"
                                className="p-2 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedSubject('')}
                variant={selectedSubject === '' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                All ({notes.length})
              </Button>
              {getSubjectNoteCounts().map(({ subject, count }) => (
                <div key={subject} className="flex items-center">
                  <Button
                    onClick={() => setSelectedSubject(subject)}
                    variant={selectedSubject === subject ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                  >
                    {subject} ({count})
                  </Button>
                  {count > 0 && selectedSubject === subject && (
                    <Button
                      onClick={() => deleteAllSubjectNotes(subject)}
                      variant="ghost"
                      size="sm"
                      className="ml-1 text-red-500 hover:text-red-700 p-1"
                      title={`Delete all ${subject} notes`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
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
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg border-2 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Edit3 className="mr-2" size={20} />
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </CardTitle>
                <Button
                  onClick={() => {
                    setShowAddNote(false);
                    setEditingNote(null);
                    setNewNote({ title: '', content: '', subject: '', tags: '' });
                  }}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <X size={16} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Note title..."
                  className="rounded-xl text-lg font-semibold"
                />
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note here..."
                  className="min-h-[120px] rounded-xl resize-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex space-x-2">
                  <select
                    value={newNote.subject}
                    onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                    className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className={`w-full bg-gradient-to-r ${colors.headerGradient} hover:opacity-90 rounded-xl py-3 text-lg font-semibold`}
                  disabled={!newNote.title.trim() || !newNote.content.trim()}
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        <AnimatePresence>
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              layout
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-800 cursor-pointer hover:text-blue-600"
                          onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}>
                        {note.title}
                      </h3>
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => startEdit(note)}
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit note"
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          onClick={() => deleteNote(note.id)}
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-red-50 hover:text-red-600"
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedNote === note.id ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-gray-50 p-4 rounded-lg mb-3">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 cursor-pointer"
                           onClick={() => setExpandedNote(note.id)}>
                          {note.content}
                        </p>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                          {note.subject}
                        </Badge>
                        {note.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag size={8} className="mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar size={12} className="mr-1" />
                        {note.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredNotes.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <StickyNote size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || selectedSubject ? 'No notes found matching your criteria' : 'Start taking notes to organize your learning!'}
          </p>
          {!showAddNote && (
            <Button
              onClick={() => setShowAddNote(true)}
              className={`mt-4 bg-gradient-to-r ${colors.headerGradient} hover:opacity-90`}
            >
              <Plus size={16} className="mr-2" />
              Create Your First Note
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default QuickNotes;
