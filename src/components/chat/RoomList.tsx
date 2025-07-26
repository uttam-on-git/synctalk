import type { Room } from '../../hooks/useRooms';

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}

const RoomList = ({ rooms, onSelectRoom, onCreateRoom }: RoomListProps) => {
  return (
    <div>
      <h2>Rooms</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <button onClick={() => onSelectRoom(room.id)}># {room.name}</button>
          </li>
        ))}
      </ul>
      <button onClick={onCreateRoom}>+ Create Room</button>
    </div>
  );
};

export default RoomList;
