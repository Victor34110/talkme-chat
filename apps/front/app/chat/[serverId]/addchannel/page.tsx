"use client";
import Navbar from "../../navbar/page";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ENV } from "../../../config/env";

type Channel = {
  id: number;
  name: string;
}

export default function AddChannel({params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelName, setChannelName] = useState("");
  const [loading, setLoading] = useState(false);
  const { serverId } = use(params);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch(`${ENV.API_HTTP}/servers/${serverId}/channels`,{credentials: "include"});
        const data = await res.json();
        setChannels(data);
      } catch (err) {
        console.error("Erreur fetch :", err);
      }
    };

    fetchChannels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${ENV.API_HTTP}/servers/${serverId}/channels`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: channelName,
        }),
      });

      if (res.ok) {
        router.push(`/chat/${serverId}`);
      }
    } catch (err) {
      console.error("Erreur lors de la création du channel:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B1E27] font-sans text-white overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col bg-[#132b3b] items-center justify-center p-8">
        <div className="w-full max-w-md bg-[#0f2533] rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Créer un nouveau canal</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="channelName" className="block text-sm font-semibold text-gray-300 mb-2">
                Nom du canal
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                <input
                  id="channelName"
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="nouveau-canal"
                  className="w-full bg-[#1a3544] rounded-lg pl-8 pr-4 py-3 outline-none text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-lg hover:bg-[#1a3544] transition-colors text-sm font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !channelName}
                className="flex-1 px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Création..." : "Créer le canal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}