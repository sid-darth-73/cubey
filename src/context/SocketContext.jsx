import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  // Set when battle:room_created fires for EITHER player (challenger or challengee)
  const [pendingBattleRoom, setPendingBattleRoom] = useState(null);

  // Track token in state so we can react when it appears after login
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Listen for the custom 'user:loggedin' event dispatched from Signin/Signup
  useEffect(() => {
    const onLogin = () => setToken(localStorage.getItem('token'));
    const onLogout = () => setToken(null);
    window.addEventListener('user:loggedin', onLogin);
    window.addEventListener('user:loggedout', onLogout);
    return () => {
      window.removeEventListener('user:loggedin', onLogin);
      window.removeEventListener('user:loggedout', onLogout);
    };
  }, []);

  // Connect/disconnect socket whenever token changes
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (!token) return;

    const socket = io(BACKEND_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[socket] connect error:', err.message);
    });

    socket.on('challenge:incoming', (data) => {
      console.log('[socket] challenge:incoming', data);
      setIncomingChallenge(data);
    });

    // Fires for BOTH the challenger AND the challengee when a challenge is accepted.
    // Registered here (not in a child component) so timing is guaranteed — the listener
    // is always attached at the same moment the socket is created.
    socket.on('battle:room_created', ({ roomId }) => {
      console.log('[socket] battle:room_created', roomId);
      setIncomingChallenge(null);   // close the popup for the challengee
      setPendingBattleRoom(roomId); // triggers navigation in ChallengePopup for both
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const dismissChallenge = () => setIncomingChallenge(null);
  const clearPendingBattleRoom = () => setPendingBattleRoom(null);

  return (
    <SocketContext.Provider value={{
      socket: socketRef,
      incomingChallenge,
      dismissChallenge,
      pendingBattleRoom,
      clearPendingBattleRoom,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
