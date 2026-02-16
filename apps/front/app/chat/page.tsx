"use client";

import Image from "next/image";
import Navbar from "./navbar/page";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ENV } from "../config/env";

type Server = {
  id: string;
  name: string;
};

type Channel = {
  id: string;
  name: string;
};

export default function ChatPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <div className="flex h-screen bg-[#0B1E27] font-sans text-white overflow-hidden">
      <Navbar />
      <div className="w-60 bg-[#0B1E27] flex flex-col">
        <div className="h-12 px-4 flex items-center justify-between border-b border-[#1a2f3a] shadow-md hover:bg-[#1a2f3a] cursor-pointer transition-colors">
          <h2 className="font-semibold">Aucun server selectionné</h2>

          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 mb-1 text-xs uppercase font-semibold text-gray-400 hover:text-gray-200 cursor-pointer">
              <span>Canaux textuels</span>
              <span className="text-lg leading-none">+</span>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE CENTRALE */}
      <div className="flex-1 flex flex-col bg-[#132b3b]">
        <div className="h-12 px-4 flex items-center justify-between border-b border-[#1a2f3a] shadow-sm">
          <div className="flex items-center gap-9">
            <span className="font-semibold">général</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-gray-400 text-center text-sm">
            Les messages tomberont ici.
          </div>
        </div>
        <div className="px-4 pb-6 relative">
          <div className="bg-[#1a3544] rounded-lg px-4 py-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Entrer un message dans le canal"
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />

            <button
              type="button"
              onClick={handleSendMessage}
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
      <div className="w-60 bg-[#0f2533] overflow-y-auto">
        <div className="p-4">
          <div className="mb-4">
            <div className="text-xs uppercase font-semibold text-gray-400 mb-2">
              En ligne — 1
            </div>
          </div>

          <div>
            <div className="text-xs uppercase font-semibold text-gray-400 mb-2">
              Hors ligne — 1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
