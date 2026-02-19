import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMenu } from 'react-icons/hi';
import { RxCross2 } from 'react-icons/rx';
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

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-4 sm:px-6">
      <nav className="glass-panel mx-auto flex w-full max-w-6xl items-center justify-between rounded-xl px-4 py-2.5 sm:px-6">
        <div className="sm:hidden">
          <MobileLogo />
        </div>
        <div className="hidden sm:block">
          <Logo />
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="ghost-button rounded-md p-2 sm:hidden"
          aria-label="Open menu"
        >
          <HiOutlineMenu size={22} />
        </button>

        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <>
              <span className="text-sm text-zinc-600">Hi, {user.username}</span>
              <button
                onClick={() => navigate('/chat')}
                className="accent-button rounded-md px-4 py-2 text-sm"
              >
                Open Chat
              </button>
              <button
                onClick={logout}
                className="ghost-button rounded-md px-4 py-2 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="accent-button rounded-md px-4 py-2 text-sm">
                Sign Up
              </Link>
              <Link to="/login" className="ghost-button rounded-md px-4 py-2 text-sm">
                Log In
              </Link>
            </>
          )}
        </div>
      </nav>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 z-50 bg-zinc-950/20 p-4 backdrop-blur-sm transition-opacity sm:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className={`glass-panel-strong ml-auto flex h-full w-72 flex-col rounded-xl p-5 transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <MobileLogo />
            <button
              onClick={() => setIsOpen(false)}
              className="ghost-button rounded-md p-2"
              aria-label="Close menu"
            >
              <RxCross2 size={20} />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            {user ? (
              <>
                <button
                  onClick={handleGoToChat}
                  className="accent-button rounded-md px-4 py-3 text-sm"
                >
                  Open Chat
                </button>
                <button
                  onClick={handleLogout}
                  className="ghost-button rounded-md px-4 py-3 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="accent-button rounded-md px-4 py-3 text-center text-sm"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="ghost-button rounded-md px-4 py-3 text-center text-sm"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
