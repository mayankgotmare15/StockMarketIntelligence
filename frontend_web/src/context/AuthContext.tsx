import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, getUserProfile, loginDemoUser } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginDemo: () => Promise<void>;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const profile = await getUserProfile();
        if (profile) {
          setUser(profile);
        } else {
          // Default to demo session for seamless exploration
          const demoRes = await loginDemoUser();
          setUser(demoRes.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      const demoRes = await loginDemoUser();
      setUser(demoRes.user);
    } catch (err) {
      console.error('Login demo error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        loginDemo,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
