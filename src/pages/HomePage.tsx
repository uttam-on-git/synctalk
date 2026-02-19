import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRightLong } from 'react-icons/fa6';
import Logo from '../components/ui/Logo';
import { useAuth } from '../hooks/useAuth';

const navLinks = ['Features', 'Security', 'API', 'Realtime', 'FAQ'];

const useCaseTags = [
  'JWT Protected Routes',
  'Argon2 Password Hashing',
  'Socket.IO Realtime Events',
  'Room Membership Enforcement',
  'Message History by Room',
  'Optional Room Expiration',
];

const trustLogos = [
  'Node.js',
  'Express',
  'Socket.IO',
  'PostgreSQL',
  'Prisma',
  'TypeScript',
  'Zod',
  'Argon2',
];

const faqItems = [
  {
    question: 'What does SyncTalk support today?',
    answer:
      'SyncTalk supports email/password auth, JWT-protected APIs, room creation, room listing, realtime messaging, and room-based message history.',
  },
  {
    question: 'Who can read or send messages in a room?',
    answer:
      'Backend authorization checks room membership before join/send/fetch. Non-members and expired rooms are rejected.',
  },
  {
    question: 'Are rooms permanent?',
    answer:
      'Rooms can be permanent or created with an expiration window. The backend supports expiry up to 168 hours.',
  },
  {
    question: 'How are auth and input safety handled?',
    answer:
      'Passwords are hashed with Argon2, auth uses signed JWT tokens, and request bodies are validated with Zod and rate-limited on auth routes.',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="app-shell pb-14">
      <header className="sticky top-0 z-50 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6">
        <nav className="glass-panel flex items-center justify-between rounded-xl px-3 py-2.5 sm:px-4">
          <Logo />

          <ul className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
            {navLinks.map((item) => (
              <li key={item}>
                <button className="hover:text-zinc-900">{item}</button>
              </li>
            ))}
          </ul>

          <div className="inline-flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/chat')}
                  className="ghost-button hidden rounded-md px-3 py-2 text-sm font-medium sm:inline-flex"
                >
                  Open Chat
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="accent-button rounded-md px-3 py-2 text-sm"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="ghost-button hidden rounded-md px-3 py-2 text-sm font-medium sm:inline-flex"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="accent-button rounded-md px-3 py-2 text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto mt-12 flex w-full max-w-6xl flex-col items-center px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-2 py-1 [animation:reveal-up_.45s_ease_both]">
          <span className="home-eyebrow rounded-sm bg-zinc-100 px-2 py-1 text-zinc-600">
            Realtime Chat Backend + UI
          </span>
          <button
            onClick={() => navigate('/chat')}
            className="accent-button inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-semibold"
          >
            Try now
            <FaArrowRightLong className="text-[10px]" />
          </button>
        </div>

        <h1 className="brand-title home-hero-title mt-7 max-w-3xl text-zinc-950 [animation:reveal-up_.5s_ease_.08s_both]">
          Ship secure
          <br />
          roombased realtime chat.
        </h1>

        <p className="home-subtitle mt-5 max-w-2xl [animation:reveal-up_.55s_ease_.16s_both]">
          SyncTalk combines REST authentication and Socket.IO events so teams can
          create rooms, enforce membership, and collaborate with live updates.
        </p>

        <section className="mt-10 w-full max-w-3xl rounded-xl border border-zinc-900 bg-zinc-900 text-left [animation:reveal-up_.6s_ease_.24s_both]">
          <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2 text-xs text-zinc-400">
            <span>Socket Event: sendMessage</span>
            <span>JWT session active</span>
          </div>
          <div className="px-4 py-4 text-sm text-zinc-200 sm:text-base">
            @backend Room membership validated. Broadcasting newMessage to all
            connected clients in #engineering.
          </div>
          <div className="flex items-center justify-between border-t border-zinc-700 px-4 py-2">
            <div className="inline-flex items-center gap-2 text-zinc-500">
              <span className="grid h-6 w-6 place-items-center rounded border border-zinc-700 text-xs">
                +
              </span>
              <span className="grid h-6 w-6 place-items-center rounded border border-zinc-700 text-xs">
                @
              </span>
            </div>
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white"
            >
              Send
              <FaArrowRightLong />
            </button>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap justify-center gap-2 [animation:reveal-up_.6s_ease_.32s_both]">
          {useCaseTags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <section className="mt-20 w-full max-w-5xl [animation:reveal-up_.65s_ease_.4s_both]">
          <h2 className="brand-title home-section-title text-zinc-900">
            Built on a proven backend stack
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trustLogos.map((logo) => (
              <div
                key={logo}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-500"
              >
                {logo}
              </div>
            ))}
          </div>
        </section>

        <section
          id="faq"
          className="mt-20 w-full max-w-4xl rounded-2xl border border-zinc-300 bg-white p-6 text-left sm:p-8"
        >
          <div className="mb-6 text-center">
            <p className="home-eyebrow text-zinc-500">FAQ</p>
            <h3 className="brand-title mt-2 text-4xl text-zinc-900">Everything you need to know</h3>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={item.question} className="rounded-xl border border-zinc-300 bg-zinc-50">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="font-semibold text-zinc-900">{item.question}</span>
                    <span className="text-xl text-zinc-500">{isOpen ? '-' : '+'}</span>
                  </button>
                  {isOpen && (
                    <p
                      id={`faq-answer-${index}`}
                      className="border-t border-zinc-300 px-4 py-3 text-sm leading-7 text-zinc-600"
                    >
                      {item.answer}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-14 w-full max-w-4xl rounded-2xl border border-zinc-900 bg-zinc-900 px-6 py-9 text-center text-white sm:px-10">
          <p className="home-eyebrow text-zinc-300">Start now</p>
          <h3 className="brand-title mt-2 text-4xl">Create an account and open your first room.</h3>
          <p className="mx-auto mt-4 max-w-xl text-zinc-300">
            Auth, authorization, room management, and realtime delivery are ready
            to use in your current SyncTalk app.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="mt-7 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
          >
            Create Account
          </button>
        </section>
      </main>

      <footer className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6">
        <div className="glass-panel rounded-xl p-6 sm:p-8">
          <div className="grid gap-8 border-b border-zinc-300 pb-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-4 max-w-md text-sm leading-7 text-zinc-600">
                SyncTalk is a full-stack realtime chat application with protected
                routes, membership checks, and persistent room/message storage.
              </p>
            </div>

            <div>
              <h4 className="home-eyebrow text-zinc-500">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                <li><a href="#faq" className="hover:text-zinc-900">FAQ</a></li>
                <li><Link to="/chat" className="hover:text-zinc-900">Realtime Chat</Link></li>
                <li><Link to="/register" className="hover:text-zinc-900">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="home-eyebrow text-zinc-500">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                <li><a href="mailto:support@synctalk.app" className="hover:text-zinc-900">Contact</a></li>
                <li><button className="hover:text-zinc-900">Privacy</button></li>
                <li><button className="hover:text-zinc-900">Terms</button></li>
              </ul>
            </div>
          </div>

          <p className="mt-5 text-xs text-zinc-500">
            Copyright {new Date().getFullYear()} SyncTalk. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
