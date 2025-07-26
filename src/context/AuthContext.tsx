import { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
  id: string;
  username: string;
}

interface AuthContextType {
  user: UserPayload | null;
  isLoading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodeUser = jwtDecode<UserPayload>(token);
      setUser(decodeUser);
    }
    setIsLoading(false);
  }, []);

  const value = { user, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
