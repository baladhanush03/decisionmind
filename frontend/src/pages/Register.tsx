import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

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

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register(email, password, fullName, phone || undefined);
      navigate('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setIsGoogleLoading(true);
    setError('');

    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => initGoogleSignUp();
      document.body.appendChild(script);
    } else {
      initGoogleSignUp();
    }
  };

  const initGoogleSignUp = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Google Sign-Up is not configured yet. Please register with email.');
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
          setError(err.response?.data?.detail || 'Google sign-up failed. Please try again.');
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
        <h3 className="text-2xl font-semibold text-text">Create an account</h3>
        <p className="text-textMuted mt-2 text-sm">Start building your AI models today</p>
      </div>

      {/* Google Sign-Up Button */}
      <button
        id="google-signup-btn"
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg border border-border bg-surface hover:bg-surfaceHover transition-all duration-200 text-sm font-medium text-text disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {isGoogleLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3" />
        ) : (
          <GoogleIcon />
        )}
        Sign up with Google
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-surface text-textMuted rounded-full">or register with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row: Full Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="register-fullname"
            label="Full Name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-textMuted mb-1.5">
              Phone Number <span className="text-textMuted/50 font-normal">(optional)</span>
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-surfaceHover text-textMuted text-sm">
                +
              </span>
              <input
                id="register-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="91 98765 43210"
                className="flex-1 h-10 rounded-r-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors placeholder:text-textMuted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
          </div>
        </div>

        <Input
          id="register-email"
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="register-password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
          />
          <Input
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <Button id="register-submit-btn" type="submit" className="w-full !mt-6" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-textMuted">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:text-primaryHover font-medium">
          Sign in
        </Link>
      </div>
    </>
  );
}
