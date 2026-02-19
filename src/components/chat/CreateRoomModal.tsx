import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    description?: string,
    isPrivate?: boolean,
    expiresInHours?: number,
  ) => Promise<unknown>;
}

const CreateRoomModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateRoomModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Room name is required');
      return;
    }

    setIsLoading(true);

    const createPromise = onCreate(
      name.trim(),
      description.trim() || undefined,
      isPrivate,
      isTemporary ? expiresInHours : undefined,
    );

    toast.promise(createPromise, {
      loading: 'Creating room...',
      success: () => {
        setIsLoading(false);
        setName('');
        setDescription('');
        setIsPrivate(false);
        setIsTemporary(false);
        setExpiresInHours(4);
        onClose();
        return 'Room created successfully!';
      },
      error: (err) => {
        setIsLoading(false);
        return `Error: ${err.message}`;
      },
    });
  };

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setName('');
      setDescription('');
      setIsPrivate(false);
      setIsTemporary(false);
      setExpiresInHours(4);
      onClose();
    }
  }, [isLoading, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/20 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-room-title"
        aria-describedby="create-room-description"
        className="glass-panel relative w-full max-w-md rounded-xl p-6"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-700">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 id="create-room-title" className="brand-title text-3xl font-bold text-zinc-900">
            Create Room
          </h2>
          <p id="create-room-description" className="text-sm text-zinc-600">
            Create a room and start a protected realtime thread
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="room-name"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Room Name *
            </label>
            <input
              ref={nameInputRef}
              id="room-name"
              type="text"
              placeholder="Enter room name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-input w-full rounded-xl px-4 py-3"
              disabled={isLoading}
              maxLength={50}
            />
            <div className="mt-1 flex justify-between text-xs text-zinc-500">
              <span>Name must be at least 3 characters</span>
              <span>{name.length}/50</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm font-medium text-zinc-700">
                Private Room (invite code required)
              </span>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 accent-zinc-900"
              />
            </label>
          </div>

          <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm font-medium text-zinc-700">
                Temporary Room
              </span>
              <input
                type="checkbox"
                checked={isTemporary}
                onChange={(e) => setIsTemporary(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 accent-zinc-900"
              />
            </label>

            {isTemporary && (
              <div className="mt-3">
                <label
                  htmlFor="expires-in-hours"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Expires In (hours)
                </label>
                <input
                  id="expires-in-hours"
                  type="number"
                  min={1}
                  max={168}
                  value={expiresInHours}
                  onChange={(e) =>
                    setExpiresInHours(
                      Math.min(168, Math.max(1, Number(e.target.value) || 1)),
                    )
                  }
                  className="text-input w-full rounded-xl px-4 py-3"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Set 4 for a room that expires in 4 hours.
                </p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="room-description"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Description <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              id="room-description"
              placeholder="What is this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-input w-full rounded-xl px-4 py-3"
              disabled={isLoading}
              rows={3}
              maxLength={200}
            />
            <div className="mt-1 flex justify-between text-xs text-zinc-500">
              <span>Optional context for room purpose</span>
              <span>{description.length}/200</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="ghost-button flex-1 cursor-pointer rounded-md px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="accent-button flex-1 cursor-pointer rounded-md px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />
                  Creating...
                </span>
              ) : (
                'Create Room'
              )}
            </button>
          </div>
        </form>

        <button
          onClick={handleClose}
          disabled={isLoading}
          aria-label="Close create room modal"
          className="ghost-button absolute right-4 top-4 cursor-pointer rounded-full p-2 text-zinc-600 disabled:cursor-not-allowed sm:hidden"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CreateRoomModal;
