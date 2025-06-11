
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, FileText, Upload, Play, RotateCcw, CheckCircle, XCircle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { generateQuizFromText } from '../utils/geminiApi';

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
  const [inputText, setInputText] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const generateQuizWithGemini = async (text: string, title: string) => {
    if (!geminiApiKey.trim()) {
      setShowApiKeyInput(true);
      return;
    }

    setGeneratingQuiz(true);
    
    try {
      const newQuiz = await generateQuizFromText(text, title, geminiApiKey);
      
      const updatedQuizzes = [...quizzes, newQuiz];
      setQuizzes(updatedQuizzes);
      localStorage.setItem('studymate-quizzes', JSON.stringify(updatedQuizzes));
      localStorage.setItem('gemini-api-key', geminiApiKey);
      
      setInputText('');
      setQuizTitle('');
      setShowApiKeyInput(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      // Fallback to simple generation if API fails
      await generateSimpleQuiz(text, title);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const generateSimpleQuiz = async (text: string, title: string) => {
    // Fallback simple quiz generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const questions: Question[] = [];
    
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      const sentence = sentences[i].trim();
      if (sentence.length > 20) {
        const words = sentence.split(' ').filter(w => w.length > 4);
        if (words.length > 0) {
          const keyWord = words[Math.floor(Math.random() * words.length)];
          const questionText = sentence.replace(keyWord, '______');
          
          const options = [
            keyWord,
            generateRandomWord(),
            generateRandomWord(),
            generateRandomWord()
          ].sort(() => Math.random() - 0.5);
          
          questions.push({
            id: `q_${i}`,
            question: `Fill in the blank: ${questionText}`,
            options,
            correctAnswer: options.indexOf(keyWord),
            explanation: `The correct answer is "${keyWord}" based on the context.`
          });
        }
      }
    }
    
    if (questions.length === 0) {
      questions.push({
        id: 'q_1',
        question: 'Based on the provided text, what is the main topic?',
        options: ['Education', 'Technology', 'Science', 'History'],
        correctAnswer: 0,
        explanation: 'This is inferred from the context of the text.'
      });
    }
    
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: title || 'Generated Quiz',
      questions,
      createdAt: new Date()
    };
    
    const updatedQuizzes = [...quizzes, newQuiz];
    setQuizzes(updatedQuizzes);
    localStorage.setItem('studymate-quizzes', JSON.stringify(updatedQuizzes));
  };

  const generateRandomWord = () => {
    const words = ['concept', 'theory', 'method', 'process', 'system', 'structure', 'element', 'factor', 'principle', 'approach'];
    return words[Math.floor(Math.random() * words.length)];
  };

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizMode(true);
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
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
  };

  const calculateScore = () => {
    if (!currentQuiz) return 0;
    const correct = selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === currentQuiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);
    return Math.round((correct / currentQuiz.questions.length) * 100);
  };

  React.useEffect(() => {
    const savedQuizzes = localStorage.getItem('studymate-quizzes');
    if (savedQuizzes) {
      setQuizzes(JSON.parse(savedQuizzes));
    }
    
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
    }
  }, []);

  if (quizMode && currentQuiz) {
    if (showResults) {
      const score = calculateScore();
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="mb-6">
                  {score >= 70 ? (
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                  ) : (
                    <XCircle size={64} className="mx-auto text-red-500 mb-4" />
                  )}
                  <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                  <p className="text-xl text-gray-600">Your Score: {score}%</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  {currentQuiz.questions.map((question, index) => (
                    <div key={question.id} className="text-left bg-white rounded-lg p-4">
                      <p className="font-medium mb-2">Q{index + 1}: {question.question}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          selectedAnswers[index] === question.correctAnswer 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          Your answer: {question.options[selectedAnswers[index]] || 'Not answered'}
                        </span>
                        {selectedAnswers[index] !== question.correctAnswer && (
                          <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-700">
                            Correct: {question.options[question.correctAnswer]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4 justify-center">
                  <Button
                    onClick={restartQuiz}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => setQuizMode(false)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Back to Quizzes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setQuizMode(false)}
            variant="outline"
            className="rounded-xl"
          >
            Back to Quizzes
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            {currentQuestionIndex + 1} / {currentQuiz.questions.length}
          </Badge>
        </div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'bg-purple-200 border-2 border-purple-400'
                        : 'bg-white hover:bg-purple-50 border-2 border-gray-200'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium mr-4">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <Button
                  onClick={nextQuestion}
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                  className="bg-purple-600 hover:bg-purple-700 rounded-xl px-8"
                >
                  {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
              <Brain className="mr-2" size={24} />
              AI Quiz Maker
            </CardTitle>
            <p className="text-purple-600 mt-2">Generate quizzes from your study material using Gemini AI</p>
          </CardHeader>
        </Card>
      </motion.div>

      {showApiKeyInput && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Key size={20} className="text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-orange-800">Gemini API Key Required</h3>
            </div>
            <p className="text-orange-700 mb-4 text-sm">
              To use AI-powered quiz generation, please enter your Gemini API key. You can get one for free from Google AI Studio.
            </p>
            <div className="flex space-x-3">
              <Input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="rounded-xl"
              />
              <Button
                onClick={() => {
                  if (geminiApiKey.trim()) {
                    generateQuizWithGemini(inputText, quizTitle);
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 rounded-xl"
              >
                Save & Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Quiz from Text</h3>
          <div className="space-y-4">
            <Input
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Quiz title (optional)..."
              className="rounded-xl"
            />
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your lesson content, notes, or study material here. The AI will generate quiz questions based on this content..."
              className="rounded-xl min-h-32"
              rows={6}
            />
            <Button
              onClick={() => generateQuizWithGemini(inputText, quizTitle)}
              disabled={!inputText.trim() || generatingQuiz}
              className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl"
            >
              {generatingQuiz ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Generating AI Quiz...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Generate AI Quiz
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Quizzes</h3>
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <Brain size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No quizzes created yet</p>
            <p className="text-sm text-gray-500">Add some study material above to generate your first quiz</p>
          </div>
        ) : (
          quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {quiz.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{quiz.questions.length} questions</span>
                        <span>Created {quiz.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => startQuiz(quiz)}
                      className="bg-green-600 hover:bg-green-700 rounded-xl"
                    >
                      <Play size={16} className="mr-2" />
                      Start Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizMaker;
