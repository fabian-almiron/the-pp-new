"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/data/types';
import { fetchLoggedInUser, fetchLoginUser, fetchLogoutUser, fetchIsUserLoggedIn, fetchSignupAndLogin } from '@/lib/mock-api';

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const checkLoggedInUser = async () => {
      try {
        const response = await fetchLoggedInUser();
        if (response.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetchLoginUser(email);
      if (response.data && !response.error) {
        setUser(response.data);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const signup = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetchSignupAndLogin(userData);
      if (response.data && !response.error) {
        setUser(response.data);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetchLogoutUser();
      setUser(null);
    } catch (error) {
      // Even if the API call fails, clear the local user state
      setUser(null);
    }
  };

  const value: UserContextType = {
    user,
    isLoggedIn: !!user && user.isLoggedIn,
    login,
    signup,
    logout,
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
