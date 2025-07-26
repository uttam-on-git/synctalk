import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
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
    setIsLoading(true);

    const createPromise = onCreate(name, description);

    toast.promise(createPromise, {
      loading: 'Creating room...',
      success: () => {
        setIsLoading(false);
        onClose(); // Close the modal on success
        return 'Room created successfully!';
      },
      error: (err) => {
        setIsLoading(false);
        return `Error: ${err.message}`;
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div>
      <div>
        <h2>Create a New Room</h2>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Room Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              onClick={onClose}
              className="bg-zinc-600 hover:bg-zinc-500"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
