import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { FileText, BarChart3, Upload, TrendingUp, Users, Loader2, Printer, Save } from "lucide-react";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import { DataTable } from "../../components/ui/DataTable";
import { pushToast } from "../../components/Notifications";

const SUBJECTS = [
  { key: "maths", labelKey: "documents.math" },
  { key: "physique", labelKey: "documents.physics" },
  { key: "svt", labelKey: "documents.svtShort" },
  { key: "francais", labelKey: "documents.fr" },
  { key: "arabe", labelKey: "documents.ar" },
  { key: "anglais", labelKey: "documents.anglais" },
  { key: "histoire_geo", labelKey: "documents.histoireGeo" },
  { key: "education_islamique", labelKey: "documents.educationIslamique" },
  { key: "informatique", labelKey: "documents.informatique" },
  { key: "eps", labelKey: "documents.eps" },
  { key: "musique", labelKey: "documents.musique" },
  { key: "art", labelKey: "documents.arts" },
];

function computeAverage(grades) {
  const vals = SUBJECTS.map(s => parseFloat(grades[s.key]) || 0).filter(v => v > 0);
  return vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
}

export default function DocumentsModule({ user, api, hasPermission }) {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path) => location.pathname.includes(path);
  const isRoot = location.pathname === "/documents" || location.pathname === "/documents/";

  return (
    <div className="min-h-full bg-gray-50 animate-fade-in">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('documents.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('documents.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            {hasPermission(["grades:manage", "students:read"]) && (
              <Link to="/documents/results"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("results") ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}><BarChart3 size={16} /> {t('documents.results')}</Link>
            )}
            {hasPermission("certificates:generate") && (
              <Link to="/documents/certificates"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("certificates") ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}><FileText size={16} /> {t('documents.certificates')}</Link>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        {isRoot && (
          <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "📜", label: t('documents.certificate'), bg: "bg-red-50", link: "/documents/certificates" },
                { icon: "📊", label: t('documents.reportCard'), bg: "bg-blue-50", link: "/documents/results" },
                { icon: "📈", label: t('documents.analysis'), bg: "bg-emerald-50", link: "/documents/results" },
                { icon: "🏆", label: t('documents.ranking'), bg: "bg-amber-50", link: "/documents/results" },
              ].map((item, i) => (
                <Link key={i} to={item.link}
                  className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-center">
                  <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center text-2xl`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <Routes>
          <Route index element={<Navigate to="results" replace />} />
          <Route path="results" element={<ResultsManagement api={api} hasPermission={hasPermission} />} />
          <Route path="certificates" element={<CertificatesManagement api={api} user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

function ResultsManagement({ api, hasPermission }) {
  const [niveaux, setNiveaux] = useState([]);
  const [niveau, setNiveau] = useState("");
  const [classes, setClasses] = useState([]);
  const [classe, setClasse] = useState("");
  const [semestre, setSemestre] = useState("1");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();

  const canManage = hasPermission("grades:manage");

  useEffect(() => {
    api.get("/eleves/niveaux")
      .then(res => {
        const list = res.data || [];
        setNiveaux(list);
        if (list.length > 0 && !list.find(n => n.niveau === niveau)) {
          setNiveau(list[0].niveau);
        }
      })
      .catch(() => pushToast("error", t('documents.loadError')));
  }, []);

  useEffect(() => {
    if (!niveau) return;
    api.get("/eleves/classes", { params: { niveau } })
      .then(res => {
        const list = res.data || [];
        setClasses(list);
        if (list.length > 0 && !list.find(c => c.classe === classe)) {
          setClasse(list[0].classe);
        }
      })
      .catch(() => pushToast("error", t('documents.loadError')));
  }, [niveau]);

  useEffect(() => {
    if (!niveau || !classe || !semestre) return;
    fetchData();
  }, [niveau, classe, semestre]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/resultats/by-classe", {
        params: { niveau, classe, semestre }
      });
      const merged = res.data.data || [];
      setRows(merged.map(item => {
        const n = item.notes || {};
        const base = {
          eleve: item.eleve,
          hasNotes: item.hasNotes,
          resultatId: n.id || null,
          massar_id: n.massar_id || item.eleve.id_massar || "",
          eleve_name: n.eleve_name || `${item.eleve.prenom} ${item.eleve.nom}`,
          eleve_id: item.eleve.id,
        };
        for (const s of SUBJECTS) {
          base[s.key] = n[s.key] ?? "";
        }
        base.moyenne_generale = n.moyenne_generale
          ? parseFloat(n.moyenne_generale) : null;
        return base;
      }));
    } catch {
      pushToast("error", t('documents.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (rowIdx, subjectKey, value) => {
    const updated = [...rows];
    updated[rowIdx] = { ...updated[rowIdx], [subjectKey]: value };
    const grades = {};
    for (const s of SUBJECTS) {
      grades[s.key] = parseFloat(updated[rowIdx][s.key]) || 0;
    }
    updated[rowIdx].moyenne_generale = computeAverage(grades);
    setRows(updated);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const payload = {
          massar_id: row.massar_id,
          eleve_name: row.eleve_name,
          eleve_id: row.eleve_id,
          niveau,
          classe,
          semestre: parseInt(semestre),
        };
        for (const s of SUBJECTS) {
          payload[s.key] = parseFloat(row[s.key]) || 0;
        }
        payload.moyenne_generale = row.moyenne_generale || 0;

        if (row.resultatId) {
          await api.put(`/resultats/${row.resultatId}`, payload);
        } else {
          await api.post("/resultats", payload);
        }
      }
      pushToast("success", t('documents.allSaved'));
      fetchData();
    } catch (err) {
      pushToast("error", t('documents.errorWithMessage', { message: err.response?.data?.error || err.message }));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setUploading(true);
        const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        const processed = data.map(row => {
          const getVal = (keyName) => {
            const val = row[keyName];
            return val ? parseFloat(String(val).replace(",", ".")) || 0 : 0;
          };

          const subjects = [
            getVal("Mathematiques"), getVal("Physique-Chimie"), getVal("SVT"),
            getVal("Francais"), getVal("Arabe"), getVal("Anglais"),
            getVal("Histoire-Geographie"), getVal("Education Islamique"),
            getVal("Informatique"), getVal("EPS"), getVal("Musique"), getVal("Art")
          ];

          const validGrades = subjects.filter(v => v > 0);
          const moy = validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2) : 0;

          return {
            massar_id: String(row["ID"] || "N/A"),
            eleve_name: `${row["Prenom"] || ""} ${row["Nom"] || ""}`.trim(),
            niveau,
            classe,
            semestre: parseInt(semestre),
            maths: subjects[0], physique: subjects[1], svt: subjects[2],
            francais: subjects[3], arabe: subjects[4], anglais: subjects[5],
            histoire_geo: subjects[6], education_islamique: subjects[7],
            informatique: subjects[8], eps: subjects[9], musique: subjects[10], art: subjects[11],
            moyenne_generale: moy
          };
        });

        await api.post("/resultats/upload", { resultats: processed });
        pushToast("success", t('documents.importedData', { niveau, count: processed.length }));
        fetchData();
      } catch (err) { pushToast("error", t('documents.errorWithMessage', { message: err.response?.data?.error || err.message })); }
      finally { setUploading(false); e.target.value = null; }
    };
    reader.readAsArrayBuffer(file);
  };

  const hasGrades = rows.some(r => r.moyenne_generale !== null && r.moyenne_generale > 0);
  const total = rows.length;
  const avg = hasGrades
    ? (rows.filter(r => r.moyenne_generale).reduce((acc, r) => acc + r.moyenne_generale, 0) / rows.filter(r => r.moyenne_generale).length).toFixed(2)
    : "0.00";
  const successCount = rows.filter(r => r.moyenne_generale && r.moyenne_generale >= 10).length;
  const success = successCount > 0 ? ((successCount / rows.filter(r => r.moyenne_generale).length) * 100).toFixed(1) : "0";

  const inputClass = "w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-center focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('documents.niveau')}</label>
            <select value={niveau} onChange={e => setNiveau(e.target.value)}
              className="border border-gray-200 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {niveaux.map(n => (
                <option key={n.niveau} value={n.niveau}>{n.niveau}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('documents.selectClass')}</label>
            <select value={classe} onChange={e => setClasse(e.target.value)}
              className="border border-gray-200 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[80px]">
              {classes.map(c => (
                <option key={c.classe} value={c.classe}>{c.classe}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('documents.semester')}</label>
            <select value={semestre} onChange={e => setSemestre(e.target.value)}
              className="border border-gray-200 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="1">{t('documents.semester1')}</option>
              <option value="2">{t('documents.semester2')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {canManage && (
            <button onClick={handleSaveAll} disabled={saving || loading}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-95 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? t('documents.savingAll') : t('documents.saveAll')}
            </button>
          )}
          <input type="file" onChange={handleFileUpload} className="hidden" id="excel-up" accept=".xlsx, .xls" />
          <label htmlFor="excel-up"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl cursor-pointer font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95">
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {uploading ? t('documents.importing') : t('documents.importExcel')}
          </label>
        </div>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={22} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{t('documents.studentsEvaluated')}</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TrendingUp size={22} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{t('documents.classAverage')}</p>
              <p className="text-2xl font-bold text-purple-700">{avg} <span className="text-sm text-gray-400">/20</span></p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BarChart3 size={22} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{t('documents.successRate')}</p>
              <p className="text-2xl font-bold text-emerald-600">{success}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50/50 z-10">{t('documents.fullName')}</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('school.massar')}</th>
              {SUBJECTS.map(s => (
                <th key={s.key} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{t(s.labelKey)}</th>
              ))}
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{t('documents.avg')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={SUBJECTS.length + 3} className="p-8 text-center text-gray-400">{t('common.loading')}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={SUBJECTS.length + 3} className="p-8 text-center text-gray-400">{t('documents.noResults')}<br /><span className="text-xs">{t('documents.noResultsDesc')}</span></td></tr>
            ) : rows.map((row, idx) => (
              <tr key={row.eleve.id} className="hover:bg-gray-50/50 transition-all">
                <td className="px-4 py-2 text-sm font-bold text-gray-900 sticky left-0 bg-white hover:bg-gray-50/50 z-10">
                  {row.eleve.prenom} {row.eleve.nom}
                </td>
                <td className="px-4 py-2 text-xs font-mono text-gray-500">{row.eleve.id_massar}</td>
                {SUBJECTS.map(s => (
                  <td key={s.key} className="px-2 py-2 text-center">
                    {canManage ? (
                      <input type="number" step="0.25" min="0" max="20"
                        value={row[s.key]}
                        onChange={(e) => handleGradeChange(idx, s.key, e.target.value)}
                        className={inputClass}
                        placeholder="-" />
                    ) : (
                      <span className="text-sm font-medium text-gray-700">{row[s.key] || "-"}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-2 text-center">
                  <span className={`px-3 py-1.5 rounded-lg font-black text-sm ${
                    row.moyenne_generale && row.moyenne_generale >= 10 ? "bg-emerald-50 text-emerald-700" : row.moyenne_generale ? "bg-red-50 text-red-700" : ""
                  }`}>{row.moyenne_generale?.toFixed(2) ?? "-"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MentionBar({ label, count, total, color, value }) {
  const { t } = useTranslation();
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold text-gray-800">{count} {t('documents.students')}</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CertificatesManagement({ api, user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [certData, setCertData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    api.get("/eleves/all")
      .then(res => setStudents(res.data))
      .catch(() => pushToast("error", t('documents.loadStudentsError')))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (student) => {
    setIsGenerating(true);
    try {
      const payload = {
        eleve_id: student.id,
        id_massar: student.id_massar,
        nom: student.nom,
        prenom: student.prenom,
      };
      const res = await api.post("/certificats/generate", payload);
      const numero = res.data.numero || `2025/2026/${Math.floor(Math.random() * 1000)}`;

      setCertData({
        numero,
        eleve: { ...student, classe: student.classe || student.niveau || "—" },
        dateEmission: new Date().toLocaleDateString("fr-FR"),
      });

      setTimeout(() => window.print(), 500);
    } catch {
      pushToast("error", t('documents.generatedError'));
      setIsGenerating(false);
    }
  };

  const certColumns = [
    { key: "id_massar", label: t('documents.codeMASSAR'), sortable: true, render: (s) => <span className="font-mono text-gray-500 text-xs">{s.id_massar}</span> },
    { key: "nom", label: t('documents.fullName'), sortable: true, render: (s) => <span className="font-bold text-gray-900">{s.prenom} {s.nom}</span> },
    { key: "classe", label: t('documents.class'), render: (s) => <span className="text-gray-600 font-medium">{s.classe || "—"}</span> },
    { key: "date_naissance", label: t('documents.birthDate'), sortable: true, render: (s) => s.date_naissance ? new Date(s.date_naissance).toLocaleDateString("fr-FR") : <span className="text-gray-400">—</span> },
    { key: "actions", label: "", render: (s) => (
      <div className="flex justify-end">
        <button onClick={() => handleGenerate(s)} disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all text-xs disabled:opacity-50 active:scale-95">
          <Printer size={14} /> {t('documents.generate')}
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{t('documents.recentCerts')}</h3>
                <p className="text-xs text-gray-500 mt-0.5">3 {t('documents.certsThisMonth')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
                  {t('documents.pdf')}
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm">
                  + {t('documents.generate')}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3">{t('documents.student')}</th>
                    <th className="px-4 py-3">{t('documents.certNumber')}</th>
                    <th className="px-4 py-3">{t('documents.certDate')}</th>
                    <th className="px-4 py-3">{t('documents.certStatus')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { eleve: "Sara Benhaddou", classe: "3ème B · M20089103", numero: "CERT-2026-0421", date: "11/03/2026", statut: t('documents.certIssued') },
                    { eleve: "Karim Alaoui", classe: "4ème A · M20089211", numero: "CERT-2026-0420", date: "10/03/2026", statut: t('documents.certIssued') },
                    { eleve: "Nadia Berrada", classe: "2ème B · M20089478", numero: "CERT-2026-0419", date: "09/03/2026", statut: t('documents.certIssued') },
                  ].map((cert, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-all">
                      <td className="px-4 py-3">
                        <p className="font-bold text-sm text-gray-900">{cert.eleve}</p>
                        <p className="text-xs text-gray-500">{cert.classe}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{cert.numero}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{cert.date}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {cert.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
                          {t('documents.pdf')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3">{t('documents.demoResultsTitle')}</h3>
            <div className="space-y-3">
              <MentionBar label={t('documents.veryGood')} count={8} total={32} color="bg-emerald-500" />
              <MentionBar label={t('documents.good')} count={14} total={32} color="bg-blue-500" />
              <MentionBar label={t('documents.fairlyGood')} count={7} total={32} color="bg-amber-400" />
              <MentionBar label={t('documents.struggling')} count={3} total={32} color="bg-red-500" />
            </div>
            <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
              <div className="text-center flex-1">
                <p className="text-lg font-black text-gray-900">13.4</p>
                <p className="text-[10px] text-gray-500">{t('documents.classAvg')}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-lg font-black text-emerald-600">91%</p>
                <p className="text-[10px] text-gray-500">{t('documents.successPct')}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-lg font-black text-gray-900">32</p>
                <p className="text-[10px] text-gray-500">{t('documents.students')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{t('documents.generateCert')}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{t('documents.generateCertDesc')}</p>
        </div>
        <div className="p-4">
          <DataTable
            columns={certColumns}
            data={students}
            loading={loading}
            searchable
            searchKeys={["nom", "prenom", "id_massar"]}
            searchPlaceholder={t('documents.searchMassar')}
            pageSize={10}
            emptyTitle={t('documents.noStudents')}
          />
        </div>
      </div>

      {certData && (
        <div className="fixed inset-0 z-50 bg-white text-black p-8 font-serif overflow-y-auto" dir="rtl"
             style={{ width: '794px', margin: '0 auto' }}>
          <button onClick={() => { setCertData(null); setIsGenerating(false); }}
            className="fixed top-4 left-4 z-[60] w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-lg font-bold hover:bg-red-600 shadow-lg">
            ×
          </button>

          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div className="text-right text-sm leading-relaxed font-bold">
              <p>المملكة المغربية</p>
              <p>وزارة التربية الوطنية والتعليم الأولي والرياضة</p>
            </div>
            <div className="text-left text-sm leading-relaxed font-bold">
              <p>الأكاديمية الجهوية للتربية والتكوين</p>
              <p>لجهة : مراكش - آسفي</p>
              <p>المديرية الإقليمية : عمالة : مراكش</p>
            </div>
          </div>

          <div className="flex justify-between text-sm font-bold mb-8">
            <div className="w-24 h-32 border-2 border-dashed flex items-center justify-center text-xs" style={{ color: '#9ca3af', borderColor: '#9ca3af' }}>
              صورة (Photo)
            </div>
            <div className="text-left leading-loose">
              <p>الجماعة : المنارة (المقاطعة)</p>
              <p>المؤسسة : الثانوية الإعدادية برج الزيتون</p>
              <p>الهاتف : 0524000000</p>
            </div>
          </div>

          <div className="flex items-center justify-center mb-10">
            <div className="border-2 border-black px-10 py-3 text-2xl font-black flex items-center gap-4" style={{ backgroundColor: '#f3f4f6' }}>
              <span>شهادة مدرسية رقم : {certData.numero}</span>
              <span className="text-xs border border-black p-1 bg-white mr-4">مسار MASSAR</span>
            </div>
          </div>

          <div className="text-xl leading-loose font-medium mb-12 max-w-4xl mx-auto">
            <p className="mb-6 font-bold">يشهد الموقع (ة) أسفله</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <p>أن التلميذ (ة) الاسم و النسب : <span className="font-bold border-b border-dashed inline-block px-4" style={{ borderColor: '#9ca3af' }}>{certData.eleve.nom} {certData.eleve.prenom}</span></p>
              <p dir="ltr" className="text-left"><span className="font-bold border-b border-dashed inline-block px-4" style={{ borderColor: '#9ca3af' }}>{certData.eleve.nom.toUpperCase()} {certData.eleve.prenom.toUpperCase()}</span> : Nom et Prénom</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <p>المولود (ة) في : <span className="font-bold border-b border-dashed inline-block px-4" style={{ borderColor: '#9ca3af' }}>{certData.eleve.date_naissance ? new Date(certData.eleve.date_naissance).toLocaleDateString("fr-FR") : "................................"}</span></p>
              <p>بـ : <span className="font-bold border-b border-dashed inline-block px-4" style={{ borderColor: '#9ca3af' }}>مراكش</span></p>
            </div>

            <p className="mb-6">رقم التلميذ (ة) (مسار) : <span className="font-bold border-b border-dashed inline-block px-4 tracking-widest" style={{ borderColor: '#9ca3af' }}>{certData.eleve.id_massar}</span></p>
            <p className="mb-6">كان / يتابع دراسته(ها) بهذه المؤسسة</p>
            <p className="mb-8">و لم يغادر المؤسسة و يتابع دراسته بالمستوى : <span className="font-bold border-b border-dashed inline-block px-4" style={{ borderColor: '#9ca3af' }}> (2025/2026) - {certData.eleve.classe}</span></p>
            <p className="text-lg">ملاحظات : <span className="italic">سلمت له (ها) هذه الشهادة من برنامج "مسار" لغرض إداري.</span></p>
          </div>

          <div className="flex justify-between items-end mt-16 px-10">
            <div className="text-center font-bold text-lg">
              <p className="mb-8">خاتم و توقيع رئيس المؤسسة</p>
              <div className="w-32 h-32 border rounded-full mx-auto flex items-center justify-center opacity-50" style={{ borderColor: '#e5e7eb' }}>
                ختم الإدارة
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold mb-4">حرر بـ : مراكش في : {certData.dateEmission}</p>
              <p className="font-bold text-lg mb-8">خاتم و توقيع الحارس العام</p>
              <div className="w-32 h-32 border rounded-full mx-auto flex items-center justify-center opacity-50" style={{ borderColor: '#e5e7eb' }}>
                ختم الحارس العام
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
