"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ENV } from "../../config/env";

type Server = {
  id: string;
  name: string;
};

export default function Navbar() {
  const [servers, setServers] = useState<Server[]>([]);
  const params = useParams<{ serverId: string }>();
  const serverId = params?.serverId || "";

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch(`${ENV.API_HTTP}/servers`, {credentials: "include"});
        const data = await res.json();
        
        
        if (Array.isArray(data)) {
          setServers(data);
        } else {
          console.error("API response is not an array:", data);
          setServers([]); 
        }
      } catch (err) {
        console.error("Erreur fetch :", err);
        setServers([]); 
      }
    };

    fetchServers();
  }, []);

  return (
    <div className="flex flex-col items-center w-[72px] bg-[#0B1E27] py-3 gap-2 overflow-y-auto scrollbar-hide">
      
      <div className="relative group mb-2">
        <Link href="/chat/prive">
          <div className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-300 overflow-hidden cursor-pointer bg-[#40a4c4] flex items-center justify-center">
            <Image
              src="/logoTalkme.png"
              alt="Logo Talkme"
              width={32}
              height={32}
            />
          </div>
        </Link>
        <div className="absolute left-0 w-1 h-0 group-hover:h-5 bg-white rounded-r transition-all duration-300 top-1/2 -translate-y-1/2 -translate-x-2" />
      </div>

      <div className="w-8 h-[2px] bg-[#1a2f3a] mb-2" />

      {Array.isArray(servers) && servers.map((server) => (
        <div key={server.id} className="relative group">
          <Link href={`/chat/${server.id}`}>
            <div className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-300 bg-[#2C3E50] hover:bg-[#40a4c4] cursor-pointer flex items-center justify-center text-lg font-semibold text-white">
              {server.name[0]}
            </div>
          </Link>

          <div className="absolute left-0 w-1 h-0 group-hover:h-5 bg-white rounded-r transition-all duration-300 top-1/2 -translate-y-1/2 -translate-x-2" />
        </div>
      ))}

      <Link href="/chat/addservers">
        <div className="relative group mt-2">
          <div className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-300 bg-[#1a2f3a] hover:bg-[#2ecc71] cursor-pointer flex items-center justify-center text-[#2ecc71] group-hover:text-white text-2xl font-light">
            +
          </div>
        </div>
      </Link>
    </div>
  );
}