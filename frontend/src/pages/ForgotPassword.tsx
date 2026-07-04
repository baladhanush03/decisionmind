import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setDemoCode(res.demo_code || '123456');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset code. Make sure the email is registered.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await authService.resetPassword(email, code, newPassword);
      setSuccessMsg('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. Check your verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-inner">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-semibold text-text">
          {step === 1 ? 'Reset your password' : 'Enter Verification Code'}
        </h3>
        <p className="text-textMuted mt-2 text-sm">
          {step === 1
            ? "Enter your email address and we'll generate a verification code to reset your password."
            : `We generated a reset code for ${email}. Enter it below along with your new password.`}
        </p>
      </div>

      {step === 2 && demoCode && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Demo Mode: Verification Code Generated</p>
            <p className="mt-1">
              Your 6-digit verification code is <span className="font-mono font-bold px-1.5 py-0.5 bg-emerald-500/20 rounded text-emerald-300">{demoCode}</span>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />

          <Button type="submit" className="w-full shadow-lg shadow-primary/25" isLoading={isLoading}>
            Send Verification Code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <Input
            label="6-Digit Verification Code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 123456"
          />

          <Input
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="w-1/3"
              onClick={() => {
                setStep(1);
                setError('');
              }}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button type="submit" className="w-2/3 shadow-lg shadow-primary/25" isLoading={isLoading}>
              Reset Password
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-textMuted">
        Remember your password?{' '}
        <Link to="/login" className="text-primary hover:text-primaryHover font-medium inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>
    </>
  );
}
