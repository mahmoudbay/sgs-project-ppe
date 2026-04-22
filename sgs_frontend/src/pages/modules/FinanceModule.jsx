import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Plus, List, BarChart3 } from "lucide-react";

export default function FinanceModule({ user, api, hasPermission }) {
  const location = useLocation();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ revenue: 0, expenses: 0 });

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/operations");
      setOperations(response.data);
      calculateBalance(response.data);
    } catch (error) {
      console.error("Error fetching operations:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalance = (ops) => {
    const revenue = ops
      .filter((o) => o.type === "revenue")
      .reduce((sum, o) => sum + o.montant, 0);
    const expenses = ops
      .filter((o) => o.type === "expense")
      .reduce((sum, o) => sum + o.montant, 0);
    setBalance({ revenue, expenses });
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion Financière</h1>
        <p className="text-gray-600 mt-2">Suivi des revenus et des dépenses de l'établissement</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <Link to="list" className={`px-4 py-3 font-medium border-b-2 transition ${isActive("list") ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-gray-900"}`}>
          <List className="inline mr-2" size={18} /> Opérations
        </Link>
        <Link to="new" className={`px-4 py-3 font-medium border-b-2 transition ${isActive("new") ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-gray-900"}`}>
          <Plus className="inline mr-2" size={18} /> Nouvelle Opération
        </Link>
        <Link to="report" className={`px-4 py-3 font-medium border-b-2 transition ${isActive("report") ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-gray-900"}`}>
          <BarChart3 className="inline mr-2" size={18} /> Bilan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Revenus Totaux</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{balance.revenue.toFixed(2)} DH</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Dépenses Totales</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{balance.expenses.toFixed(2)} DH</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">Solde</p>
          <p className={`text-3xl font-bold mt-2 ${balance.revenue - balance.expenses >= 0 ? "text-green-600" : "text-red-600"}`}>
            {(balance.revenue - balance.expenses).toFixed(2)} DH
          </p>
        </div>
      </div>

      <Routes>
        <Route path="list" element={<OperationsList operations={operations} loading={loading} />} />
        <Route path="new" element={<NewOperation api={api} user={user} onSuccess={fetchOperations} />} />
        <Route path="report" element={<FinanceReport balance={balance} />} />
      </Routes>
    </div>
  );
}

function NewOperation({ api, user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ type: "revenue", categorie: "", montant: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/operations", { ...formData, montant: parseFloat(formData.montant), saisie_par: user.id });
      onSuccess();
      alert("Opération enregistrée avec succès");
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-lg">
      <h2 className="text-xl font-bold">Nouvelle Opération</h2>
      <input type="number" placeholder="Montant (DH)" className="w-full border p-2 rounded" value={formData.montant} onChange={(e) => setFormData({ ...formData, montant: e.target.value })} required />
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
        {loading ? "Enregistrement..." : "Enregistrer l'Opération"}
      </button>
    </form>
  );
}

function OperationsList({ operations, loading }) {
  if (loading) return <div className="text-center py-8">Chargement...</div>;
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr><th className="px-6 py-3">Type</th><th className="px-6 py-3">Montant</th><th className="px-6 py-3">Statut</th></tr>
        </thead>
        <tbody>
          {operations.map((op) => (
            <tr key={op.id} className="border-b">
              <td className="px-6 py-4 capitalize">{op.type}</td>
              <td className={`px-6 py-4 font-bold ${op.type === "revenue" ? "text-green-600" : "text-red-600"}`}>{op.montant} DH</td>
              <td className="px-6 py-4">{op.statut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FinanceReport({ balance }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Bilan Financier</h2>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Exporter en PDF</button>
    </div>
  );
}
