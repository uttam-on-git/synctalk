import { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface UserPayload {
  id: string;
  username: string;
  exp?: number;
}

interface AuthContextType {
  user: UserPayload | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isTokenExpired = (exp?: number) =>
    typeof exp === 'number' && exp * 1000 <= Date.now();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodeUser = jwtDecode<UserPayload>(token);
        if (isTokenExpired(decodeUser.exp)) {
          localStorage.removeItem('authToken');
          setUser(null);
        } else {
          setUser(decodeUser);
        }
      } catch {
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      const decodedUser = jwtDecode<UserPayload>(token);
      if (isTokenExpired(decodedUser.exp)) {
        localStorage.removeItem('authToken');
        setUser(null);
        navigate('/login');
        return;
      }
      localStorage.setItem('authToken', token);
      setUser(decodedUser);
      navigate('/chat');
    } catch {
      localStorage.removeItem('authToken');
      setUser(null);
      navigate('/login');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };

  const value = { user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
