export interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
}
