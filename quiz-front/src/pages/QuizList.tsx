import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import posthog from 'posthog-js';
import { getAllQuizzes, deleteQuiz, QuizListItem } from '../api/quizzes';
import UpdateButton from '../components/UpdateButton';
import DeleteButton from '../components/DeleteButton';

export default function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showRecentFilterButton, setShowRecentFilterButton] = useState(false);
  const [recentOnly, setRecentOnly] = useState(false);

  useEffect(() => {
    loadQuizzes();

    posthog.onFeatureFlags(() => {
      setShowRecentFilterButton(
        !!posthog.isFeatureEnabled('show-recent-quizzes')
      );
    });
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getAllQuizzes();
      setQuizzes(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteQuiz(id);
      setQuizzes(quizzes.filter((q) => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayedQuizzes = useMemo(() => {
    if (!recentOnly) return quizzes;

    return quizzes.filter((quiz) => {
      if (!quiz.createdAt) return false;

      const createdDate = new Date(quiz.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      return diffDays <= 7;
    });
  }, [quizzes, recentOnly]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">All Quizzes</h1>
            <p className="text-gray-600 mt-2">Manage and view all your quizzes</p>
          </div>

          <button
            onClick={() => {
              posthog.capture('open_create_page');
              navigate('/create');
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Create New Quiz
          </button>
        </div>

        {showRecentFilterButton && quizzes.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setRecentOnly((prev) => !prev)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                recentOnly
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              {recentOnly ? 'Show All Quizzes' : 'Show Last 7 Days'}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first quiz</p>

            <button
              onClick={() => {
                posthog.capture('open_create_page');
                navigate('/create');
              }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create Your First Quiz
            </button>
          </div>
        ) : displayedQuizzes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No recent quizzes found
            </h3>
            <p className="text-gray-600 mb-6">
              There are no quizzes created in the last 7 days.
            </p>

            <button
              onClick={() => setRecentOnly(false)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Show All Quizzes
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div
                  onClick={() => navigate(`/quizzes/${quiz.id}`)}
                  className="p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {quiz.title}
                    </h3>
                  </div>

                  {quiz.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {quiz.questionCount}{' '}
                        {quiz.questionCount === 1 ? 'Question' : 'Questions'}
                      </div>
                    </div>

                    {quiz.createdAt && (
                      <span className="text-xs text-gray-500">
                        {formatDate(quiz.createdAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-4 flex gap-3">
                  <UpdateButton quizId={quiz.id} />
                  <DeleteButton
                    quizId={quiz.id}
                    quizTitle={quiz.title}
                    deletingId={deletingId}
                    handleDelete={handleDelete}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}