import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }
      toast.success('Welcome back!');
      login(data.token);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('An unknown error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="border-b border-zinc-300 bg-zinc-50 p-8 lg:border-b-0 lg:border-r lg:p-10">
          <Logo />
          <p className="home-eyebrow mt-8 text-zinc-500">Return to your workspace</p>
          <h1 className="brand-title mt-3 text-5xl text-zinc-900">
            Reconnect with
            <br />
            your JWT session.
          </h1>
          <p className="mt-5 max-w-md text-zinc-600">
            Log in with email and password. Credentials are verified server-side
            and sessions are issued as signed tokens.
          </p>
        </section>

        <section className="p-8 sm:p-10">
          <p className="home-eyebrow text-zinc-500">Account access</p>
          <h2 className="brand-title mt-2 text-4xl text-zinc-900">Log In</h2>
          <p className="mt-3 text-sm text-zinc-600">Welcome back to SyncTalk.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-zinc-700">
              Email
            </label>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="login-password" className="text-sm font-medium text-zinc-700">
              Password
            </label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={isLoading} className="mt-2 rounded-md">
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-zinc-600">
            Need an account?{' '}
            <Link to="/register" className="font-semibold text-zinc-900 underline">
              Sign Up
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
