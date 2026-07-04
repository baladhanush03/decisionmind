import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// Minimal Google icon SVG
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authService.login(email, password);
      setToken(data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setError('');

    // Load Google Identity Services script if not loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => initGoogleSignIn();
      document.body.appendChild(script);
    } else {
      initGoogleSignIn();
    }
  };

  const initGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Sign-In is not configured. Please use email/password login.');
      setIsGoogleLoading(false);
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          const data = await authService.googleLogin(response.credential);
          setToken(data.access_token);
          navigate('/dashboard');
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Google login failed. Please try again.');
        } finally {
          setIsGoogleLoading(false);
        }
      },
    });

    window.google.accounts.id.prompt();
  };

  return (
    <>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-text">Welcome back</h3>
        <p className="text-textMuted mt-2 text-sm">Enter your details to access your account</p>
      </div>

      {/* Google Sign-In Button */}
      <button
        id="google-login-btn"
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg border border-border bg-surface hover:bg-surfaceHover transition-all duration-200 text-sm font-medium text-text disabled:opacity-50 disabled:cursor-not-allowed mb-6 group"
      >
        {isGoogleLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-surface text-textMuted rounded-full">or sign in with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="login-email"
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
        />
        
        <Input
          id="login-password"
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div className="flex justify-end -mt-2">
          <Link to="/forgot-password" className="text-xs text-primary hover:text-primaryHover font-medium transition-colors">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <Button id="login-submit-btn" type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-textMuted">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:text-primaryHover font-medium">
          Create one now
        </Link>
      </div>
    </>
  );
}
