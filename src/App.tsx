import { Toaster } from 'react-hot-toast';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage';
import Logo from './components/ui/Logo';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <>
      <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Logo />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/register" />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </Router>
      </AuthProvider>
    </>
  );
}

export default App;
