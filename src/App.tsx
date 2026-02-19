import { Toaster } from 'react-hot-toast';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import { useAuth } from './hooks/useAuth';
import type { JSX } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ui/ThemeToggle';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return user ? <Navigate to="/chat" /> : children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ThemeToggle />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--panel-strong)',
                color: 'var(--ink-1)',
                border: '1px solid var(--line)',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegistrationPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
