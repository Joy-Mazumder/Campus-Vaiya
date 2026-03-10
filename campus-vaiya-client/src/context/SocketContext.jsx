import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

// এই নামেই ইম্পোর্ট করতে হবে
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (user) {
            // আপনার ব্যাকএন্ড ইউআরএল (VITE_SOCKET_URL=http://localhost:5000)
            const newSocket = io(import.meta.env.VITE_SOCKET_URL);
            setSocket(newSocket);

            newSocket.emit("addUser", user._id);

            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            return () => newSocket.close();
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};