export interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  roomId?: string;
  author: {
    id: string;
    username: string;
  };
}
