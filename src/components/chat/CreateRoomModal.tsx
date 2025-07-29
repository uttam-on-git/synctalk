import { useState } from 'react';
import toast from 'react-hot-toast';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => Promise<void>;
}

const CreateRoomModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateRoomModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    );

    toast.promise(createPromise, {
      loading: 'Creating room...',
      success: () => {
        setIsLoading(false);
        setName('');
        setDescription('');
        onClose();
        return 'Room created successfully!';
      },
      error: (err) => {
        setIsLoading(false);
        return `Error: ${err.message}`;
      },
    });
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md transform rounded-2xl bg-zinc-800 border border-zinc-700 p-6 shadow-2xl transition-all">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-600">
            <svg
              className="h-8 w-8 text-white"
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
          <h2 className="text-2xl font-bold text-white">Create New Room</h2>
          <p className="text-sm text-zinc-400">
            Start a new conversation space
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="room-name"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Room Name *
            </label>
            <input
              id="room-name"
              type="text"
              placeholder="Enter room name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-3 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
              disabled={isLoading}
              maxLength={50}
            />
            <div className="mt-1 flex justify-between text-xs text-zinc-500">
              <span>Give your room a memorable name</span>
              <span>{name.length}/50</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="room-description"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Description <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              id="room-description"
              placeholder="What's this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-3 text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
              disabled={isLoading}
              rows={3}
              maxLength={200}
            />
            <div className="mt-1 flex justify-between text-xs text-zinc-500">
              <span>Help others understand the room's purpose</span>
              <span>{description.length}/200</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-zinc-600 bg-transparent px-4 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white transition hover-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Room'
              )}
            </button>
          </div>
        </form>

        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:cursor-not-allowed sm:hidden"
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
