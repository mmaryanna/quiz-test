import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import QuizList from './pages/QuizList';
import CreateQuiz from './pages/CreateQuiz';
import QuizDetail from './pages/QuizDetail';
import EditQuiz from './pages/EditQuiz';


function App() {
  return (
    <BrowserRouter>

      <h2>{import.meta.env.VITE_APP_STATUS}</h2>

      <Routes>
        <Route path="/" element={<Navigate to="/quizzes" replace />} />
        <Route path="/quizzes" element={<QuizList />} />
        <Route path="/create" element={<CreateQuiz />} />
        <Route path="/quizzes/:id" element={<QuizDetail />} />
        <Route path="/quizzes/:id/edit" element={<EditQuiz />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
