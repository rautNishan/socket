// components/Chat.tsx
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface Message {
  // id: number;s
  message: string;
  from: { id: number };
  // createdAt?: string;
  roomId?: number;
}

interface Room {
  id: number;
  type: string;
  messages: Message[];
  members: { userId: User }[];
}

// Hook to get current user from your auth system
export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/user/auth/auth-me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch current user");

        const data = await res.json();
        setUser(data.data); // Adjust if your API differs
      } catch (error) {
        console.error(error);
        setUser(null);
      }
    };

    fetchUser();
  }, [getToken]);

  return user;
};

export const ChatApp: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { logout, getToken, isAuthenticated } = useAuth();
  const currentUser = useCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection (outside useEffect to avoid multiple instances)
  const socketRef = React.useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch initial rooms & messages
    const fetchMessages = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("No auth token found");

        const res = await fetch("http://localhost:3000/chat/get-message", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();

        if (!Array.isArray(data.data)) {
          throw new Error("Expected 'data.data' to be an array");
        }

        setRooms(data.data);
        if (data.data.length > 0) {
          setSelectedRoomId(data.data[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [isAuthenticated, getToken]);

  // Setup socket connection
  useEffect(() => {
    if (!isAuthenticated) return;

    socketRef.current = io("http://localhost:3002", {
      auth: {
        token: getToken(),
      },
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to socket server", socket.id);
      if (selectedRoomId) {
        socket.emit("JOIN_ROOM", selectedRoomId);
      }
    });

    socket.on("NEW_MESSAGE", (message: Message) => {
      console.log("This is message: ", message);

      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === message.roomId
            ? { ...room, messages: [...room.messages, message] }
            : room
        )
      );
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, getToken]);

  // Join new room when selectedRoomId changes
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && selectedRoomId) {
      socket.emit("JOIN_ROOM", selectedRoomId);
    }
  }, [selectedRoomId]);

  // Scroll to bottom when messages or selected room changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rooms, selectedRoomId]);

  if (!currentUser) return <p>Loading user info...</p>;

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const socket = socketRef.current;
    if (!socket) {
      console.error("Socket not connected");
      return;
    }
    console.log("This is room: ", selectedRoom);

    const msgToSend = {
      roomId: selectedRoom.id,
      message: newMessage.trim(),
      senderId: currentUser.id,
    };

    socket.emit("SEND_MESSAGES", msgToSend);

    // Optimistically update UI while waiting for server
    const newMsg: Message = {
      message: newMessage.trim(),
      from: currentUser,
      roomId: selectedRoom.id,
    };

    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === selectedRoom.id
          ? { ...room, messages: [...room.messages, newMsg] }
          : room
      )
    );

    setNewMessage("");
  };

  return (
    <div className="flex h-screen max-h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-300 flex flex-col">
        <div className="p-4 flex justify-between items-center border-b border-gray-300">
          <h1 className="text-xl font-bold">Messenger</h1>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={logout}
          >
            Logout
          </button>
        </div>
        {loading ? (
          <p className="p-4">Loading chats...</p>
        ) : error ? (
          <p className="p-4 text-red-500">{error}</p>
        ) : (
          <ul className="flex-grow overflow-auto">
            {rooms.map((room) => {
              // Show other members except current user
              const otherMembers = room.members
                .map((m) => m.userId)
                .filter((u) => u.email !== currentUser.email);
              const lastMessage =
                room.messages[room.messages.length - 1]?.message || "";

              return (
                <li
                  key={room.id}
                  className={`p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-200 flex items-center space-x-3 ${
                    selectedRoomId === room.id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                    {otherMembers.length > 0
                      ? otherMembers[0].name?.[0]?.toUpperCase() ?? "?"
                      : "?"}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-gray-900 truncate">
                      {otherMembers.map((m) => m.name).join(", ")}
                    </span>
                    <span className="text-sm text-gray-600 truncate">
                      {lastMessage}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Chat window */}
      <div className="flex flex-col flex-grow">
        {selectedRoom ? (
          <>
            <div className="border-b border-gray-300 p-4 flex items-center space-x-4">
              <h2 className="font-bold text-lg">
                {selectedRoom.members
                  .map((m) => m.userId.email)
                  .filter((n) => n !== currentUser.email)
                  .join(", ")}
              </h2>
            </div>

            <div className="flex-grow overflow-auto p-4 space-y-2 bg-gray-50">
              {selectedRoom.messages.length === 0 && (
                <p className="text-gray-500 text-center mt-10">
                  No messages yet.
                </p>
              )}
              {selectedRoom.messages.map((msg) => {
                const isCurrentUser = msg.from.id === currentUser.id;
                return (
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg break-words ${
                      isCurrentUser
                        ? "bg-blue-500 text-white self-end rounded-br-none"
                        : "bg-white text-gray-900 self-start rounded-bl-none shadow"
                    } flex items-center space-x-2`}
                    style={{
                      alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                    }}
                  >
                    {!isCurrentUser && (
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                        {"?"}
                      </div>
                    )}
                    <div>
                      <p>{msg.message}</p>
                      {
                        <span className="text-xs text-gray-300 block mt-1 text-right"></span>
                      }
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="border-t border-gray-300 p-4 flex items-center space-x-4">
              <input
                type="text"
                className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`bg-blue-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
