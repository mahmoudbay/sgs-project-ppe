import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { Plus, List, Clock } from "lucide-react";

export default function RHModule({ user, api, hasPermission }) {
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/demandes-rh");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching HR requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ressources Humaines</h1>
        <p className="text-gray-600 mt-2">Gestion des demandes administratives du personnel</p>
      </div>

      {/* Navigation Tabs with Absolute Paths */}
      <div className="flex gap-4 border-b border-gray-200">
        <Link to="/rh/list" className={`px-4 py-3 font-medium border-b-2 transition ${isActive("list") ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-gray-900"}`}>
          <List className="inline mr-2" size={18} /> Mes Demandes
        </Link>
        {hasPermission("demande_rh") && (
          <Link to="/rh/new" className={`px-4 py-3 font-medium border-b-2 transition ${isActive("new") ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-gray-900"}`}>
            <Plus className="inline mr-2" size={18} /> Nouvelle Demande
          </Link>
        )}
        {hasPermission("validation_demande_rh") && (
          <Link to="/rh/validation" className={`px-4 py-3 font-medium border-b-2 transition ${isActive("validation") ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-gray-900"}`}>
            <Clock className="inline mr-2" size={18} /> À Valider
          </Link>
        )}
      </div>

      <Routes>
        {/* THIS IS THE FIX: Automatically redirects the blank /rh page to /rh/list */}
        <Route index element={<Navigate to="list" replace />} />
        
        <Route path="list" element={<RHRequestsList requests={requests} loading={loading} />} />
        <Route path="new" element={<NewRHRequest api={api} user={user} onSuccess={fetchRequests} />} />
        <Route path="validation" element={<RHValidation requests={requests} api={api} onRefresh={fetchRequests} />} />
      </Routes>
    </div>
  );
}

// === THE FORM COMPONENT ===
function NewRHRequest({ api, user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "attestation_travail",
    date_debut: "",
    date_fin: "",
    motif: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/demandes-rh", { ...formData, employe_id: user.id });
      onSuccess();
      alert("Demande soumise avec succès");
      setFormData({ type: "attestation_travail", date_debut: "", date_fin: "", motif: "" });
    } catch (error) {
      alert("Erreur lors de la soumission");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">Nouvelle Demande</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type de Demande</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="attestation_travail">Attestation de Travail</option>
          <option value="conge_maladie">Congé Maladie</option>
          <option value="conge_exceptionnel">Congé Exceptionnel</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Début</label>
          <input
            type="date"
            required
            value={formData.date_debut}
            onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Fin</label>
          <input
            type="date"
            required
            value={formData.date_fin}
            onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Motif</label>
        <textarea
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="Décrivez le motif de votre demande..."
          value={formData.motif}
          onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
          required
        />
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
        {loading ? "Envoi en cours..." : "Soumettre la Demande"}
      </button>
    </form>
  );
}

// === LIST COMPONENT ===
function RHRequestsList({ requests, loading }) {
  if (loading) return <div className="text-center py-8">Chargement...</div>;
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Période</th>
            <th className="px-6 py-3">Statut</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b hover:bg-gray-50 transition">
              <td className="px-6 py-4 capitalize">{req.type.replace("_", " ")}</td>
              <td className="px-6 py-4 text-gray-600">
                {new Date(req.date_debut).toLocaleDateString("fr-FR")} au {new Date(req.date_fin).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.statut === "approuvé" ? "bg-green-100 text-green-800" : req.statut === "rejeté" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {req.statut}
                </span>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr><td colSpan="3" className="text-center py-8 text-gray-500">Aucune demande trouvée.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// === VALIDATION COMPONENT ===
function RHValidation({ requests, api, onRefresh }) {
  const pending = requests.filter((r) => r.statut === "en attente");

  const handleAction = async (id, status) => {
    try {
      await api.put(`/demandes-rh/${id}`, { statut: status });
      onRefresh();
    } catch (error) {
      alert("Erreur lors de la validation");
    }
  };

  return (
    <div className="space-y-4">
      {pending.map((req) => (
        <div key={req.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="font-bold capitalize">{req.type.replace("_", " ")}</h3>
          <p className="text-sm text-gray-600 mt-2">{req.motif}</p>
          <p className="text-xs text-gray-500 mt-1">
            Période: {new Date(req.date_debut).toLocaleDateString("fr-FR")} - {new Date(req.date_fin).toLocaleDateString("fr-FR")}
          </p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => handleAction(req.id, "approuvé")} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Approuver</button>
            <button onClick={() => handleAction(req.id, "rejeté")} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Rejeter</button>
          </div>
        </div>
      ))}
      {pending.length === 0 && <div className="text-center py-8 text-gray-500">Aucune demande en attente</div>}
    </div>
  );
}
