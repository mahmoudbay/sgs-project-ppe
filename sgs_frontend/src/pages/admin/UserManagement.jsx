import React, { useState, useEffect } from "react";
import { Plus, Users } from "lucide-react";

export default function UserManagement({ api, user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "employe",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sends data to the signup route defined in your backend index.js
      await api.post("/auth/signup", formData);
      fetchUsers();
      setShowForm(false);
      setFormData({ nom: "", prenom: "", email: "", password: "", role: "employe" });
      alert("Utilisateur créé avec succès !");
    } catch (error) {
      alert(error.response?.data?.error || "Erreur lors de l'enregistrement");
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Création et gestion des accès au système</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          {showForm ? "Fermer" : "Nouvel Utilisateur"}
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Créer un compte</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de Passe temporaire</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Administrateur</option>
                <option value="employe">Employé (Enseignant)</option>
                <option value="service_financier">Service Financier</option>
                <option value="surveillant_general">Surveillant Général</option>
                <option value="direction">Direction</option>
              </select>
            </div>

            <button type="submit" className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium mt-4">
              Créer l'utilisateur
            </button>
          </form>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-semibold text-sm text-gray-900">Utilisateur</th>
              <th className="px-6 py-3 font-semibold text-sm text-gray-900">Email</th>
              <th className="px-6 py-3 font-semibold text-sm text-gray-900">Rôle</th>
              <th className="px-6 py-3 font-semibold text-sm text-gray-900">Statut</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {u.initiales || "U"}
                  </div>
                  <span className="font-medium text-gray-900">{u.prenom} {u.nom}</span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium capitalize">
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.actif ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {u.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
