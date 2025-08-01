import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMenu } from 'react-icons/hi';
import MobileLogo from './MobileLogo';
import Logo from './Logo';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoToChat = () => {
    navigate('/chat');
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 shadow-md">
      <div>
        <div className="sm:hidden">
          <MobileLogo />
        </div>
        <div className="hidden sm:block">
          <Logo />
        </div>
      </div>

      <button onClick={() => setIsOpen(true)} className="sm:hidden text-white">
        <HiOutlineMenu size={25} />
      </button>

      <div className="hidden sm:flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-300">Welcome, {user.username}!</span>
            <button
              onClick={() => navigate('/chat')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              Go to Chat
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/register"
              className="px-4 py-2 bg-[#1f7cbf] hover:bg-[#6295ba] text-white rounded-lg transition-colors"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 bg-[#1f7cbf] hover:bg-[#6295ba] text-white rounded-lg transition-colors"
            >
              Log in
            </Link>
          </>
        )}
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-900 transform transition-transform sm:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white"
        ></button>

        <div className="flex flex-col gap-4 p-6 pt-16">
          {user ? (
            <>
              <button
                onClick={handleGoToChat}
                className="px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-center transition-colors"
              >
                Go to Chat
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-center transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 bg-[#1f7cbf] hover:bg-[#6295ba] text-white rounded-lg text-center transition-colors"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 bg-[#1f7cbf] hover:bg-[#6295ba] text-white rounded-lg text-center transition-colors"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
