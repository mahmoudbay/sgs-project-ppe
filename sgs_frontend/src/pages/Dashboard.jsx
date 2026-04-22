import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  DollarSign,
  BookOpen,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader,
} from "lucide-react";

export default function Dashboard({ user, api, hasPermission }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [api]);

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% ce mois
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.prenom} !
        </h1>
        <p className="text-gray-600 mt-2">
          Voici un aperçu de votre système de gestion scolaire
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hasPermission("gestion_comptes") && (
          <StatCard
            icon={Users}
            label="Utilisateurs Actifs"
            value={stats?.activeUsers || 0}
            color="bg-blue-500"
            trend={stats?.usersTrend}
          />
        )}

        {hasPermission("gestion_financiere") && (
          <StatCard
            icon={DollarSign}
            label="Revenus Mensuels"
            value={`${stats?.monthlyRevenue || 0} DH`}
            color="bg-green-500"
            trend={stats?.revenueTrend}
          />
        )}

        {hasPermission("dossiers_eleves") && (
          <StatCard
            icon={BookOpen}
            label="Élèves Inscrits"
            value={stats?.totalStudents || 0}
            color="bg-purple-500"
          />
        )}

        {hasPermission("generation_certificats") && (
          <StatCard
            icon={FileText}
            label="Certificats Générés"
            value={stats?.certificatesGenerated || 0}
            color="bg-orange-500"
            trend={stats?.certificateTrend}
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Requests */}
        {hasPermission("demande_rh") && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Demandes Récentes
            </h2>
            <div className="space-y-4">
              {stats?.recentRequests?.length > 0 ? (
                stats.recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {request.type.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.employeeName}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        request.statut === "approuvé"
                          ? "bg-green-100 text-green-800"
                          : request.statut === "rejeté"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.statut}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucune demande récente
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions (FIXED BUTTONS) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Actions Rapides
          </h2>
          <div className="space-y-3">
            {hasPermission("demande_rh") && (
              <button 
                onClick={() => navigate("/rh/new")}
                className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
              >
                Nouvelle Demande RH
              </button>
            )}
            {hasPermission("gestion_financiere") && (
              <button 
                onClick={() => navigate("/finance/new")}
                className="w-full px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium text-sm"
              >
                Enregistrer Opération
              </button>
            )}
            {hasPermission("dossiers_eleves") && (
              <button 
                onClick={() => navigate("/school-life/students")}
                className="w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-medium text-sm"
              >
                Consulter Dossier
              </button>
            )}
            {hasPermission("generation_certificats") && (
              <button 
                onClick={() => navigate("/documents/certificates")}
                className="w-full px-4 py-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition font-medium text-sm"
              >
                Générer Certificat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          État du Système
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Base de Données</p>
              <p className="font-medium text-gray-900">Connectée</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">API MASSAR</p>
              <p className="font-medium text-gray-900">Synchronisée</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Serveur</p>
              <p className="font-medium text-gray-900">Opérationnel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
