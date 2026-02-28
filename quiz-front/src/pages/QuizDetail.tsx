import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { getQuizById, Quiz } from "../api/quizzes";

interface UserAnswers {
  [questionIndex: number]: {
    boolean?: boolean;
    text?: string;
    checkbox?: number[];
  };
}

export default function QuizDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuiz(id);
    }
  }, [id]);

  const loadQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      const data = await getQuizById(quizId);
      setQuiz(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleBooleanAnswer = (questionIndex: number, value: boolean) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: { boolean: value },
    }));
  };

  const handleTextAnswer = (questionIndex: number, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: { text: value },
    }));
  };

  const handleCheckboxAnswer = (questionIndex: number, optionIndex: number) => {
    setUserAnswers((prev) => {
      const current = prev[questionIndex]?.checkbox || [];
      const isSelected = current.includes(optionIndex);

      return {
        ...prev,
        [questionIndex]: {
          checkbox: isSelected
            ? current.filter((i) => i !== optionIndex)
            : [...current, optionIndex],
        },
      };
    });
  };

  const isAnswerCorrect = (questionIndex: number) => {
    if (!quiz || !submitted) return null;

    const question = quiz.questions[questionIndex];
    const answer = userAnswers[questionIndex];

    if (!answer) return false;

    if (question.type === "BOOLEAN") {
      return answer.boolean === question.correctAnswer;
    }

    if (question.type === "INPUT") {
      return (
        answer.text?.toLowerCase().trim() ===
        question.correctText?.toLowerCase().trim()
      );
    }

    if (question.type === "CHECKBOX" && question.options) {
      const correctIndices = question.options
        .map((opt, idx) => (opt.isCorrect ? idx : -1))
        .filter((idx) => idx !== -1);

      const userIndices = (answer.checkbox || []).sort();

      return (
        JSON.stringify(correctIndices.sort()) === JSON.stringify(userIndices)
      );
    }

    return false;
  };

  const calculateScore = () => {
    if (!quiz) return { correct: 0, total: 0 };

    let correct = 0;
    quiz.questions.forEach((_, index) => {
      if (isAnswerCorrect(index)) correct++;
    });

    return { correct, total: quiz.questions.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/quizzes")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Quizzes
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error || "Quiz not found"}
          </div>
        </div>
      </div>
    );
  }

  const score = calculateScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/quizzes")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to Quizzes
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-blue-100">{quiz.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-sm font-semibold">
                  {quiz.questions.length}{" "}
                  {quiz.questions.length === 1 ? "Question" : "Questions"}
                </span>
              </div>

              {submitted && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold">
                    Score: {score.correct}/{score.total} (
                    {Math.round((score.correct / score.total) * 100)}%)
                  </span>
                </div>
              )}

              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
              >
                {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
                <span className="text-sm font-semibold">
                  {showAnswers ? "Hide Answers" : "Show Answers"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* {!submitted && (
          <div className="mb-6">
            <button
              onClick={() => setSubmitted(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
            >
              Submit Quiz
            </button>
          </div>
        )}

        {submitted && (
          <div className="mb-6">
            <button
              onClick={() => {
                setSubmitted(false);
                setUserAnswers({});
                setShowAnswers(false);
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        )} */}

        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const isCorrect = isAnswerCorrect(index);
            const borderColor = submitted
              ? isCorrect
                ? "border-green-500"
                : isCorrect === false
                  ? "border-red-500"
                  : "border-gray-200"
              : "border-gray-200";

            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-sm p-6 border-2 ${borderColor} transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold flex-shrink-0 ${
                      submitted
                        ? isCorrect
                          ? "bg-green-100 text-green-600"
                          : isCorrect === false
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {submitted && isCorrect !== null ? (
                      isCorrect ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <XCircle size={20} />
                      )
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          question.type === "BOOLEAN"
                            ? "bg-green-100 text-green-700"
                            : question.type === "INPUT"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {question.type === "BOOLEAN"
                          ? "True/False"
                          : question.type === "INPUT"
                            ? "Text Input"
                            : "Multiple Choice"}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {question.questionText}
                    </h3>

                    {question.type === "BOOLEAN" && (
                      <div className="space-y-2">
                        {[true, false].map((value) => {
                          const isSelected =
                            userAnswers[index]?.boolean === value;
                          const isCorrectAnswer =
                            showAnswers && question.correctAnswer === value;

                          return (
                            <button
                              key={String(value)}
                              onClick={() =>
                                !submitted && handleBooleanAnswer(index, value)
                              }
                              disabled={submitted}
                              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                submitted && isSelected && isCorrect
                                  ? "bg-green-50 border-green-500"
                                  : submitted && isSelected && !isCorrect
                                    ? "bg-red-50 border-red-500"
                                    : isSelected
                                      ? "bg-blue-50 border-blue-500"
                                      : isCorrectAnswer
                                        ? "bg-green-50 border-green-200"
                                        : "bg-gray-50 border-gray-200 hover:border-blue-300"
                              } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                            >
                              <div
                                className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${
                                  isSelected
                                    ? submitted && isCorrect
                                      ? "bg-green-600 border-green-600"
                                      : submitted && !isCorrect
                                        ? "bg-red-600 border-red-600"
                                        : "bg-blue-600 border-blue-600"
                                    : isCorrectAnswer
                                      ? "bg-green-600 border-green-600"
                                      : "bg-white border-gray-300"
                                }`}
                              >
                                {(isSelected || isCorrectAnswer) && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span
                                className={`font-medium ${
                                  submitted && isSelected && isCorrect
                                    ? "text-green-900"
                                    : submitted && isSelected && !isCorrect
                                      ? "text-red-900"
                                      : isCorrectAnswer
                                        ? "text-green-900"
                                        : "text-gray-700"
                                }`}
                              >
                                {value ? "True" : "False"}
                              </span>
                              {isCorrectAnswer && (
                                <span className="ml-auto text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                  Correct
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {question.type === "INPUT" && (
                      <div>
                        <input
                          type="text"
                          value={userAnswers[index]?.text || ""}
                          onChange={(e) =>
                            !submitted &&
                            handleTextAnswer(index, e.target.value)
                          }
                          disabled={submitted}
                          placeholder="Type your answer..."
                          className={`w-full p-4 rounded-lg border-2 transition-all ${
                            submitted && isCorrect
                              ? "bg-green-50 border-green-500"
                              : submitted && !isCorrect
                                ? "bg-red-50 border-red-500"
                                : "bg-gray-50 border-gray-200 focus:border-blue-500 focus:outline-none"
                          } ${submitted ? "cursor-default" : ""}`}
                        />
                        {showAnswers && (
                          <div className="mt-3 bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-gray-600 mb-1 font-medium">
                              Correct Answer:
                            </p>
                            <p className="font-semibold text-green-900">
                              {question.correctText}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {question.type === "CHECKBOX" && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isSelected =
                            userAnswers[index]?.checkbox?.includes(optIndex) ||
                            false;
                          const isCorrectOption =
                            showAnswers && option.isCorrect;

                          return (
                            <button
                              key={optIndex}
                              onClick={() =>
                                !submitted &&
                                handleCheckboxAnswer(index, optIndex)
                              }
                              disabled={submitted}
                              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                submitted && isSelected && option.isCorrect
                                  ? "bg-green-50 border-green-500"
                                  : submitted && isSelected && !option.isCorrect
                                    ? "bg-red-50 border-red-500"
                                    : isSelected
                                      ? "bg-blue-50 border-blue-500"
                                      : isCorrectOption
                                        ? "bg-green-50 border-green-200"
                                        : "bg-gray-50 border-gray-200 hover:border-blue-300"
                              } ${submitted ? "cursor-default" : "cursor-pointer"}`}
                            >
                              <div
                                className={`flex items-center justify-center w-5 h-5 rounded border-2 ${
                                  isSelected
                                    ? submitted && option.isCorrect
                                      ? "bg-green-600 border-green-600"
                                      : submitted && !option.isCorrect
                                        ? "bg-red-600 border-red-600"
                                        : "bg-blue-600 border-blue-600"
                                    : isCorrectOption
                                      ? "bg-green-600 border-green-600"
                                      : "bg-white border-gray-300"
                                }`}
                              >
                                {(isSelected || isCorrectOption) && (
                                  <CheckCircle2
                                    size={16}
                                    className="text-white"
                                  />
                                )}
                              </div>
                              <span
                                className={`font-medium ${
                                  submitted && isSelected && option.isCorrect
                                    ? "text-green-900"
                                    : submitted &&
                                        isSelected &&
                                        !option.isCorrect
                                      ? "text-red-900"
                                      : isCorrectOption
                                        ? "text-green-900"
                                        : "text-gray-700"
                                }`}
                              >
                                {option.text}
                              </span>
                              {isCorrectOption && (
                                <span className="ml-auto text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                  Correct
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!submitted && (
            <div className="mb-6">
              <button
                onClick={() => setSubmitted(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
              >
                Submit Quiz
              </button>
            </div>
          )}

          {submitted && (
            <div className="mb-6">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setUserAnswers({});
                  setShowAnswers(false);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
