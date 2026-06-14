import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Admin, User, Student, UserType } from '@/types';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: Admin | User | Student | null;
  userType: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (type: UserType, credentials: Record<string, string>) => Promise<boolean>;
  autoLogin: (identifier: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Admin | User | Student | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType') as UserType | null;
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUserType && storedUser) {
      setToken(storedToken);
      setUserType(storedUserType);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (type: UserType, credentials: Record<string, string>): Promise<boolean> => {
    try {
      let response;
      
      switch (type) {
        case 'admin':
          response = await authApi.adminLogin({
            username: credentials.username,
            password: credentials.password,
          });
          break;
        case 'user':
          response = await authApi.userLogin({
            email: credentials.email,
            password: credentials.password,
          });
          break;
        case 'student':
          response = await authApi.studentLogin({
            username: credentials.username,
            password: credentials.password,
          });
          break;
      }

      const { token: newToken } = response.data;
      const userData = response.data.admin || response.data.user || response.data.student;

      // Store in state
      setToken(newToken);
      setUserType(type);
      setUser(userData);

      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('userType', type);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success('Login successful!');
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const autoLogin = async (identifier: string, password: string): Promise<boolean> => {
    const persist = (newToken: string, type: UserType, userData: Admin | User | Student) => {
      setToken(newToken);
      setUserType(type);
      setUser(userData);
      localStorage.setItem('token', newToken);
      localStorage.setItem('userType', type);
      localStorage.setItem('user', JSON.stringify(userData));
    };

    // Try admin — uses username field
    try {
      const res = await authApi.adminLogin({ username: identifier, password });
      persist(res.data.token, 'admin', res.data.admin);
      toast.success('Login successful!');
      return true;
    } catch { /* not an admin account */ }

    // Try student — uses username field
    try {
      const res = await authApi.studentLogin({ username: identifier, password });
      persist(res.data.token, 'student', res.data.student);
      toast.success('Login successful!');
      return true;
    } catch { /* not a student account */ }

    // Try user / faculty — uses email field
    try {
      const res = await authApi.userLogin({ email: identifier, password });
      persist(res.data.token, 'user', res.data.user);
      toast.success('Login successful!');
      return true;
    } catch { /* not a user account */ }

    return false;
  };

  const logout = async () => {
    try {
      if (userType === 'admin') {
        await authApi.adminLogout();
      } else if (userType === 'user') {
        await authApi.userLogout();
      } else if (userType === 'student') {
        await authApi.studentLogout();
      }
    } catch {
      // Ignore logout errors
    }

    // Clear state
    setToken(null);
    setUserType(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');

    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      let response;
      
      switch (userType) {
        case 'admin':
          response = await authApi.adminProfile();
          setUser(response.data.admin);
          localStorage.setItem('user', JSON.stringify(response.data.admin));
          break;
        case 'user':
          response = await authApi.userProfile();
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          break;
        case 'student':
          response = await authApi.studentProfile();
          setUser(response.data.student);
          localStorage.setItem('user', JSON.stringify(response.data.student));
          break;
      }
    } catch {
      // If refresh fails, logout
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        autoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
