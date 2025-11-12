import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../services/api';

type UserRole = 'patient' | 'clinician' | 'admin';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // The logged-in user
  activeUser: User | null; // The user profile being viewed (could be self or patient)
  isLoading: boolean;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithFaceId: (username: string, faceImage: string) => Promise<void>;
  register: (username: string, email: string, password: string, faceImage: string | null) => Promise<void>;
  logout: () => void;
  setUserRole: (role: UserRole) => Promise<void>;
  switchView: (targetUserId: string | null) => Promise<void>; // New function
  updateUserInContext: (updatedUser: User) => void; // New function to update context from pages
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null); // New state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setActiveUser(parsedUser); // Set active user on initial load
        }
      } catch (error) {
        console.error("Failed to parse user from session storage", error);
        sessionStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);
  
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveUser(loggedInUser); // Set active user on login
    sessionStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const loginWithPassword = async (username: string, password: string) => {
    const loggedInUser = await api.loginUser(username, password);
    handleLogin(loggedInUser);
  };

  const loginWithFaceId = async (username: string, faceImage: string) => {
    const loggedInUser = await api.verifyFaceId(username, faceImage);
    handleLogin(loggedInUser);
  };

  const register = async (username: string, email: string, password: string, faceImage: string | null) => {
    const newUser = await api.registerUser(username, email, password, faceImage);
    handleLogin(newUser);
  };
  
  const setUserRole = async (role: UserRole) => {
    if (!user) throw new Error("User not authenticated");
    const updatedUser = await api.updateUserRole(user.id, role);
    handleLogin(updatedUser);
  };

  const logout = () => {
    setUser(null);
    setActiveUser(null); // Clear active user on logout
    sessionStorage.removeItem('user');
  };

  const switchView = async (targetUserId: string | null) => {
      if (!user) return;
      if (targetUserId === null || targetUserId === user.id) {
          setActiveUser(user);
          return;
      }

      const isAllowed = user.caringFor?.some(p => p.userId === targetUserId);
      if (isAllowed) {
          try {
              const targetUser = await api.getUserById(targetUserId);
              setActiveUser(targetUser);
          } catch (error) {
              console.error("Failed to switch view:", error);
          }
      }
  };
  
  const updateUserInContext = (updatedUser: User) => {
    // If the updated user is the logged-in user, update both 'user' and 'activeUser'
    if (user && updatedUser.id === user.id) {
        setUser(updatedUser);
        setActiveUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
    } 
    // If we're just updating the view of a patient we're caring for
    else if (activeUser && updatedUser.id === activeUser.id) {
        setActiveUser(updatedUser);
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    activeUser,
    isLoading,
    loginWithPassword,
    loginWithFaceId,
    register,
    logout,
    setUserRole,
    switchView,
    updateUserInContext,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};