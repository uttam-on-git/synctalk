import type { Room } from '../../hooks/useRooms';

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}

const RoomList = ({
  rooms,
  onSelectRoom,
  onCreateRoom,
  selectedRoomId,
}: RoomListProps) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-zinc-700 p-4">
              <svg
                className="h-8 w-8 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <p className="text-sm text-zinc-400">No rooms available</p>
            <p className="text-xs text-zinc-500">
              Create your first room to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`group w-full rounded-lg p-3 text-left transition-all duration-200 ${
                  selectedRoomId === room.id
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                      selectedRoomId === room.id
                        ? 'bg-white/20'
                        : 'bg-zinc-600 group-hover:bg-zinc-500'
                    }`}
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
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{room.name}</h3>
                    {room.description && (
                      <p
                        className={`truncate text-sm ${
                          selectedRoomId === room.id
                            ? 'text-white/80'
                            : 'text-zinc-500 group-hover:text-zinc-400'
                        }`}
                      >
                        {room.description}
                      </p>
                    )}
                  </div>

                  {selectedRoomId === room.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-700 p-4">
        <button
          onClick={onCreateRoom}
          className="group w-full rounded-lg border-2 border-dashed border-zinc-600 p-4 text-zinc-400 transition-all duration-200 hover:border-violet-500 hover:bg-violet-500/10 hover:text-violet-400"
        >
          <div className="flex items-center justify-center space-x-2">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="font-semibold">Create Room</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RoomList;
