import { FormEvent, useState } from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { updatePasswordWithRecoveryToken } from '../lib/supabase';

interface PasswordRecoveryProps {
  onBackToAdmin: () => void;
}

export function PasswordRecovery({ onBackToAdmin }: PasswordRecoveryProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hashParams.get('access_token');
  const authError = hashParams.get('error_description') || hashParams.get('error');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!accessToken) {
      setMessage(authError ? decodeURIComponent(authError.replaceAll('+', ' ')) : 'This recovery link is invalid or expired. Request a new one.');
      return;
    }
    if (password.length < 8) {
      setMessage('Use a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('The passwords do not match.');
      return;
    }

    const error = await updatePasswordWithRecoveryToken(accessToken, password);
    if (error) {
      setMessage(error);
      return;
    }
    setIsComplete(true);
    setMessage('Your password has been updated. Sign in with your new password.');
    window.history.replaceState({}, document.title, `${window.location.pathname}?reset-password=1`);
  };

  return (
    <main className="min-h-screen bg-[#0a0c0f] text-neutral-100 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm space-y-5">
        <button
          type="button"
          onClick={onBackToAdmin}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to admin sign in
        </button>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-[#39FF14]/40 bg-[#39FF14]/10 text-[#39FF14]">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-neutral-400">Choose a new password for your admin account.</p>

          {isComplete ? (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-emerald-400">{message}</p>
              <button
                type="button"
                onClick={onBackToAdmin}
                className="w-full rounded-lg bg-[#39FF14] px-4 py-3 text-sm font-bold text-black"
              >
                Continue to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-3 text-sm outline-none focus:border-[#39FF14]"
              />
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-3 text-sm outline-none focus:border-[#39FF14]"
              />
              {message && <p role="alert" className="text-sm text-red-400">{message}</p>}
              <button
                type="submit"
                className="w-full rounded-lg bg-[#39FF14] px-4 py-3 text-sm font-bold text-black hover:bg-[#32e012]"
              >
                Update password
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}