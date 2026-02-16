"use client";
import Navbar from "../navbar/page";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ENV } from "../../config/env";


type Server = {
  id: number;
  name: string;
}

export default function AddServers({params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [serverName, setServerName] = useState("");
  const [loading, setLoading] = useState(false);
  const { serverId } = use(params);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch(`${ENV.API_HTTP}/servers`, {credentials: "include"});
        const data = await res.json();
        setServers(data);
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
      const res = await fetch(`${ENV.API_HTTP}/servers`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: serverName,
        }),
      });

      if (res.ok) {
        router.push("/chat");
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
          <h2 className="text-2xl font-bold mb-6 text-center">Nouveau serveur</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="serverName" className="block text-sm font-semibold text-gray-300 mb-2">
                Nom du server
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                <input
                  id="serverName"
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="entrez le nom de votre serveur"
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
                disabled={loading || !serverName}
                className="flex-1 px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Création..." : "Créer le serveur"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}