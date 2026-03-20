import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken') || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        try {
          const response = await authApi.getMe();
          setUser(response.data.data.user);
        } catch (error) {
          try {
            const refreshResponse = await authApi.refreshToken();
            const newToken = refreshResponse.data.data.accessToken;
            setAccessToken(newToken);
            localStorage.setItem('accessToken', newToken);
            const userResponse = await authApi.getMe();
            setUser(userResponse.data.data.user);
          } catch {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('accessToken');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem('accessToken', token);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
  };

  const value = {
    user,
    setUser,
    accessToken,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;