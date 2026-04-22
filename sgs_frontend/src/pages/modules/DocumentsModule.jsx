import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { FileText, BarChart3, Upload, TrendingUp, Users, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

export default function DocumentsModule({ user, api, hasPermission }) {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/resultats");
      setResults(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{"Documents Scolaires"}</h1>
      <div className="flex gap-4 border-b border-gray-200">
        <Link to="/documents/results" className="px-4 py-3 font-medium text-blue-600 border-b-2 border-blue-600">{"Résultats & Insights"}</Link>
      </div>
      <Routes>
        <Route index element={<Navigate to="results" replace />} />
        <Route path="results" element={<ResultsManagement results={results} api={api} onRefresh={fetchDocuments} loading={loading} />} />
      </Routes>
    </div>
  );
}

function ResultsManagement({ results, api, onRefresh, loading }) {
  const [trimester, setTrimester] = useState("1");
  const [niveau, setNiveau] = useState("1AC");
  const [uploading, setUploading] = useState(false);

  // Filter logic: Show only the selected level AND selected trimester
  const filtered = results.filter(r => r.trimestre === parseInt(trimester) && r.niveau === niveau);

  // Stats Calculations
  const total = filtered.length;
  const avg = total > 0 ? (filtered.reduce((acc, curr) => acc + parseFloat(curr.moyenne_generale), 0) / total).toFixed(2) : "0.00";
  const success = total > 0 ? ((filtered.filter(r => parseFloat(r.moyenne_generale) >= 10).length / total) * 100).toFixed(1) : "0";

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setUploading(true);
        const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        
        const processed = data.map(row => {
          const getVal = (keyName) => {
            const val = row[keyName];
            return val ? parseFloat(String(val).replace(',', '.')) || 0 : 0;
          };

          const subjects = [
            getVal('Mathematiques'), getVal('Physique-Chimie'), getVal('SVT'),
            getVal('Francais'), getVal('Arabe'), getVal('Anglais'),
            getVal('Histoire-Geographie'), getVal('Education Islamique'),
            getVal('Informatique'), getVal('EPS'), getVal('Musique'), getVal('Art')
          ];
          
          const validGrades = subjects.filter(v => v > 0);
          const moy = validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2) : 0;

          return {
            massar_id: String(row['ID'] || "N/A"),
            eleve_name: `${row['Prenom'] || ""} ${row['Nom'] || ""}`.trim(),
            niveau: niveau, // Attaches the selected level to the data
            trimestre: parseInt(trimester),
            maths: subjects[0], physique: subjects[1], svt: subjects[2],
            francais: subjects[3], arabe: subjects[4], anglais: subjects[5],
            histoire_geo: subjects[6], education_islamique: subjects[7],
            informatique: subjects[8], eps: subjects[9], musique: subjects[10], art: subjects[11],
            moyenne_generale: moy
          };
        });

        await api.post("/resultats/upload", { resultats: processed });
        alert("Succès ! Données importées pour " + niveau);
        onRefresh();
      } catch (err) { alert("Erreur: " + (err.response?.data?.error || err.message)); }
      finally { setUploading(false); e.target.value = null; }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      {/* Selection & Upload Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-wrap gap-6 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase">{"Niveau"}</label>
            <select value={niveau} onChange={e => setNiveau(e.target.value)} className="border p-2 rounded-lg font-medium">
              <option value="1AC">{"1ère Année (1AC)"}</option>
              <option value="2AC">{"2ème Année (2AC)"}</option>
              <option value="3AC">{"3ème Année (3AC)"}</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase">{"Trimestre"}</label>
            <select value={trimester} onChange={e => setTrimester(e.target.value)} className="border p-2 rounded-lg font-medium">
              <option value="1">{"Trimestre 1"}</option>
              <option value="2">{"Trimestre 2"}</option>
              <option value="3">{"Trimestre 3"}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
            <input type="file" onChange={handleFileUpload} className="hidden" id="excel-up" />
            <label htmlFor="excel-up" className="bg-blue-600 text-white px-6 py-3 rounded-xl cursor-pointer font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200">
              {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
              {uploading ? "Importation..." : "Importer Excel"}
            </label>
        </div>
      </div>

      {/* Insights Dashboard */}
      {total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-lg"><Users size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{"Élèves"}</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{"Moyenne Classe"}</p>
              <p className="text-2xl font-bold text-purple-700">{avg}{" / 20"}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-lg"><BarChart3 size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{"Réussite (>=10)"}</p>
              <p className="text-2xl font-bold text-green-600">{success}{"%"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-bold border-b uppercase text-xs">
            <tr>
              <th className="px-6 py-4">{"Nom Complet"}</th>
              <th className="px-4 py-4 text-center">{"Math"}</th>
              <th className="px-4 py-4 text-center">{"Phys"}</th>
              <th className="px-4 py-4 text-center">{"SVT"}</th>
              <th className="px-4 py-4 text-center">{"Arabe"}</th>
              <th className="px-6 py-4 text-center">{"Moyenne"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan="6" className="text-center py-20 font-medium text-gray-400">{"Chargement des données..."}</td></tr>
            ) : filtered.length > 0 ? (
              filtered.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900">{r.eleve_name}</td>
                  <td className="px-4 py-4 text-center">{r.maths}</td>
                  <td className="px-4 py-4 text-center">{r.physique}</td>
                  <td className="px-4 py-4 text-center">{r.svt}</td>
                  <td className="px-4 py-4 text-center">{r.arabe}</td>
                  <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-black text-sm ${parseFloat(r.moyenne_generale) >= 10 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                          {r.moyenne_generale}
                      </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center py-20 text-gray-400">{"Aucun résultat trouvé pour ce niveau et ce trimestre."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CertificatesManagement() {
  return <div className="p-10 text-center text-gray-400">{"Module certificats en cours..."}</div>;
}
