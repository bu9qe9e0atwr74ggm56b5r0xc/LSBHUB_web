import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { GuestRoute } from './components/layout/GuestRoute';

import WelcomePage from './pages/Welcome/WelcomePage';
import LoginPage from './pages/Login/LoginPage';
import EncodePage from './pages/Encode/EncodePage';
import DecodePage from './pages/Decode/DecodePage';
import EducationPage from './pages/Education/EducationPage';
import HistoryPage from './pages/History/HistoryPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Редирект с корня */}
        <Route path="/" element={<Navigate to="/encode" replace />} />

        {/* Только для гостей */}
        <Route element={<GuestRoute />}>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Только для авторизованных */}
        <Route element={<ProtectedRoute />}>
          <Route path="/encode" element={<EncodePage />} />
          <Route path="/decode" element={<DecodePage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;