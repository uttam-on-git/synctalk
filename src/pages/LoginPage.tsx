import { useState } from 'react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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
      const token = data.token;
      localStorage.setItem('authToken', token);
      toast.success('Login Successful!');
      navigate('/chat');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error(`An unknown error occurred during login.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-zinc-900 text-white h-screen">
      <div className="flex-shrink-0">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
        <div className="w-full max-w-md transform rounded-2xl border bg-zinc-800 border-zinc-700 p-8 shadow">
          <div className='flex justify-center items-center pb-5'>
            <Logo/>
          </div>
          <h1 className="mb-6 text-center text-2xl font-semibold">
            Welcome Back!
          </h1>
          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-cyan-500 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
