import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error || !token) {
        navigate('/?error=auth_failed');
        return;
      }

      try {
        localStorage.setItem('accessToken', token);
        const response = await authApi.getMe();
        const userData = response.data.data.user;
        login(token, userData);
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        localStorage.removeItem('accessToken');
        navigate('/?error=auth_failed');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Signing you in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;