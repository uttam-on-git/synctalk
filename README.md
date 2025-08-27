# SyncTalk - Frontend

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

This repository contains the frontend client for **SyncTalk**, a full-stack, real-time chat application. This React application provides the user interface for signing up, logging in, creating and joining chat rooms, and sending messages instantly.

---

## ✨ Features

- **Modern UI:** Built with React, TypeScript, and styled with Tailwind CSS for a beautiful and responsive user experience.
- **Real-Time Messaging:** Connects to the backend via WebSockets (Socket.IO) to send and receive messages instantly without page reloads.
- **Multi-Room Interface:** Features a dynamic sidebar to list and select chat rooms, and a main panel to display the message history and compose new messages.
- **Secure Authentication Flow:** Handles user registration and login, securely storing JWTs in local storage to manage user sessions.
- **Modular & Scalable:** Architected with a focus on reusable UI components, custom hooks (`useAuth`, `useRooms`, `useMessages`), and a global `AuthContext` for clean state management.

---

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Real-time Client:** [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/)

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the frontend up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A running instance of the [SyncTalk Backend](https://github.com/uttam-on-git/synctalk-backend)

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/uttam-on-git/synctalk-frontend.git
    cd synctalk-frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - In the root of the project, create a new file named `.env`.
    - Add the following variable, pointing to your local backend server:
      ```env
      VITE_BACKEND_API_URL="http://localhost:3001"
      ```

### Running the Application

- To start the development server with hot-reloading:
  ```bash
  npm run dev
  ```
- The application will be available at `http://localhost:5173`.

---

## 📜 Available Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run lint`: Lints the code for errors.
- `npm run format`: Formats all files with Prettier.
- `npm run preview`: Serves the production build locally.

---

## 🔑 Environment Variables

| Variable               | Description                                      | Example                 |
| :--------------------- | :----------------------------------------------- | :---------------------- |
| `VITE_BACKEND_API_URL` | The URL of the backend API and WebSocket server. | `http://localhost:3001` |
