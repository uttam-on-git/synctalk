import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { useAuth } from '../hooks/useAuth';

const RegistrationPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        if (data.issues) {
          const errorMessage = data.issues
            .map((issue: { message: string }) => issue.message)
            .join(', ');
          throw new Error(errorMessage);
        }
        throw new Error(data.message || 'Registration failed');
      }
      toast.success('Welcome to SyncTalk!');
      login(data.token);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[0.98fr_1.02fr]">
        <section className="p-8 sm:p-10">
          <p className="home-eyebrow text-zinc-500">New workspace</p>
          <h1 className="brand-title mt-2 text-4xl text-zinc-900">Create Account</h1>
          <p className="mt-3 text-sm text-zinc-600">
            Register with username, email, and password to get a signed auth token.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-2">
            <label htmlFor="register-username" className="text-sm font-medium text-zinc-700">
              Username
            </label>
            <Input
              id="register-username"
              name="username"
              type="text"
              placeholder="your-name"
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="register-email" className="text-sm font-medium text-zinc-700">
              Email
            </label>
            <Input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="register-password" className="text-sm font-medium text-zinc-700">
              Password
            </label>
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={isLoading} className="mt-2 rounded-md">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-zinc-600">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-zinc-900 underline">
              Log In
            </Link>
          </p>
        </section>

        <section className="border-t border-zinc-300 bg-zinc-50 p-8 lg:border-l lg:border-t-0 lg:p-10">
          <Logo />
          <p className="home-eyebrow mt-8 text-zinc-500">Sync in real time</p>
          <h2 className="brand-title mt-3 text-5xl text-zinc-900">
            Authenticated users
            <br />
            can create and access rooms.
          </h2>
          <p className="mt-5 max-w-md text-zinc-600">
            SyncTalk enforces protected endpoints for room and message access,
            then pushes updates in real time with Socket.IO.
          </p>
        </section>
      </div>
    </div>
  );
};

export default RegistrationPage;
