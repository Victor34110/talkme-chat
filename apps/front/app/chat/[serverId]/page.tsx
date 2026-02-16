"use client";
import Image from 'next/image'
import Navbar from '../navbar/page';
import Link from "next/link";
import { use, useEffect, useState, useRef } from "react";
import { ENV } from "../../config/env";

type Server = {
  id: string;
  name: string;
};

type Channel = {
  id: string;
  name: string;
}
type Member = { role:string } | null;

export default function ChatPage({params,}: {
  params: Promise<{ serverId: string }>;
}) {
  const [server, setServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const serverMenuRef = useRef<HTMLDivElement | null>(null);
  const { serverId } = use(params);
  const [member, setMember] = useState<Member | null>(null);


  useEffect(() => {

    if (!serverId) return;

    const fetchServer = async () => {
      const memberRes = await fetch(`${ENV.API_HTTP}/me/${serverId}`, { credentials: "include" });
      const memberData: Member = await memberRes.json();
      setMember(memberData);
      const res = await fetch(`${ENV.API_HTTP}/servers/${serverId}`, {credentials: "include"});
      const data = await res.json();
      setServer(data);
    };

    const fetchChannel = async () => {
      const res = await fetch(`${ENV.API_HTTP}/channels`, {credentials: "include"});
      const data = await res.json();
      setChannels(data);
    };

    fetchServer();
    fetchChannel();
  }, [serverId]);

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm("Supprimer ce channel ?")) return;

    try {
      const res = await fetch(`${ENV.API_HTTP}/channels/${channelId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erreur suppression channel");

      setChannels(prev => prev.filter(c => c.id !== channelId));

      if (channels.length > 1) {
        const nextChannel = channels.find(c => c.id !== channelId);
        if (nextChannel) {
          window.location.href = `/chat/${serverId}/${nextChannel.id}`;
        }
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteServer = async () => {
      if (!serverId) return;
      if (!confirm("Supprimer ce serveur ? Cette action est irréversible.")) return;

      try {
        const res = await fetch(`${ENV.API_HTTP}/servers/${serverId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Erreur suppression serveur");

        window.location.href = "/chat";
      } catch (err) {
        console.error(err);
      }
    };

  const handleQuitServer = async () => {
      if (!serverId) return;
      try {
        const res = await fetch(`${ENV.API_HTTP}/servers/${serverId}/leave`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Erreur quitterserveur");

        window.location.href = "/chat";
      } catch (err) {
        console.error(err);
      }
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
            <svg className={`w-4 h-4 transition-transform ${ isServerMenuOpen ? "rotate-180" : "" }`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

          {isServerMenuOpen && (
            <div className="absolute left-2 right-2 mt-2 bg-[#0f2533] border border-[#1a2f3a] rounded-md shadow-lg z-50 overflow-hidden">
              {member?.role === "admin" &&(
              <button
                onClick={handleDeleteServer}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                🗑 Supprimer le serveur
              </button>
              )}
              <button
                onClick={handleQuitServer}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                quitter le serveur
              </button>
            </div>
          )}
        </div>


        <div className="flex-1 overflow-y-auto px-2 py-3">

          <div className="mb-4">
            <Link
              href={`/chat/${serverId}/addchannel`}
            >
            <div className="flex items-center justify-between px-2 mb-1 text-xs uppercase font-semibold text-gray-400 hover:text-gray-200 cursor-pointer">
              <span>Canaux textuels</span>
              <span className="text-lg leading-none">+</span>
            </div>
            </Link>
            {Array.isArray(channels) && channels.map((channel, i) => (
              
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#1a3544] cursor-pointer text-gray-400 hover:text-gray-100 transition-colors group"
              >

                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20L3 4m18 16l-4-16M9 4h10M5 20h10" />
                </svg>
                <Link href={`/chat/${serverId}/${channel.id}`}>
                  <span className="text-sm">{channel.name}</span>
                  {member?.role === "admin" &&(
                  <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteChannel(channel.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                >
                  🗑
                </button>
                  )}
                </Link>
              </div>
            ))}
          </div>
          <div>
          
          </div>
        </div>
        
          
      </div>

      <div className="flex-1 flex flex-col bg-[#132b3b]">

        <div className="h-12 px-4 flex items-center justify-between border-b border-[#1a2f3a] shadow-sm">
          <div className="flex items-center gap-2">

            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}  />
            </svg>
            <span className="font-semibold">général</span>
          </div>
          <div className="flex items-center gap-4">

            <svg className="w-5 h-5 text-gray-400 hover:text-gray-100 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {member?.role === "admin" && (
            <Link href={`/chat/${serverId}/addmember`}>
              <svg className="w-5 h-5 text-gray-400 hover:text-gray-100 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Link>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-gray-400 text-center text-sm">
            choisis un channel
          </div>
        </div>


        <div className="px-4 pb-6">
          <div className="bg-[#1a3544] rounded-lg px-4 py-3">
            <input
              type="text"
              placeholder="entrer un message dans le canal"
              className="w-full bg-transparent outline-none text-white placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="w-60 bg-[#0f2533] overflow-y-auto">
        <div className="p-4">
          
          <div className="mb-4">
            <div className="text-xs uppercase font-semibold text-gray-400 mb-2">
              En ligne — 1
            </div>
            {[...Array(1)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#1a3544] cursor-pointer group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#40a4c4] flex items-center justify-center text-sm font-semibold">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#2ecc71] rounded-full border-2 border-[#0f2533]"></div>
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Membre {i + 1}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-gray-400 mb-2">
              Hors ligne — 1
            </div>
            {[...Array(1)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#1a3544] cursor-pointer group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#2C3E50] flex items-center justify-center text-sm font-semibold text-gray-500">
                    {String.fromCharCode(70 + i)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#7f8c8d] rounded-full border-2 border-[#0f2533]"></div>
                </div>
                <span className="text-sm text-gray-500 group-hover:text-gray-400">Membre {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}