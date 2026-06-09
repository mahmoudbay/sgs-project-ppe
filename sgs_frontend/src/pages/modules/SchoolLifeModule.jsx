import { useState, useEffect, useCallback } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { Loader2, RefreshCw, Search, Save, Download, Upload, X, Eye, History, FileText, BarChart3, Users, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";
import { pushToast } from "../../components/Notifications";

function SchoolLifeHeader() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const base = '/school-life';

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('school.title')}</h1>
        <div className="flex items-center gap-2">
          <Link to={`${base}/students`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname.includes('/school-life/students') ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"}`}>
            {t('school.students')}
          </Link>
          <Link to={`${base}/absences`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pathname.includes('/school-life/absences') ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"}`}>
            {t('school.absences')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SchoolLifeModule({ user, api, hasPermission }) {
  return (
    <div className="min-h-full bg-gray-50 animate-fade-in">
      <SchoolLifeHeader />
      <div className="p-6">
        <Routes>
          <Route index element={<Navigate to="students" replace />} />
          <Route path="students" element={<StudentsList api={api} />} />
          <Route path="absences" element={<AbsencesManager api={api} />} />
        </Routes>
      </div>
    </div>
  );
}

const MOCK_STUDENTS = [
  { id: 1, id_massar: "M20089042", nom: "Amrani", prenom: "Youssef", niveau: "3ème A", absences: 18, absences_justifiees: 5 },
  { id: 2, id_massar: "M20089103", nom: "Benhaddou", prenom: "Sara", niveau: "3ème B", absences: 4, absences_justifiees: 2 },
  { id: 3, id_massar: "M20089211", nom: "Alaoui", prenom: "Karim", niveau: "4ème A", absences: 2, absences_justifiees: 1 },
  { id: 4, id_massar: "M20089478", nom: "Berrada", prenom: "Nadia", niveau: "2ème B", absences: 12, absences_justifiees: 3 },
  { id: 5, id_massar: "M20089501", nom: "Chafik", prenom: "Omar", niveau: "3ème A", absences: 14, absences_justifiees: 6 },
  { id: 6, id_massar: "M20089622", nom: "Drissi", prenom: "Leila", niveau: "1ère A", absences: 0, absences_justifiees: 0 },
  { id: 7, id_massar: "M20089733", nom: "El Fassi", prenom: "Amine", niveau: "3ème B", absences: 22, absences_justifiees: 8 },
];

function StudentCard({ student, onClick }) {
  const { t } = useTranslation();
  const isAlert = student.absences >= 10;
  const isWarning = student.absences >= 5 && student.absences < 10;
  const avatarColors = [
    "from-red-500 to-orange-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600",
    "from-amber-500 to-red-600", "from-purple-500 to-pink-600", "from-cyan-500 to-blue-600", "from-rose-500 to-red-600",
  ];
  const colorIdx = (student.id || 1) % avatarColors.length;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all cursor-pointer ${isAlert ? "bg-red-50/50" : ""}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${avatarColors[colorIdx]} flex-shrink-0`}>
        {(student.prenom?.[0] || "") + (student.nom?.[0] || "")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{student.prenom} {student.nom}</p>
        <p className="text-xs text-gray-500 truncate">
          Massar: {student.id_massar} · {student.niveau}
          {student.absences > 0 && (
            <strong className={`ml-1 ${isAlert ? "text-red-600" : isWarning ? "text-amber-600" : "text-gray-500"}`}>
              · {student.absences}{t('school.hoursAbsences')}
            </strong>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isAlert ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">{t('school.alert')}</span>
        ) : isWarning ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">{t('school.warning')}</span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{t('school.normal')}</span>
        )}
        <button onClick={() => onClick?.(student)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition">{t('school.dossier')}</button>
      </div>
    </div>
  );
}

function StudentsList({ api }) {
  const { t } = useTranslation();
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [niveauFilter, setNiveauFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get("/eleves/all")
      .then(res => setStudents(prev => res.data.length > 0 ? res.data : prev))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const niveaux = [...new Set(students.map(s => s.niveau).filter(Boolean))].sort();
  const q = searchQuery.toLowerCase();
  const filteredBySearch = students.filter(s =>
    !q || (s.nom || "").toLowerCase().includes(q) || (s.prenom || "").toLowerCase().includes(q) || (s.id_massar || "").toLowerCase().includes(q)
  );
  const filteredByNiveau = niveauFilter ? filteredBySearch.filter(s => s.niveau === niveauFilter) : filteredBySearch;
  const filtered = tab === "all" ? filteredByNiveau : tab === "alert" ? filteredByNiveau.filter(s => s.absences >= 10) : filteredByNiveau.filter(s => s.absences > 0);
  const alertCount = students.filter(s => s.absences >= 10).length;
  const absentToday = students.filter(s => s.absences > 0).length;

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('school.searchStudent')}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
            <select value={niveauFilter} onChange={e => setNiveauFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">{t('school.allClasses')}</option>
              {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-sm text-amber-800">
            <span>⚠️</span>
            <span><Trans i18nKey="school.alertThreshold" count={alertCount} /></span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setTab("all")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${tab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {t('school.all')} ({filteredByNiveau.length})
                </button>
                <button onClick={() => setTab("alert")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${tab === "alert" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {t('school.alerts')} ({filteredByNiveau.filter(s => s.absences >= 10).length})
                </button>
                <button onClick={() => setTab("absent")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${tab === "absent" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {t('school.absent')} ({filteredByNiveau.filter(s => s.absences > 0).length})
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="text-center py-12"><Loader2 size={24} className="animate-spin text-blue-500 mx-auto" /></div>
              ) : filtered.length > 0 ? (
                filtered.map(s => <StudentCard key={s.id || Math.random()} student={s} />)
              ) : (
                <div className="text-center py-12 text-gray-400 font-medium">{t('school.noStudents')}</div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              {students.length} {t('school.totalStudents', { count: students.length })}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3">{t('school.absencesToday')}</h3>
            <p className="text-3xl font-black text-gray-900">{absentToday}</p>
            <p className="text-xs text-gray-500 mb-3">{t('school.studentsAbsent')} · {new Date().toLocaleDateString("fr-FR")}</p>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('school.justifiees')}</span>
                <span className="font-bold text-emerald-600">{students.reduce((a, s) => a + (s.absences_justifiees || 0), 0)}</span>
              </div>
              <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: "65%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('school.injustifiees')}</span>
                <span className="font-bold text-red-600">{students.reduce((a, s) => a + (s.absences - (s.absences_justifiees || 0)), 0)}</span>
              </div>
              <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: "35%" }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3">{t('school.syncMassar')}</h3>
            <p className="text-xs text-gray-500 mb-1">{t('school.lastSync')}</p>
            <p className="text-sm font-bold text-gray-800 font-mono">{t('time.today')} · 06:30</p>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {t('school.synced')}
              </span>
            </div>
            <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              <RefreshCw size={14} /> {t('school.syncNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Student History Modal ---
function StudentHistoryModal({ api, student, onClose }) {
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student || typeof student.id !== 'number') return;
    setLoading(true);
    api.get('/eleves/absences/records', { params: { eleve_id: student.id } })
      .then(r => setRecords(r.data))
      .catch(() => pushToast("error", t('school.loadError')))
      .finally(() => setLoading(false));
  }, [student, api]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{student.prenom} {student.nom}</h2>
            <p className="text-sm text-gray-500">{t('school.massarCode')}: {student.id_massar} · {student.niveau} · {student.absences}{t('school.hoursAbsences')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">
          {loading ? (
            <div className="text-center py-12"><Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /></div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-medium">{t('school.noHistory')}</div>
          ) : (
            <div className="space-y-2">
              {records.map(r => (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border ${r.justifie ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${r.justifie ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {r.justifie ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{new Date(r.date).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">{r.justifie ? t('school.justifieLabel') : t('school.unjustified')}{r.motif ? ` — ${r.motif}` : ''}</p>
                  </div>
                  {r.justificatif && (
                    <span className="text-xs text-blue-600 flex items-center gap-1"><FileText size={12} /> {t('school.justificatif')}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Absences Manager ---
function AbsencesManager({ api }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("journal");
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [niveauFilter, setNiveauFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ eleve_id: '', date: new Date().toISOString().split('T')[0], justifie: false, motif: '', justificatif: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', justifie: false, motif: '' });
  const [searchStudent, setSearchStudent] = useState("");
  const [historyStudent, setHistoryStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Batch state
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchNiveau, setBatchNiveau] = useState("");
  const [batchJustifie, setBatchJustifie] = useState(false);
  const [batchChecked, setBatchChecked] = useState({});
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchSearch, setBatchSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      const params = { date: filterDate || undefined };
      if (niveauFilter) params.niveau = niveauFilter;
      const [recRes, stuRes] = await Promise.all([
        api.get('/eleves/absences/records', { params }),
        api.get('/eleves/all')
      ]);
      setRecords(recRes.data);
      setStudents(stuRes.data);
    } catch {
      pushToast("error", t('school.loadError'));
    } finally {
      setLoading(false);
    }
  }, [api, filterDate, niveauFilter, t]);

  useEffect(() => { if (activeTab === "journal") loadData(); }, [loadData, activeTab]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/eleves/absences/stats');
      setStats(res.data);
    } catch {
      pushToast("error", t('school.statsLoadError'));
    } finally {
      setStatsLoading(false);
    }
  }, [api, t]);

  useEffect(() => { if (activeTab === "stats") loadStats(); }, [loadStats, activeTab]);

  const handleAdd = async () => {
    if (!form.eleve_id) return pushToast("error", t('school.selectStudent'));
    setSaving(true);
    try {
      const res = await api.post('/eleves/absences/records', form);
      setRecords(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({ eleve_id: '', date: new Date().toISOString().split('T')[0], justifie: false, motif: '', justificatif: '' });
      pushToast("success", t('school.addSuccess'));
    } catch {
      pushToast("error", t('school.addError'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('school.deleteConfirm'))) return;
    try {
      await api.delete(`/eleves/absences/records/${id}`);
      setRecords(prev => prev.filter(r => r.id !== id));
      pushToast("success", t('school.deleteSuccess'));
    } catch {
      pushToast("error", t('school.deleteError'));
    }
  };

  const startEdit = (rec) => {
    setEditingId(rec.id);
    setEditForm({ date: rec.date?.split('T')[0] || '', justifie: rec.justifie, motif: rec.motif || '' });
  };

  const handleEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await api.put(`/eleves/absences/records/${editingId}`, editForm);
      setRecords(prev => prev.map(r => r.id === editingId ? res.data : r));
      setEditingId(null);
      pushToast("success", t('school.editSuccess'));
    } catch {
      pushToast("error", t('school.editError'));
    } finally { setSaving(false); }
  };

  const handleBatchAdd = async () => {
    const ids = Object.entries(batchChecked).filter(([, v]) => v).map(([k]) => parseInt(k));
    if (ids.length === 0) return pushToast("error", t('school.selectStudent'));
    setBatchSaving(true);
    try {
      await api.post('/eleves/absences/records/batch', { eleve_ids: ids, date: batchDate, justifie: batchJustifie });
      pushToast("success", `${ids.length} ${t('school.batchSuccess', { count: ids.length })}`);
      setBatchChecked({});
      loadData();
    } catch {
      pushToast("error", t('school.batchError'));
    } finally { setBatchSaving(false); }
  };

  const handleExport = async (format) => {
    try {
      const params = {};
      if (niveauFilter) params.niveau = niveauFilter;
      if (filterDate) params.date_from = filterDate;
      const res = await api.get('/eleves/absences/export', { params });
      const data = res.data;
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'absences.json'; a.click();
        URL.revokeObjectURL(url);
        pushToast("success", t('school.exportSuccess', { format: 'JSON' }));
      } else if (format === 'csv') {
        const headers = [t('school.dateColumn'), t('profile.nom'), t('profile.prenom'), t('school.massarCode'), t('school.niveau'), t('school.justifieCol'), t('school.motif')];
        const csvRows = [headers.join(',')];
        for (const r of data) {
          csvRows.push([r.date, r.nom, r.prenom, r.id_massar, r.niveau, r.justifie, `"${(r.motif || '').replace(/"/g, '""')}"`].join(','));
        }
        const bom = "\uFEFF";
        const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'absences.csv'; a.click();
        URL.revokeObjectURL(url);
        pushToast("success", t('school.exportSuccess', { format: 'CSV' }));
      } else if (format === 'xlsx') {
        const rows = data.map(r => ({ [t('school.dateColumn')]: r.date, [t('profile.nom')]: r.nom, [t('profile.prenom')]: r.prenom, [t('school.massarCode')]: r.id_massar, [t('school.niveau')]: r.niveau, [t('school.justifieCol')]: r.justifie === 'Oui' ? t('school.yes') : t('school.no'), [t('school.motif')]: r.motif || '' }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Absences');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `absences_${filterDate || 'all'}.xlsx`; a.click();
        URL.revokeObjectURL(url);
        pushToast("success", t('school.exportSuccess', { format: 'Excel' }));
      } else if (format === 'pdf') {
        window.print();
      }
    } catch {
      pushToast("error", t('school.exportError'));
    }
  };

  // Computed
  const niveaux = [...new Set(students.map(s => s.niveau).filter(Boolean))].sort();
  const studentOptions = students.filter(s => typeof s.id === 'number');
  const sq = searchStudent.toLowerCase();
  const filteredOptions = studentOptions.filter(s =>
    !sq || (s.nom || '').toLowerCase().includes(sq) || (s.prenom || '').toLowerCase().includes(sq) || (s.id_massar || '').toLowerCase().includes(sq)
  );
  const batchStudents = studentOptions.filter(s => !batchNiveau || s.niveau === batchNiveau);
  const bq = batchSearch.toLowerCase();
  const filteredBatch = batchStudents.filter(s =>
    !bq || (s.nom || '').toLowerCase().includes(bq) || (s.prenom || '').toLowerCase().includes(bq) || (s.id_massar || '').toLowerCase().includes(bq)
  );
  const allChecked = filteredBatch.length > 0 && filteredBatch.every(s => batchChecked[s.id]);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm w-fit">
        {[
          { key: "journal", label: t('school.journal'), icon: Calendar },
          { key: "batch", label: t('school.batchAdd'), icon: Users },
          { key: "stats", label: t('school.stats'), icon: BarChart3 },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={16} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* === TAB: JOURNAL === */}
      {activeTab === "journal" && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-semibold text-gray-600">{t('school.date')}</label>
              <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); setLoading(true); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <select value={niveauFilter} onChange={e => { setNiveauFilter(e.target.value); setLoading(true); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">{t('school.allLevels')}</option>
                {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative group">
                <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  <Download size={14} /> {t('school.export')}
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-200 z-10 hidden group-hover:block">
                  <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl">{t('school.excel')}</button>
                  <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">{t('school.pdf')}</button>
                  <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">{t('school.csv')}</button>
                  <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-xl">{t('school.json')}</button>
                </div>
              </div>
              <button onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                {t('school.newAbsence')}
              </button>
            </div>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-3">{t('school.addAbsenceTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={searchStudent} onChange={e => setSearchStudent(e.target.value)}
                    placeholder={t('school.searchStudentPlaceholder')} className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <select value={form.eleve_id} onChange={e => setForm(f => ({ ...f, eleve_id: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">{t('school.selectStudent')}</option>
                  {filteredOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.prenom} {s.nom} — {s.niveau || 'N/A'}</option>
                  ))}
                </select>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.justifie} onChange={e => setForm(f => ({ ...f, justifie: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    {t('school.justifieLabel')}
                  </label>
                  <input value={form.motif} onChange={e => setForm(f => ({ ...f, motif: e.target.value }))}
                    placeholder={t('school.motif')} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <button onClick={handleAdd} disabled={saving || !form.eleve_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition">
                  {saving ? t('common.loading') : t('school.add')}
                </button>
              </div>
            </div>
          )}

          {/* Records table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">{t('school.dateColumn')}</th>
                    <th className="px-4 py-3">{t('school.student')}</th>
                    <th className="px-4 py-3">{t('school.massarCode')}</th>
                    <th className="px-4 py-3">{t('school.niveau')}</th>
                    <th className="px-4 py-3">{t('school.justifieCol')}</th>
                    <th className="px-4 py-3">{t('school.motif')}</th>
                    <th className="px-4 py-3">{t('school.justificatif')}</th>
                    <th className="px-4 py-3 text-center">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-16"><Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /></td></tr>
                  ) : records.length > 0 ? (
                    records.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-all">
                        {editingId === r.id ? (
                          <>
                            <td className="px-4 py-3">
                              <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                                className="w-32 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-900">{r.prenom} {r.nom}</td>
                            <td className="px-4 py-3 font-mono text-gray-500">{r.id_massar}</td>
                            <td className="px-4 py-3">{r.niveau}</td>
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={editForm.justifie} onChange={e => setEditForm(f => ({ ...f, justifie: e.target.checked }))}
                                className="rounded border-gray-300 text-blue-600" />
                            </td>
                            <td className="px-4 py-3">
                              <input value={editForm.motif} onChange={e => setEditForm(f => ({ ...f, motif: e.target.value }))}
                                placeholder={t('school.motif')} className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs">—</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={handleEdit} disabled={saving} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition">{t('school.ok')}</button>
                                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300 transition">{t('school.cancel')}</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-gray-600">{r.date?.split('T')[0]}</td>
                            <td className="px-4 py-3 font-bold text-gray-900">
                              <button onClick={() => setHistoryStudent(r)} className="hover:text-blue-600 transition-colors">
                                {r.prenom} {r.nom}
                              </button>
                            </td>
                            <td className="px-4 py-3 font-mono text-gray-500">{r.id_massar}</td>
                            <td className="px-4 py-3">{r.niveau}</td>
                            <td className="px-4 py-3">
                              {r.justifie ? (
                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{t('school.yes')}</span>
                              ) : (
                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">{t('school.no')}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs max-w-[150px] truncate">{r.motif || "—"}</td>
                            <td className="px-4 py-3">
                              {r.justificatif ? (
                                <a href={`http://localhost:5000${r.justificatif}`} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 underline">
                                  <FileText size={12} /> {t('school.seeDoc')}
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => startEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t('school.edit')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title={t('school.delete')}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                </button>
                                <label className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer" title={t('school.uploadJustificatif')}>
                                  <Upload size={14} />
                                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const fd = new FormData();
                                      fd.append('justificatif', file);
                                      try {
                                        await api.post(`/eleves/absences/records/${r.id}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                                        pushToast("success", t('school.uploadSuccess'));
                                        loadData();
                                      } catch { pushToast("error", t('school.uploadError')); }
                                    }} />
                                </label>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" className="text-center py-16 text-gray-400 font-medium">{t('school.noRecords')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              {records.length} {t('school.totalRecords', { count: records.length })} · {t('school.filterBy')}: {niveauFilter || t('school.allLevels')}
            </div>
          </div>
        </>
      )}

      {/* === TAB: AJOUT GROUPÉ === */}
      {activeTab === "batch" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">{t('school.batchTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <select value={batchNiveau} onChange={e => { setBatchNiveau(e.target.value); setBatchChecked({}); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">{t('school.selectClass')}</option>
                {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <input type="date" value={batchDate} onChange={e => setBatchDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={batchJustifie} onChange={e => setBatchJustifie(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                {t('school.allJustified')}
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={batchSearch} onChange={e => setBatchSearch(e.target.value)}
                  placeholder={t('school.filterStudents')} className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            {batchNiveau && (
              <>
                <div className="flex items-center gap-3 mb-2 text-sm text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={allChecked} onChange={() => {
                      if (allChecked) setBatchChecked({});
                      else {
                        const c = {}; filteredBatch.forEach(s => { c[s.id] = true; }); setBatchChecked(c);
                      }
                    }} className="rounded border-gray-300 text-blue-600" />
                    <strong>{t('school.selectAll')}</strong>
                  </label>
                  <span className="text-gray-400">({filteredBatch.length} {t('school.totalStudents', { count: filteredBatch.length })})</span>
                  <span className="text-blue-600 font-semibold">{Object.values(batchChecked).filter(Boolean).length} {t('school.selected', { count: Object.values(batchChecked).filter(Boolean).length })}</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {filteredBatch.map(s => (
                    <label key={s.id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${batchChecked[s.id] ? 'bg-blue-50/50' : ''}`}>
                      <input type="checkbox" checked={!!batchChecked[s.id]} onChange={() => setBatchChecked(c => ({ ...c, [s.id]: !c[s.id] }))}
                        className="rounded border-gray-300 text-blue-600" />
                      <span className="font-medium text-gray-900">{s.prenom} {s.nom}</span>
                      <span className="text-gray-500 text-xs">{s.id_massar}</span>
                    </label>
                  ))}
                </div>
                <button onClick={handleBatchAdd} disabled={batchSaving || Object.values(batchChecked).filter(Boolean).length === 0}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition flex items-center gap-2">
                  {batchSaving ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
                  {t('school.saveBatch', { count: Object.values(batchChecked).filter(Boolean).length })}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* === TAB: STATISTIQUES === */}
      {activeTab === "stats" && (
        <>
          {statsLoading ? (
            <div className="text-center py-16"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></div>
          ) : stats ? (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">{t('school.totalAbsences')}</p>
                  <p className="text-3xl font-black text-gray-900">{stats.summary?.total_records || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">{t('school.justifiedCount')}</p>
                  <p className="text-3xl font-black text-emerald-600">{stats.summary?.total_justifiees || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">{t('school.studentsConcerned')}</p>
                  <p className="text-3xl font-black text-amber-600">{stats.summary?.total_eleves || 0}</p>
                </div>
              </div>

              {/* By niveau */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3">{t('school.byClass')}</h3>
                <div className="space-y-3">
                  {stats.byNiveau?.filter(n => n.niveau).map(n => {
                    const total = parseInt(n.total) || 0;
                    const maxVal = Math.max(...(stats.byNiveau?.map(x => parseInt(x.total) || 0) || [0]), 1);
                    return (
                      <div key={n.niveau}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{n.niveau}</span>
                          <span className="font-bold text-gray-900">{total} {t('school.absAbbrev')} · {n.eleves_concernes} {t('school.studentAbbrev')}</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden flex">
                          <div className="h-full bg-red-500 rounded-l-full" style={{ width: `${total > 0 ? (parseInt(n.non_justifiees || 0) / maxVal) * 100 : 0}%` }} />
                          <div className="h-full bg-emerald-500" style={{ width: `${total > 0 ? (parseInt(n.justifiees || 0) / maxVal) * 100 : 0}%` }} />
                        </div>
                        <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                          <span>🔴 {n.non_justifiees} {t('school.unjustified')}</span>
                          <span>🟢 {n.justifiees} {t('school.justified')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By month */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3">{t('school.byMonth')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {stats.byMonth?.map(m => (
                    <div key={m.mois} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 font-medium">{m.mois}</p>
                      <p className="text-xl font-black text-gray-900">{m.total}</p>
                      <div className="flex justify-center gap-2 text-[10px] text-gray-400 mt-1">
                        <span className="text-red-500">{m.non_justifiees}</span>
                        <span className="text-emerald-500">{m.justifiees}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top absents */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3">{t('school.top10')}</h3>
                {stats.topAbsents?.length > 0 ? (
                  <div className="space-y-2">
                    {stats.topAbsents.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-gray-400 text-sm">#{i + 1}</span>
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{s.prenom} {s.nom} <span className="text-gray-400 font-normal">({s.niveau})</span></span>
                          <span className="text-sm font-bold text-red-600">{s.total_absences}h</span>
                        </div>
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, (s.total_absences / 30) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">{t('school.noData')}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">{t('school.loading')}</div>
          )}
        </>
      )}

      {/* Student History Modal */}
      <StudentHistoryModal api={api} student={historyStudent} onClose={() => setHistoryStudent(null)} />
    </div>
  );
}
