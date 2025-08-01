import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMenu } from 'react-icons/hi';
import MobileLogo from './MobileLogo';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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

      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden text-white"
      >
        <HiOutlineMenu size={25} />
      </button>

      {/* Desktop Menu */}
      <div className="hidden sm:flex gap-4">
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
        <Link
          to="/contact"
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Contact
        </Link>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-gray-900 transform transition-transform sm:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col gap-4 p-6 pt-16">
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
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-center transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}