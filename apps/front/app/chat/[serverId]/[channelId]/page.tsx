"use client";

import Image from 'next/image';
import Navbar from '../../navbar/page';
import Link from "next/link";
import { useEffect, useState, useRef, use } from "react";
import { io, Socket } from "socket.io-client";
import { ENV } from "../../../config/env";
import { useSession } from '@/app/lib/auth-client';
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

type Server = { id: string; name: string };
type Channel = { id: string; name: string };
type Message = { id: string; content: string; created_at: string; user_id: string; deleted: boolean };
type User = { id: string; name: string;};
type ContextMenu = { x: number; y: number; messageId: string; } | null;
type Member = { role:string } | null;
export default function ChatPage({params,
}: {
  params: Promise<{ serverId: string; channelId: string }>;
}) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { serverId, channelId } = use(params);

  const [server, setServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [newMessage, setNewMessage] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isUpdateMessageOpen, setUpdateMessageOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [member, setMember] = useState<Member | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [bgColor, setBgColor] = useState("bg-black");
  const [showPalette, setShowPalette] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const serverMenuRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUserId) return;

    const socket = io(`${ENV.API_HTTP}/chat`, { 
      withCredentials: true,
      query: { userId: currentUserId } 
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);


  useEffect(() => {
    if (!channelId || !socketRef.current) return;
    const socket = socketRef.current;

    socket.emit('joinRoom', channelId);

    socket.on('getOnlineUsers', (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    const handleUserJoined = ({ user_id }: { user_id: string }) => {
      setOnlineUsers(prev => new Set(prev).add(user_id));
    };

    const handleUserLeft = ({ user_id }: { user_id: string }) => {
      setOnlineUsers(prev => {
        const copy = new Set(prev);
        copy.delete(user_id);
        return copy;
      });
    };


    const handleChat = (msg: any) => {
      setMessages(prev => [...prev, msg]);
      if (!users[msg.user_id]) {
        fetch(`${ENV.API_HTTP}/auth/${msg.user_id}`, { credentials: "include" })
          .then(r => r.json())
          .then(user => setUsers(prev => ({ ...prev, [msg.user_id]: user })));
      }
    };

    const handleJoinedRoom = () => setJoined(true);
    const handleLeftRoom = () => setJoined(false);

    const handleTyping = ({ user_id }: { user_id: string }) => {
      setTypingUsers(prev => ({ ...prev, [user_id]: true }));
    };

    const handleStopTyping = ({ user_id }: { user_id: string }) => {
      setTypingUsers(prev => {
        const copy = { ...prev };
        delete copy[user_id];
        return copy;
      });
    };

    const handleMessageDeletedFromServer = (deletedMsg: Message) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === deletedMsg.id ? { ...msg, deleted: true } : msg
        )
      );
      setContextMenu(null);
    };


    socket.on('chatToClient', handleChat);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('joinedRoom', handleJoinedRoom);
    socket.on('leftRoom', handleLeftRoom);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('messageDelete', handleMessageDeletedFromServer);
    socket.on("messageUpdated", (updatedMsg) => {
      setMessages(prev =>
        prev.map(m => m.id === updatedMsg.id ? updatedMsg : m)
      );
    });


    return () => {
      socket.emit('leaveRoom', channelId);
      socket.off('chatToClient', handleChat);
      socket.off('joinedRoom', handleJoinedRoom);
      socket.off('leftRoom', handleLeftRoom);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('messageDelete', handleMessageDeletedFromServer);
      socket.off('getOnlineUsers');
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
    };
  }, [channelId, users]);

  useEffect(() => {
    const fetchServer = async () => {
      const memberRes = await fetch(`${ENV.API_HTTP}/me/${serverId}`, { credentials: "include" });
      const memberData: Member = await memberRes.json();
      setMember(memberData);
      const res = await fetch(`${ENV.API_HTTP}/servers/${serverId}`, { credentials: "include" });
      const data = await res.json();
      setServer(data);
    };

    const fetchChannels = async () => {
      const res = await fetch(`${ENV.API_HTTP}/channels/`, { credentials: "include" });
      const data = await res.json();
      setChannels(data);
    };

    fetchServer();
    fetchChannels();
  }, [serverId]);

  useEffect(() => {
    if (!channelId) return;

    const fetchChannel = async () => {
      const res = await fetch(`${ENV.API_HTTP}/channels/${channelId}`, { credentials: "include" });
      setChannel(await res.json());
    };

    const fetchMembers = async () => {
      const res = await fetch(`${ENV.API_HTTP}/channels/${channelId}/members`, { credentials: "include" });
      setMembers(await res.json());
    };

    const fetchMessages = async () => {
      const res = await fetch(`${ENV.API_HTTP}/channels/${channelId}/messages`, { credentials: "include" });
      const data: Message[] = await res.json();
      setMessages(data);

      const userIds = Array.from(new Set(data.map(msg => msg.user_id)));
      const usersData: Record<string, User> = {};
      await Promise.all(userIds.map(async id => {
        try {
          const res = await fetch(`${ENV.API_HTTP}/auth/${id}`, { credentials: "include" });
          usersData[id] = await res.json();
          if (!res.ok) throw new Error("Erreur suppression serveur");
        } catch (err){
            console.error(err);
         }
      }));
      setUsers(usersData);
    };

    fetchChannel();
    fetchMembers();
    fetchMessages();
  }, [channelId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serverMenuRef.current && !serverMenuRef.current.contains(e.target as Node)) {
        setIsServerMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !joined) return;

    socketRef.current?.emit('chatToServer', {
      channel_id: channelId,
      message: newMessage,
      user_id: currentUserId
    });
    
    socketRef.current?.emit('stopTyping', { 
      channel_id: channelId, 
      user_id: currentUserId 
    });
    
    setNewMessage("");
  };

  const handleUpdateMessage = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!updateMessage.trim() || !joined) return;
    socketRef.current?.emit('messageUpdated', {
      message_id: id,
      channel_id: channelId,
      message: updateMessage,
      user_id: currentUserId
    });
    socketRef.current?.emit('stopTyping', { 
      channel_id: channelId, 
      user_id: currentUserId 
    });
    setContextMenu(null);
    setUpdateMessageOpen(false);
    setUpdateMessage("");
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!joined || !socketRef.current || !currentUserId) return;

    socketRef.current.emit('typing', { 
      channel_id: channelId, 
      user_id: currentUserId 
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stopTyping', { 
        channel_id: channelId, 
        user_id: currentUserId 
      });
    }, 2000);
  };

  const handleChangeUpdateMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateMessage(e.target.value);
    if (!joined || !socketRef.current || !currentUserId) return;

    socketRef.current.emit('typing', { 
      channel_id: channelId, 
      user_id: currentUserId 
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stopTyping', { 
        channel_id: channelId, 
        user_id: currentUserId 
      });
    }, 2000);
  };


  const handleDeleteChannel = async (id: string) => {
    if (!confirm("Supprimer ce channel ?")) return;
    try {
      const res = await fetch(`${ENV.API_HTTP}/channels/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Erreur suppression channel");

      const updatedChannels = channels.filter(c => c.id !== id);
      setChannels(updatedChannels);

      if (updatedChannels.length > 0) {
        window.location.href = `/chat/${serverId}/${updatedChannels[0].id}`;
      } else {
        window.location.href = `/chat/${serverId}`;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteServer = async () => {
    if (!confirm("Supprimer ce serveur ? Cette action est irréversible.")) return;
    try {
      const res = await fetch(`${ENV.API_HTTP}/servers/${serverId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Erreur suppression serveur");
      window.location.href = "/chat";
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuitServer = async () => {
    try {
      const res = await fetch(`${ENV.API_HTTP}/servers/${serverId}/leave`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Erreur quitter serveur");
      window.location.href = "/chat";
    } catch (err) {
      console.error(err);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleRightClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, msg: Message) => {
    if (msg.deleted)
      return;
    event.preventDefault();

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      messageId: msg.id
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!channelId || !currentUserId || !socketRef.current) return;

    socketRef.current.emit('messageDelete', { 
      message_id: messageId, 
      channel_id: channelId 
    });
    setContextMenu(null);
  };

  return (
    <div className="flex h-screen bg-[#0B1E27] font-sans text-white overflow-hidden">
      <Navbar />

      <div className="w-60 bg-[#0f2533] flex flex-col">
        <div className="relative" ref={serverMenuRef}>
          <div
            onClick={() => setIsServerMenuOpen(prev => !prev)}
            className="h-12 px-4 flex items-center justify-between border-b border-[#1a2f3a] shadow-md hover:bg-[#1a2f3a] cursor-pointer transition-colors select-none"
          >
            <h2 className="font-semibold">{server?.name ?? "Chargement..."}</h2>
            <svg className={`w-4 h-4 transition-transform ${isServerMenuOpen ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

          {isServerMenuOpen && (
            <div className="absolute left-2 right-2 mt-2 bg-[#0f2533] border border-[#1a2f3a] rounded-md shadow-lg z-50 overflow-hidden">
              {member?.role === "admin" &&(
                <button onClick={handleDeleteServer} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">🗑 Supprimer le serveur</button>
              )}
              <button onClick={handleQuitServer} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Quitter le serveur</button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <Link href={`/chat/${serverId}/addchannel`}>
            <div className="flex items-center justify-between px-2 mb-1 text-xs uppercase font-semibold text-gray-400 hover:text-gray-200 cursor-pointer">
              <span>Canaux textuels</span>
              <span className="text-lg leading-none">+</span>
            </div>
          </Link>

          {channels.map(c => (
            <Link key={c.id} href={`/chat/${serverId}/${c.id}`}>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#1a3544] cursor-pointer text-gray-400 hover:text-gray-100 transition-colors group">
                <span className="text-sm">{c.name}</span>
                {member?.role === "admin" &&(
                <button
                  onClick={e => { e.preventDefault(); handleDeleteChannel(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                >🗑</button>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className={`flex-1 flex flex-col ${bgColor}`}> {/*bg-[#132b3b] */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-[#1a2f3a] shadow-sm">
          <span className="font-semibold">{channel?.name ?? "Chargement..."}</span>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPalette((v) => !v)}
                className="w-5 h-5 mt-2 rounded bg-gray-700 hover:ring-2 hover:ring-[#40a4c4] transition"
                aria-label="Changer la couleur du fond"
              />

              {showPalette && (
                <div
                  className="absolute -right-1 -top-2 bg-[#0f1b22] border border-gray-700
                rounded-lg p-1 grid grid-cols-4 gap-3 z-50"
                >
                  {[
                    "bg-black",
                    "bg-white",
                    "bg-blue-900",
                    "bg-indigo-900",
                    
                    "bg-red-900",
                    "bg-slate-900",
                    "bg-zinc-900",
                    "bg-stone-900",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setBgColor(color);
                        setShowPalette(false);
                      }}
                      className={`w-4 h-4 rounded ${color} border border-white/20 hover:scale-110 transition`}
                    />
                  ))}
                </div>
              )}
            </div>
            {member?.role === "admin" && (
              <Link href={`/chat/${serverId}/addmember`}>
                <svg className="w-5 h-5 text-gray-400 hover:text-gray-100 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
        

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => {
            const user = users[msg.user_id];
            return (
              <div key={msg.id} onContextMenu={(e) => handleRightClick(e, msg)} className="flex gap-3 hover:bg-[#1a2f3a] px-2 py-1 rounded group">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white">{user?.name ?? "Utilisateur inconnu"}</span>
                    <span className="text-xs text-gray-500"> 
                      {new Date(msg.created_at).toLocaleString([], {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className={`mt-1 ${msg.deleted ? "text-gray-500 italic" : "text-gray-300"}`}>
                    {msg.deleted ? "Message supprimé" : msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          {contextMenu && !isUpdateMessageOpen && (
          <div
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
            }}
            className="bg-[#0f2533] border border-[#1a2f3a] rounded-md shadow-lg z-50 overflow-hidden"
          >
            <button
              onClick={() => {
                handleDeleteMessage(contextMenu.messageId);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              🗑 Supprimer le message
            </button>
            <button
              onClick={() => {setUpdateMessageOpen(true)}}
              className="w-full text-left px-4 py-2 text-sm text_white hover:bg-red-500/10"
            >
              ✏️ Modifier le message
            </button>
          </div>
          
        )}

        {contextMenu && isUpdateMessageOpen && (
          <div
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
            }}
            className="bg-[#0f2533] border border-[#1a2f3a] rounded-md shadow-lg z-50 overflow-hidden"
          >
            <form
              onSubmit={(e) => handleUpdateMessage(e, contextMenu.messageId)}
            >
            <input
              type="text"
              value={updateMessage}
              onChange={handleChangeUpdateMessage}
              placeholder="Entrer un message dans le canal"
              className="w-full bg-transparent outline-none text-white placeholder-gray-500"
            />
            {updateMessage.trim() && (
              <button type="submit" className="text-[#40a4c4] hover:text-[#5bb4d4] transition-colors">
                Envoyer
              </button>
            )}
          </form>
          </div>
        )}

          <div className="text-xs text-gray-400 h-4">
            {Object.keys(typingUsers).length > 0 && (() => {
              const typingNames = Object.keys(typingUsers).map(id => users[id]?.name || "Quelqu'un");
              return `${typingNames.join(', ')} ${typingNames.length > 1 ? "sont" : "est"} en train d'écrire...`;
            })()}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 pb-6 relative">
          <div className="bg-[#1a3544] rounded-lg px-4 py-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Entrer un message dans le canal"
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
              value={newMessage}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage(e as any);
              }}
            />

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded text-gray-400 hover:text-white hover:bg-white/10 transition"
                  aria-label="Ajouter un emoji"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full mb-2 right-0 z-50"
                  >
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      width={350}
                      height={400}
                      theme="dark"
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => handleSendMessage(e as any)}
                className="p-2 rounded text-gray-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Envoyer le message"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-60 bg-[#0f2533] overflow-y-auto">
        <div className="p-4">
          <div className="text-xs uppercase font-semibold text-gray-400 mb-2">En ligne</div>
          {members
            .filter(m => onlineUsers.has(m.id))
            .map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#1a3544] cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#40a4c4] flex items-center justify-center text-sm font-semibold">{String.fromCharCode(65 + i)}</div>
                <span className="text-sm text-gray-300">{m.name}</span>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
