import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // .env থেকে সকেট ইউআরএল নিবে
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
      setSocket(newSocket);

      // ইউজারকে তার ইউনিভার্সিটির রুমে জয়েন করানো
      if (user.universityId) {
        newSocket.emit("join_university", user.universityId);
      }

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};