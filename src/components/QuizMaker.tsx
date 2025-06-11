
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Upload, Settings, Trash2, Play, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateQuizFromText, generateFlashcardsFromText } from '@/utils/geminiApi';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: Date;
}

const QuizMaker = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    text: ''
  });

  useEffect(() => {
    loadQuizzes();
    loadApiKey();
  }, []);

  const loadApiKey = () => {
    const savedKey = localStorage.getItem('studymate-gemini-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('studymate-gemini-key', apiKey);
    setShowSettings(false);
  };

  const loadQuizzes = () => {
    const savedQuizzes = localStorage.getItem('studymate-quizzes');
    if (savedQuizzes) {
      const parsed = JSON.parse(savedQuizzes);
      // Convert date strings back to Date objects
      const quizzesWithDates = parsed.map((quiz: any) => ({
        ...quiz,
        createdAt: quiz.createdAt ? new Date(quiz.createdAt) : new Date()
      }));
      setQuizzes(quizzesWithDates);
    }
  };

  const saveQuizzes = (updatedQuizzes: Quiz[]) => {
    localStorage.setItem('studymate-quizzes', JSON.stringify(updatedQuizzes));
  };

  const createQuizFromText = async () => {
    if (!newQuiz.title.trim() || !newQuiz.text.trim()) {
      alert('Please provide both title and text content');
      return;
    }

    if (!apiKey.trim()) {
      alert('Please set your Gemini API key in settings first');
      setShowSettings(true);
      return;
    }

    setIsGenerating(true);
    try {
      const generatedQuiz = await generateQuizFromText(newQuiz.text, newQuiz.title, apiKey);
      
      const updatedQuizzes = [...quizzes, generatedQuiz];
      setQuizzes(updatedQuizzes);
      saveQuizzes(updatedQuizzes);
      
      setNewQuiz({ title: '', text: '' });
      setShowCreateQuiz(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteQuiz = (quizId: string) => {
    const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
    setQuizzes(updatedQuizzes);
    saveQuizzes(updatedQuizzes);
    if (currentQuiz?.id === quizId) {
      setCurrentQuiz(null);
      setStudyMode(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setShowResults(false);
    setStudyMode(true);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(currentQuiz?.questions.length || 0).fill(-1));
    setShowResults(false);
  };

  const calculateScore = () => {
    if (!currentQuiz) return { score: 0, total: 0, percentage: 0 };
    
    const correct = selectedAnswers.reduce((acc, answer, index) => {
      return answer === currentQuiz.questions[index].correctAnswer ? acc + 1 : acc;
    }, 0);
    
    return {
      score: correct,
      total: currentQuiz.questions.length,
      percentage: Math.round((correct / currentQuiz.questions.length) * 100)
    };
  };

  if (studyMode && currentQuiz) {
    if (showResults) {
      const { score, total, percentage } = calculateScore();
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Button
              onClick={() => setStudyMode(false)}
              variant="outline"
              className="mb-4 rounded-xl"
            >
              Back to Quizzes
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-700">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-6xl font-bold text-green-600">{percentage}%</div>
              <p className="text-lg text-gray-700">
                You got {score} out of {total} questions correct
              </p>
              <Progress value={percentage} className="w-full h-4" />
              
              <div className="flex justify-center space-x-4 mt-6">
                <Button
                  onClick={resetQuiz}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  <RotateCcw size={16} className="mr-2" />
                  Retake Quiz
                </Button>
                <Button
                  onClick={() => setStudyMode(false)}
                  variant="outline"
                  className="rounded-xl"
                >
                  Back to Quizzes
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Answers:</h3>
            {currentQuiz.questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <Card key={question.id} className="border-l-4 border-l-gray-300">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="text-green-500 mt-1" size={20} />
                      ) : (
                        <XCircle className="text-red-500 mt-1" size={20} />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">{question.question}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-600">
                            Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {userAnswer >= 0 ? question.options[userAnswer] : 'Not answered'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-gray-600">
                              Correct answer: <span className="text-green-600">
                                {question.options[question.correctAnswer]}
                              </span>
                            </p>
                          )}
                          {question.explanation && (
                            <p className="text-blue-600 mt-2">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setStudyMode(false)}
            variant="outline"
            className="rounded-xl"
          >
            Back to Quizzes
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            {currentQuestionIndex + 1} / {currentQuiz.questions.length}
          </Badge>
        </div>

        <Progress value={progress} className="w-full h-2" />

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestionIndex] === index && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-between">
          <Button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="rounded-xl"
          >
            Previous
          </Button>
          
          <Button
            onClick={nextQuestion}
            disabled={selectedAnswers[currentQuestionIndex] === -1}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-2xl text-indigo-700">
              <FileText className="mr-2" size={24} />
              AI Quiz Maker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-3">
              <Button
                onClick={() => setShowCreateQuiz(true)}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                <Plus size={16} className="mr-2" />
                Create Quiz
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="rounded-xl"
              >
                <Settings size={16} className="mr-2" />
                API Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {!apiKey && (
        <Alert>
          <AlertDescription>
            Please set your Gemini API key in settings to generate AI-powered quizzes.
          </AlertDescription>
        </Alert>
      )}

      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border"
        >
          <h3 className="text-lg font-semibold mb-4">Gemini API Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Gemini API Key
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="rounded-xl"
              />
              <p className="text-sm text-gray-500 mt-1">
                Get your API key from Google AI Studio: https://makersuite.google.com/app/apikey
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={saveApiKey}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Save API Key
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {showCreateQuiz && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border"
        >
          <h3 className="text-lg font-semibold mb-4">Create AI Quiz</h3>
          <div className="space-y-4">
            <Input
              value={newQuiz.title}
              onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
              placeholder="Quiz title..."
              className="rounded-xl"
            />
            
            <Textarea
              value={newQuiz.text}
              onChange={(e) => setNewQuiz({...newQuiz, text: e.target.value})}
              placeholder="Paste your lesson text here for AI quiz generation..."
              className="rounded-xl min-h-32"
              rows={6}
            />
            
            <div className="flex space-x-3">
              <Button
                onClick={createQuizFromText}
                disabled={isGenerating}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                {isGenerating ? 'Generating...' : 'Generate Quiz'}
              </Button>
              <Button
                onClick={() => setShowCreateQuiz(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {quizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{quiz.questions.length} questions</span>
                      <span>
                        Created: {quiz.createdAt instanceof Date ? quiz.createdAt.toLocaleDateString() : 'Date not available'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => startQuiz(quiz)}
                      className="bg-green-600 hover:bg-green-700 rounded-xl"
                    >
                      <Play size={16} className="mr-2" />
                      Start Quiz
                    </Button>
                    <Button
                      onClick={() => deleteQuiz(quiz.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No quizzes yet</p>
          <Button
            onClick={() => setShowCreateQuiz(true)}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            Create Your First Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizMaker;
