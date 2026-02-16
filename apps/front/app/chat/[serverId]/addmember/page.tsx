"use client";
import Navbar from "../../navbar/page";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ENV } from "../../../config/env";

type Member = {
  id: string;
  name: string;
  serverId: string;
  userId: string;
  role: string;
  ban: boolean;
  unban: Date | null;
  add_at: Date;
}

type User = {
  id: string;
  name: string;
}

export default function AddMember({params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const {serverId} = use(params);
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]); 
  const [selectedUserId, setSelectedUserId] = useState(""); 
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

useEffect(() => {
  if (!serverId) return;
  const fetchUsers = async () => {
    try {
      const [authRes, serverRes] = await Promise.all([
        fetch(`${ENV.API_HTTP}/auth`, {
          credentials: "include",
        }),
        fetch(`${ENV.API_HTTP}/servers/${serverId}/members`, {
          credentials: "include",
        }),
      ]);

      if (!authRes.ok || !serverRes.ok) {
        throw new Error("Failed to fetch users");
      }
      const authData = await authRes.json();
      const serverData = await serverRes.json();

      const allUsers: User[] =
        authData.users ?? (Array.isArray(authData) ? authData : []);

      const serverUsers: User[] =
        serverData.users ?? (Array.isArray(serverData) ? serverData : []);

      const serverUserIds = new Set(serverUsers.map(user => user.id));

      setUsers(allUsers.filter(user => !serverUserIds.has(user.id)));

    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Erreur fetch users:", err);
      }
    }
  };

  fetchUsers();
}, [serverId]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");


    try {
      const payload = {
        user_id: selectedUserId,
        role: role,
        serverId: serverId
      };
      const url = `${ENV.API_HTTP}/servers/${serverId}/join`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      
      const responseText = await res.text();

      if (res.ok) {
        router.push(`/chat/${serverId}`);
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B1E27] font-sans text-white overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col bg-[#132b3b] items-center justify-center p-8">
        <div className="w-full max-w-md bg-[#0f2533] rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Ajouter un membre</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="userId" className="block text-sm font-semibold text-gray-300 mb-2">
                Utilisateur
              </label>
              <select
                id="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-[#1a3544] rounded-lg px-4 py-3 outline-none text-white focus:ring-2 focus:ring-blue-500 transition-all"
                required
              >
                
                <option value="">Sélectionnez un utilisateur</option>
                {users.length === 0 && <option disabled>Chargement...</option>}
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-300 mb-2">
                Rôle
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#1a3544] rounded-lg px-4 py-3 outline-none text-white focus:ring-2 focus:ring-blue-500 transition-all"
                required
              >
                <option value="member">Membre</option>
                <option value="admin">Admin</option>
                <option value="moderator">Modérateur</option>
              </select>
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
                disabled={loading || !selectedUserId}
                className="flex-1 px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Ajout..." : "Ajouter le membre"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}