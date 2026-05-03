import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_BACKEND_URL);

export const useSocket = (eventName) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        socket.on(eventName, (incomingData) => {
            setData(incomingData);
        });

        return () => socket.off(eventName);
    }, [eventName]);

    return data;
};