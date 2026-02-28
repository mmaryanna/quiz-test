import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { createQuiz, Question } from '../api/quizzes';

type QuestionType = 'BOOLEAN' | 'INPUT' | 'CHECKBOX';

interface QuestionForm extends Question {
  id: string;
}

interface OptionForm {
  text: string;
  isCorrect: boolean;
}

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = (type: QuestionType) => {
    const newQuestion: QuestionForm = {
      id: crypto.randomUUID(),
      type,
      questionText: '',
      ...(type === 'BOOLEAN' && { correctAnswer: false }),
      ...(type === 'INPUT' && { correctText: '' }),
      ...(type === 'CHECKBOX' && { options: [{ text: '', isCorrect: false }] }),
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<QuestionForm>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.type === 'CHECKBOX') {
        return {
          ...q,
          options: [...(q.options || []), { text: '', isCorrect: false }],
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.type === 'CHECKBOX') {
        return {
          ...q,
          options: q.options?.filter((_, i) => i !== optionIndex),
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, updates: Partial<OptionForm>) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.type === 'CHECKBOX') {
        return {
          ...q,
          options: q.options?.map((opt, i) => i === optionIndex ? { ...opt, ...updates } : opt),
        };
      }
      return q;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    for (const q of questions) {
      if (!q.questionText.trim()) {
        setError('All questions must have text');
        return;
      }
      if (q.type === 'INPUT' && !q.correctText?.trim()) {
        setError('All input questions must have a correct answer');
        return;
      }
      if (q.type === 'CHECKBOX') {
        if (!q.options || q.options.length < 2) {
          setError('Checkbox questions must have at least 2 options');
          return;
        }
        if (!q.options.some(opt => opt.isCorrect)) {
          setError('Checkbox questions must have at least one correct answer');
          return;
        }
        if (q.options.some(opt => !opt.text.trim())) {
          setError('All options must have text');
          return;
        }
      }
    }

    setLoading(true);
    try {
      const questionsData = questions.map(({ id, ...q }) => q);
      await createQuiz({ title, description, questions: questionsData });
      navigate('/quizzes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/quizzes')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Quizzes
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="text-gray-600 mt-2">Build your custom quiz with various question types</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Enter quiz description"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addQuestion('BOOLEAN')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  + True/False
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('INPUT')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  + Text Input
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('CHECKBOX')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  + Multiple Choice
                </button>
              </div>
            </div>

            {questions.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                <p className="text-gray-500">No questions yet. Click a button above to add your first question.</p>
              </div>
            )}

            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                      {index + 1}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      question.type === 'BOOLEAN' ? 'bg-green-100 text-green-700' :
                      question.type === 'INPUT' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {question.type === 'BOOLEAN' ? 'True/False' :
                       question.type === 'INPUT' ? 'Text Input' : 'Multiple Choice'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your question"
                    />
                  </div>

                  {question.type === 'BOOLEAN' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={question.correctAnswer === true}
                            onChange={() => updateQuestion(question.id, { correctAnswer: true })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-700">True</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={question.correctAnswer === false}
                            onChange={() => updateQuestion(question.id, { correctAnswer: false })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-700">False</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {question.type === 'INPUT' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <input
                        type="text"
                        value={question.correctText || ''}
                        onChange={(e) => updateQuestion(question.id, { correctText: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter the correct answer"
                      />
                    </div>
                  )}

                  {question.type === 'CHECKBOX' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Options * (check correct answers)
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(question.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Option
                        </button>
                      </div>
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => updateOption(question.id, optIndex, { isCorrect: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(question.id, optIndex, { text: e.target.value })}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            {question.options && question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(question.id, optIndex)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Quiz...' : 'Create Quiz'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/quizzes')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
