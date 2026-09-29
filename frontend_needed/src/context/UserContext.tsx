
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UserContextType {
  user: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  setUser: (user: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContextType['user']>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!user;

  // Check if user is stored in local storage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (['/dashboard', '/upload', '/profile', '/settings'].some(path => location.pathname.includes(path))) {
      // Redirect to login if trying to access protected routes without authentication
      navigate('/signin');
    }
  }, [navigate, location.pathname]);

  // Update localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signin');
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
