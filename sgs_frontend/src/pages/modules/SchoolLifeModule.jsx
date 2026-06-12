import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Routes, Route, Link, useLocation, useParams, useNavigate, Navigate } from "react-router-dom";
import { Loader2, RefreshCw, Search, Save, Download, Upload, X, Eye, History, FileText, BarChart3, Users, Calendar, CheckCircle, AlertTriangle, Plus, Pencil, Trash2, Mail, UserPlus } from "lucide-react";
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
        {!pathname.includes('/school-life/students') ? null : null}
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
          <Route path="students" element={<NiveauSelector api={api} />} />
          <Route path="students/:niveau" element={<ClasseSelector api={api} />} />
          <Route path="students/:niveau/:classe" element={<ClasseDashboard api={api} />} />
        </Routes>
      </div>
    </div>
  );
}


function AddStudentModal({ api, onClose, onAdded }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ id_massar: '', nom: '', prenom: '', classe: '', niveau: '', date_naissance: '', email_parent: '', telephone_parent: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.nom.trim() || !form.prenom.trim()) {
      pushToast("error", t('school.fieldsRequired'));
      return;
    }
    setSaving(true);
    try {
      await api.post('/eleves', form);
      pushToast("success", t('school.studentAdded'));
      onAdded();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || t('school.studentAddError');
      pushToast("error", msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{t('school.addStudentTitle')}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('profile.nom')} *</label>
              <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('profile.prenom')} *</label>
              <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.massarOptional')}</label>
              <input value={form.id_massar} onChange={e => setForm(f => ({ ...f, id_massar: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.niveau')}</label>
              <input value={form.niveau} onChange={e => setForm(f => ({ ...f, niveau: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.classe')}</label>
              <input value={form.classe} onChange={e => setForm(f => ({ ...f, classe: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.dateNaissance')}</label>
              <input type="date" value={form.date_naissance} onChange={e => setForm(f => ({ ...f, date_naissance: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.emailParent')}</label>
              <input type="email" value={form.email_parent} onChange={e => setForm(f => ({ ...f, email_parent: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.telephoneParent')}</label>
              <input value={form.telephone_parent} onChange={e => setForm(f => ({ ...f, telephone_parent: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">{t('school.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {t('school.saveStudent')}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditStudentModal({ api, student, onClose, onUpdated }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    id_massar: student?.id_massar || '',
    nom: student?.nom || '',
    prenom: student?.prenom || '',
    classe: student?.classe || '',
    niveau: student?.niveau || '',
    date_naissance: student?.date_naissance ? String(student.date_naissance).split('T')[0] : '',
    email_parent: student?.email_parent || '',
    telephone_parent: student?.telephone_parent || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.nom.trim() || !form.prenom.trim()) {
      pushToast("error", t('school.fieldsRequired'));
      return;
    }
    setSaving(true);
    try {
      await api.put(`/eleves/${student.id}`, form);
      pushToast("success", t('school.studentUpdated'));
      onUpdated();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || t('school.studentUpdateError');
      pushToast("error", msg);
    } finally { setSaving(false); }
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{t('school.editStudentTitle')}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('profile.nom')} *</label>
              <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('profile.prenom')} *</label>
              <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.massarOptional')}</label>
              <input value={form.id_massar} onChange={e => setForm(f => ({ ...f, id_massar: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.niveau')}</label>
              <input value={form.niveau} onChange={e => setForm(f => ({ ...f, niveau: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.classe')}</label>
              <input value={form.classe} onChange={e => setForm(f => ({ ...f, classe: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.dateNaissance')}</label>
              <input type="date" value={form.date_naissance} onChange={e => setForm(f => ({ ...f, date_naissance: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.emailParent')}</label>
              <input type="email" value={form.email_parent} onChange={e => setForm(f => ({ ...f, email_parent: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">{t('school.telephoneParent')}</label>
              <input value={form.telephone_parent} onChange={e => setForm(f => ({ ...f, telephone_parent: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">{t('school.cancel')}</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {t('school.saveStudent')}
          </button>
        </div>
      </div>
    </div>
  );
}

function NiveauSelector({ api }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalResults, setGlobalResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    api.get('/eleves/niveaux')
      .then(r => setNiveaux(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!globalQuery.trim()) { setGlobalResults([]); setShowResults(false); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await api.get('/eleves/search-global', { params: { q: globalQuery } });
        setGlobalResults(r.data);
        setShowResults(true);
      } catch {}
      setSearching(false);
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [globalQuery, api]);

  useEffect(() => {
    const handleClick = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const colors = [
    { bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    { bg: 'from-amber-500 to-red-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ];

  if (loading) return <div className="text-center py-20"><Loader2 size={32} className="animate-spin text-blue-500 mx-auto" /></div>;

  return (
    <div className="animate-fade-in">
      <div ref={searchRef} className="relative mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={globalQuery} onChange={e => setGlobalQuery(e.target.value)}
            placeholder={t('school.globalSearch')}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />}
        </div>
        {showResults && globalResults.length > 0 && (
          <div className="absolute top-full mt-1 left-0 w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto">
            {globalResults.map(s => (
              <button key={s.id} onClick={() => { setShowResults(false); setGlobalQuery(''); navigate(`/school-life/students/${encodeURIComponent(s.niveau || '')}/${encodeURIComponent(s.classe || '')}`); }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50 text-left border-b border-gray-50 last:border-b-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0">
                  {(s.prenom?.[0] || "") + (s.nom?.[0] || "")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.prenom} {s.nom}</p>
                  <p className="text-xs text-gray-500 truncate">{s.niveau || ''} {s.classe ? `· ${s.classe}` : ''} · Massar: {s.id_massar || '—'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">{t('school.selectLevel')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {niveaux.map((n, i) => (
          <button key={n.niveau} onClick={() => navigate(`/school-life/students/${encodeURIComponent(n.niveau)}`)}
            className={`relative bg-white rounded-2xl border ${colors[i % 3]?.border || 'border-gray-200'} shadow-sm hover:shadow-md transition-all p-6 text-left group`}>
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[i % 3]?.bg || 'from-gray-500 to-gray-600'} flex items-center justify-center mb-4`}>
              <Users size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{n.niveau}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span><strong className="text-gray-900">{n.nb_classes}</strong> {t('school.classes')}</span>
              <span><strong className="text-gray-900">{n.nb_eleves}</strong> {t('school.students')}</span>
            </div>
            <span className="absolute top-4 right-4 text-gray-300 group-hover:text-blue-500 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ClasseSelector({ api }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { niveau } = useParams();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalResults, setGlobalResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const decodedNiveau = decodeURIComponent(niveau);

  useEffect(() => {
    api.get('/eleves/classes', { params: { niveau: decodedNiveau } })
      .then(r => setClasses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api, decodedNiveau]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!globalQuery.trim()) { setGlobalResults([]); setShowResults(false); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await api.get('/eleves/search-global', { params: { q: globalQuery } });
        setGlobalResults(r.data);
        setShowResults(true);
      } catch {}
      setSearching(false);
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [globalQuery, api]);

  useEffect(() => {
    const handleClick = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (loading) return <div className="text-center py-20"><Loader2 size={32} className="animate-spin text-blue-500 mx-auto" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <button onClick={() => navigate('/school-life/students')} className="hover:text-blue-600 transition">{t('school.levels')}</button>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{decodedNiveau}</span>
      </div>
      <div ref={searchRef} className="relative mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={globalQuery} onChange={e => setGlobalQuery(e.target.value)}
            placeholder={t('school.globalSearch')}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />}
        </div>
        {showResults && globalResults.length > 0 && (
          <div className="absolute top-full mt-1 left-0 w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto">
            {globalResults.map(s => (
              <button key={s.id} onClick={() => { setShowResults(false); setGlobalQuery(''); navigate(`/school-life/students/${encodeURIComponent(s.niveau || '')}/${encodeURIComponent(s.classe || '')}`); }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50 text-left border-b border-gray-50 last:border-b-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0">
                  {(s.prenom?.[0] || "") + (s.nom?.[0] || "")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.prenom} {s.nom}</p>
                  <p className="text-xs text-gray-500 truncate">{s.niveau || ''} {s.classe ? `· ${s.classe}` : ''} · Massar: {s.id_massar || '—'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-6">{decodedNiveau} — {t('school.selectClass')}</h2>
      {classes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-medium">{t('school.noClasses')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <button key={c.classe} onClick={() => navigate(`/school-life/students/${niveau}/${encodeURIComponent(c.classe)}`)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 text-left group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{c.classe}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <strong className="text-gray-900">{c.nb_eleves}</strong> {t('school.students')}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Users size={20} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Student Card ---
function StudentCard({ student, onEdit, onDelete, onClick, onSendEmail, onMarkAbsence }) {
  const { t } = useTranslation();
  const isAlert = student.absences >= 10;
  const isWarning = student.absences >= 5 && student.absences < 10;
  const avatarColors = [
    "from-red-500 to-orange-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600",
    "from-amber-500 to-red-600", "from-purple-500 to-pink-600", "from-cyan-500 to-blue-600", "from-rose-500 to-red-600",
  ];
  const colorIdx = (student.id || 1) % avatarColors.length;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all ${isAlert ? "bg-red-50/50" : ""}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${avatarColors[colorIdx]} flex-shrink-0`}>
        {(student.prenom?.[0] || "") + (student.nom?.[0] || "")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{student.prenom} {student.nom}</p>
        <p className="text-xs text-gray-500 truncate">
          Massar: {student.id_massar || '—'} · {student.classe || '—'}
          {student.absences > 0 && (
            <strong className={`ml-1 ${isAlert ? "text-red-600" : isWarning ? "text-amber-600" : "text-gray-500"}`}>
              · {student.absences}{t('school.hoursAbsences')}
            </strong>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {isAlert ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">{t('school.alert')}</span>
        ) : isWarning ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">{t('school.warning')}</span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{t('school.normal')}</span>
        )}
        <button onClick={() => onClick?.(student)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t('school.dossier')}>
          <Eye size={14} />
        </button>
        {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t('common.edit')}>
          <Pencil size={14} />
        </button>}
        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(student); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title={t('school.deleteStudent')}>
          <Trash2 size={14} />
        </button>}
        {onSendEmail && <button onClick={(e) => { e.stopPropagation(); onSendEmail(student); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t('school.sendAlertEmail')}>
          <Mail size={14} />
        </button>}
        {onMarkAbsence && <button onClick={(e) => { e.stopPropagation(); onMarkAbsence(student); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title={t('school.markAbsence')}>
          <Calendar size={14} />
        </button>}
      </div>
    </div>
  );
}

// --- Mark Absence Modal ---
function MarkAbsenceModal({ api, student, onClose, onSaved }) {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [justifie, setJustifie] = useState(false);
  const [motif, setMotif] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/eleves/absences/records', { eleve_id: student.id, date, justifie, motif: motif || null });
      pushToast("success", t('school.absenceRecorded'));
      onSaved();
      onClose();
    } catch {
      pushToast("error", t('school.absenceRecordError'));
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{t('school.markAbsence')} — {student.prenom} {student.nom}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('school.date')}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-600">{t('school.justifieLabel')}</span>
            <button type="button" onClick={() => setJustifie(!justifie)}
              className={`relative w-10 h-5 rounded-full transition-colors ${justifie ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${justifie ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('school.motif')}</label>
            <input value={motif} onChange={e => setMotif(e.target.value)} placeholder={t('school.motifPlaceholder')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">{t('school.cancel')}</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {t('school.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Mapping Confirm Modal (AI column mapping) ---
const SCHEMA_FIELDS = ['id_massar', 'nom', 'prenom', 'classe', 'niveau', 'date_naissance', 'email_parent', 'telephone_parent'];
const FIELD_LABELS = {
  id_massar: 'MASSAR', nom: 'Nom', prenom: 'Prénom', classe: 'Classe',
  niveau: 'Niveau', date_naissance: 'Date naissance',
  email_parent: 'Email parent', telephone_parent: 'Téléphone parent'
};

function MappingConfirmModal({ fileName, totalRows, headers, rows, initialMapping, unmapped, detectedNiveau, detectedClasse, api, onClose, onImported }) {
  const { t } = useTranslation();
  const [niveau, setNiveau] = useState(detectedNiveau || '');
  const [classe, setClasse] = useState(detectedClasse || '');
  const [mapping, setMapping] = useState(() => {
    const m = {};
    for (const field of SCHEMA_FIELDS) {
      m[field] = initialMapping[field] || null;
    }
    for (const h of unmapped) {
      m[`_unmap_${h}`] = h;
    }
    return m;
  });
  const [fieldToHeader, setFieldToHeader] = useState(() => {
    const fth = {};
    for (const field of SCHEMA_FIELDS) {
      if (initialMapping[field]) fth[initialMapping[field]] = field;
    }
    return fth;
  });
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(() => rows.slice(0, 3));

  const assignedHeaders = Object.keys(fieldToHeader).filter(h => fieldToHeader[h] !== 'ignorer');
  const ignoredHeaders = Object.keys(fieldToHeader).filter(h => fieldToHeader[h] === 'ignorer');

  const handleFieldChange = (header, newField) => {
    setFieldToHeader(prev => {
      const next = { ...prev };
      const oldField = prev[header];
      if (oldField && oldField !== 'ignorer') {
        next[header] = newField;
      } else {
        next[header] = newField;
      }
      return next;
    });
    setMapping(prev => {
      const next = { ...prev, [newField]: header };
      return next;
    });
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const usedFields = Object.entries(fieldToHeader).filter(([, f]) => f && f !== 'ignorer');
      const students = rows.map(row => {
        const s = {};
        for (const [header, field] of usedFields) {
          const val = String(row[header] || '').trim();
          if (field === 'date_naissance' && val) {
            s[field] = typeof row[header] === 'number' ? XLSX.SSF.format('yyyy-mm-dd', row[header]) : val;
          } else if (['email_parent', 'telephone_parent'].includes(field)) {
            s[field] = val || null;
          } else if (!['niveau', 'classe'].includes(field)) {
            s[field] = val;
          }
        }
        s.niveau = niveau;
        s.classe = classe;
        return s;
      }).filter(s => s.nom || s.prenom);
      const res = await api.post("/eleves/import", { students });
      if (res.data.skipped > 0) {
        pushToast("success", t('school.importPartial', { imported: res.data.imported, skipped: res.data.skipped }));
      } else {
        pushToast("success", t('school.importSuccess', { count: res.data.imported }));
      }
      onImported();
      onClose();
    } catch {
      pushToast("error", t('school.importError'));
    } finally { setImporting(false); }
  };

  const allFields = ['ignorer', ...SCHEMA_FIELDS];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('school.mappingTitle')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{fileName} — {totalRows} {t('school.students').toLowerCase()} {t('school.detected').toLowerCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <div className="flex gap-4 p-3 bg-blue-50 rounded-xl border border-blue-100 mb-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-blue-700 mb-1">{t('school.niveau')}</label>
              <input value={niveau} onChange={e => setNiveau(e.target.value)}
                className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-blue-700 mb-1">{t('school.classe')}</label>
              <input value={classe} onChange={e => setClasse(e.target.value)}
                className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('school.mappingColumns')}</p>
          {headers.map(header => {
            const currentField = fieldToHeader[header] || 'ignorer';
            const isUnmapped = unmapped.includes(header);
            return (
              <div key={header} className={`flex items-center gap-3 p-3 rounded-xl border ${isUnmapped ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-white'}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{header}</p>
                  {isUnmapped && <p className="text-[10px] text-amber-600 font-medium">{t('school.unmappedHint')}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">→</span>
                  <select value={currentField} onChange={e => handleFieldChange(header, e.target.value)}
                    className={`text-sm border rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 ${currentField === 'ignorer' ? 'text-gray-400 border-gray-200' : 'text-gray-900 border-blue-200 bg-blue-50/50'}`}>
                    {allFields.map(f => (
                      <option key={f} value={f}>{f === 'ignorer' ? `— ${t('school.ignoreCol')} —` : FIELD_LABELS[f] || f}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">{assignedHeaders.length} {t('school.mapped')}</span>
            {ignoredHeaders.length > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-semibold">{ignoredHeaders.length} {t('school.ignored')}</span>}
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-semibold">{totalRows} lignes</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">{t('school.cancel')}</button>
          <button onClick={handleImport} disabled={importing || assignedHeaders.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 flex items-center gap-2">
            {importing ? <Loader2 size={16} className="animate-spin" /> : null}
            {t('school.importStudents', { count: totalRows })}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClasseDashboard({ api }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { niveau, classe } = useParams();
  const decodedNiveau = decodeURIComponent(niveau);
  const decodedClasse = decodeURIComponent(classe);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [dossierStudent, setDossierStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [markingAbsence, setMarkingAbsence] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [mappingData, setMappingData] = useState(null);
  const fileInputRef = useRef(null);

  const loadData = () => {
    setLoading(true);
    api.get('/eleves/by-classe', { params: { niveau: decodedNiveau, classe: decodedClasse } })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [api, decodedNiveau, decodedClasse]);

  const handleDelete = (student) => {
    if (!confirm(t('school.deleteStudentConfirm', { name: `${student.prenom} ${student.nom}` }))) return;
    api.delete(`/eleves/${student.id}`)
      .then(() => { pushToast("success", t('school.studentDeleted')); loadData(); })
      .catch(() => pushToast("error", t('school.studentDeleteError')));
  };

  const handleSendEmail = async (student) => {
    try {
      const res = await api.post(`/eleves/${student.id}/alert-email`);
      if (res.data.sent) pushToast("success", t('school.emailAlertSent'));
      else pushToast("warning", t('school.emailNotConfigured'));
    } catch { pushToast("error", t('school.emailFailed')); }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      // Detect niveau/classe from metadata rows
      const NIVEAU_MAP = {
        "الأولى إعدادي": "1ère année collège",
        "الثانية إعدادي": "2ème année collège",
        "الثالثة إعدادي": "3ème année collège",
      };
      let detectedNiveau = decodedNiveau;
      let detectedClasse = decodedClasse;
      for (const row of rawRows) {
        const text = row.join(' ');
        const nm = text.match(/المستوى\s*:?\s*(.+)/i);
        if (nm) {
          const raw = nm[1].trim();
          for (const [ar, fr] of Object.entries(NIVEAU_MAP)) {
            if (raw.includes(ar)) { detectedNiveau = fr; break; }
          }
        }
        const cm = text.match(/القسم\s*:?\s*(.+)/i);
        if (cm) {
          const raw = cm[1].trim();
          const parts = raw.split('-');
          detectedClasse = parts.length >= 2 ? parts[parts.length - 1].trim() : raw;
        }
      }

      // Find header row (first row with >=3 non-numeric text cells)
      let headerRowIdx = -1;
      for (let i = 0; i < rawRows.length; i++) {
        const nonEmpty = rawRows[i].filter(c => String(c).trim().length > 0);
        if (nonEmpty.length >= 3 && !nonEmpty.every(c => /^\d+$/.test(String(c).trim()))) {
          headerRowIdx = i; break;
        }
      }
      if (headerRowIdx === -1) { pushToast("error", t('school.importError')); setImportLoading(false); return; }

      // Build headers from discovered row
      const headerRow = rawRows[headerRowIdx];
      const validCols = headerRow.map((h, idx) => ({ h: String(h).trim(), idx })).filter(x => x.h.length > 0);
      const headersList = validCols.map(x => x.h);

      // Build data rows as objects
      const rows = [];
      for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
        const r = rawRows[i];
        const obj = {};
        let hasData = false;
        for (const { h, idx } of validCols) {
          const val = r[idx] !== undefined ? String(r[idx]).trim() : '';
          obj[h] = val; if (val) hasData = true;
        }
        if (hasData) rows.push(obj);
      }
      if (rows.length === 0) { pushToast("error", t('school.importError')); setImportLoading(false); return; }

      const res = await api.post("/eleves/import/ai-mapping", { headers: headersList });
      const { mapping, unmapped, source } = res.data;
      setMappingData({ fileName: file.name, totalRows: rows.length, headers: headersList, rows, mapping, unmapped, source, detectedNiveau, detectedClasse });
    } catch {
      pushToast("error", t('school.importError'));
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return <div className="text-center py-20"><Loader2 size={32} className="animate-spin text-blue-500 mx-auto" /></div>;
  if (!data) return null;

  const { students, stats } = data;
  const q = searchQuery.toLowerCase();
  const filteredStudents = students.filter(s =>
    !q || (s.nom || "").toLowerCase().includes(q) || (s.prenom || "").toLowerCase().includes(q) || (s.id_massar || "").toLowerCase().includes(q)
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <button onClick={() => navigate('/school-life/students')} className="hover:text-blue-600 transition">{t('school.levels')}</button>
        <span>/</span>
        <button onClick={() => navigate(`/school-life/students/${niveau}`)} className="hover:text-blue-600 transition">{decodedNiveau}</button>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{decodedClasse}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">{t('school.students')}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.total_eleves}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">{t('school.totalAbsences')}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.total_absences}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">{t('school.justifiedCount')}</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.total_justifiees}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">{t('school.alerts')}</p>
          <p className="text-2xl font-black text-red-600 mt-1">{stats.alert_count}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('school.searchStudent')}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <button onClick={() => fileInputRef.current?.click()} disabled={importLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-300">
            {importLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {t('school.importExcel')}
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm">
            <Plus size={16} />
            {t('school.addStudent')}
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-medium">{t('school.noStudents')}</div>
          ) : (
            filteredStudents.map(s => (
              <StudentCard key={s.id} student={s} onEdit={setEditingStudent} onDelete={handleDelete} onClick={setDossierStudent} onSendEmail={handleSendEmail} onMarkAbsence={setMarkingAbsence} />
            ))
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          {students.length} {t('school.totalStudents', { count: students.length })}
        </div>
      </div>

      {showAddModal && (
        <AddStudentModal api={api} onClose={() => setShowAddModal(false)} onAdded={loadData} />
      )}
      {editingStudent && (
        <EditStudentModal api={api} student={editingStudent} onClose={() => setEditingStudent(null)} onUpdated={loadData} />
      )}
      {dossierStudent && (
        <StudentDossierModal api={api} student={dossierStudent} onClose={() => setDossierStudent(null)} />
      )}
      {markingAbsence && (
        <MarkAbsenceModal api={api} student={markingAbsence} onClose={() => setMarkingAbsence(null)} onSaved={loadData} />
      )}
      {mappingData && (
        <MappingConfirmModal
          fileName={mappingData.fileName} totalRows={mappingData.totalRows}
          headers={mappingData.headers} rows={mappingData.rows}
          initialMapping={mappingData.mapping} unmapped={mappingData.unmapped}
          detectedNiveau={mappingData.detectedNiveau} detectedClasse={mappingData.detectedClasse}
          api={api} onClose={() => setMappingData(null)} onImported={loadData} />
      )}
    </div>
  );
}

const SUBJECT_LABELS = {
  maths: "Mathématiques", physique: "Physique-Chimie", svt: "SVT",
  francais: "Français", arabe: "Arabe", anglais: "Anglais",
  histoire_geo: "Histoire-Géo", education_islamique: "Éduc. Islamique",
  informatique: "Informatique", eps: "EPS", musique: "Musique", art: "Arts"
};

// --- Student Dossier Modal ---
function StudentDossierModal({ api, student, onClose }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("info");
  const [records, setRecords] = useState([]);
  const [grades, setGrades] = useState([]);
  const [gradeSemestre, setGradeSemestre] = useState("1");
  const [loading, setLoading] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => {
    if (!student || typeof student.id !== 'number') return;
    setLoading(true);
    api.get('/eleves/absences/records', { params: { eleve_id: student.id } })
      .then(r => setRecords(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [student, api]);

  useEffect(() => {
    if (!student || typeof student.id !== 'number' || activeTab !== "notes") return;
    setLoadingGrades(true);
    api.get(`/eleves/${student.id}/resultats`, { params: { semestre: gradeSemestre } })
      .then(r => setGrades(r.data))
      .catch(() => {})
      .finally(() => setLoadingGrades(false));
  }, [student, api, activeTab, gradeSemestre]);

  if (!student) return null;

  const isAlert = student.absences >= 10;
  const isWarning = student.absences >= 5 && student.absences < 10;
  const justified = student.absences_justifiees || 0;
  const unjustified = (student.absences || 0) - justified;
  const avatarColors = [
    "from-red-500 to-orange-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600",
    "from-amber-500 to-red-600", "from-purple-500 to-pink-600", "from-cyan-500 to-blue-600", "from-rose-500 to-red-600",
  ];
  const colorIdx = (student.id || 1) % avatarColors.length;

  const tabs = [
    { key: "info", label: t('school.absences'), icon: Calendar },
    { key: "notes", label: t('school.notes'), icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-100">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br ${avatarColors[colorIdx]} flex-shrink-0`}>
            {(student.prenom?.[0] || "") + (student.nom?.[0] || "")}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{student.prenom} {student.nom}</h2>
            <p className="text-sm text-gray-500 truncate">{t('school.massarCode')}: {student.id_massar || '—'} · {student.niveau || '—'} · {student.classe || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAlert ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">{t('school.alert')}</span>
            ) : isWarning ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{t('school.warning')}</span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{t('school.normal')}</span>
            )}
            <button onClick={async () => {
              setSendingEmail(true);
              try {
                const res = await api.post(`/eleves/${student.id}/alert-email`);
                if (res.data.sent) pushToast("success", t('school.emailAlertSent'));
                else pushToast("warning", t('school.emailNotConfigured'));
              } catch { pushToast("error", t('school.emailFailed')); }
              finally { setSendingEmail(false); }
            }} disabled={sendingEmail} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t('school.sendAlertEmail')}>
              {sendingEmail ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
            </button>
            {!student.user_id && (
              <button onClick={() => setShowCreateAccount(true)}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title={t('school.createAccount')}>
                <UserPlus size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {activeTab === "info" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">{t('school.classe')}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{student.classe || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">{t('school.niveau')}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{student.niveau || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">{t('school.dateNaissance')}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {student.date_naissance ? new Date(student.date_naissance).toLocaleDateString("fr-FR") : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">{t('school.totalAbs')}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{student.absences || 0}h</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">{t('school.emailParent')}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{student.email_parent || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">{t('school.telephoneParent')}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{student.telephone_parent || '—'}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{t('school.absencesStats')}</h3>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t('school.justifiees')}</span>
                      <span className="font-bold text-emerald-600">{justified}h</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(student.absences || 0) > 0 ? (justified / student.absences) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t('school.injustifiees')}</span>
                      <span className="font-bold text-red-600">{unjustified}h</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${(student.absences || 0) > 0 ? (unjustified / student.absences) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {student.absences > 0
                    ? `${Math.round((justified / student.absences) * 100)}% ${t('school.justified').toLowerCase()}, ${Math.round((unjustified / student.absences) * 100)}% ${t('school.unjustified').toLowerCase()}`
                    : t('school.noAbsences')}
                </p>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mb-3">{t('school.absenceHistory')}</h3>
              {loading ? (
                <div className="text-center py-8"><Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /></div>
              ) : records.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-medium">{t('school.noHistory')}</div>
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
            </>
          )}

          {activeTab === "notes" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">{t('school.notes')}</h3>
                <select value={gradeSemestre} onChange={e => setGradeSemestre(e.target.value)}
                  className="border border-gray-200 p-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="1">{t('documents.semester1')}</option>
                  <option value="2">{t('documents.semester2')}</option>
                </select>
              </div>

              {loadingGrades ? (
                <div className="text-center py-8"><Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /></div>
              ) : grades.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-medium">{t('school.noNotes')}</div>
              ) : (
                <div className="space-y-3">
                  {grades.map(grade => (
                    <div key={grade.id} className="bg-white border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">{t('documents.semester')} {grade.semestre}</p>
                      <div className="space-y-2">
                        {Object.entries(SUBJECT_LABELS).map(([key, label]) => {
                          const val = grade[key];
                          return (
                            <div key={key} className="flex items-center justify-between py-1">
                              <span className="text-sm text-gray-700">{label}</span>
                              <span className={`text-sm font-bold ${val >= 10 ? "text-emerald-600" : val > 0 ? "text-red-600" : "text-gray-400"}`}>
                                {val ? val.toFixed(2) : "—"} /20
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-sm font-bold text-gray-900">{t('documents.avg')}</span>
                        <span className={`text-lg font-black ${grade.moyenne_generale >= 10 ? "text-emerald-600" : "text-red-600"}`}>
                          {grade.moyenne_generale?.toFixed(2) ?? "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateAccount && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl" onClick={() => setShowCreateAccount(false)}>
          <div className="bg-white rounded-2xl p-5 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 mb-1">{t('school.createAccount')}</h3>
            <p className="text-xs text-gray-500 mb-3">{student.nom} {student.prenom} · {student.id_massar}</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
              <p className="text-xs text-gray-500">Email :</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {(() => {
                  const n = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                  return n(student.prenom) + n(student.nom) + '@borjazzaitoune.ma';
                })()}
              </p>
              <p className="text-xs text-gray-500 mt-2">Mot de passe :</p>
              <p className="text-sm font-mono text-gray-900">{student.id_massar || '—'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowCreateAccount(false); }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                {t('common.cancel')}
              </button>
              <button onClick={async () => {
                setCreatingAccount(true);
                try {
                  const res = await api.post('/auth/signup', {
                    role: 'eleve', eleve_id: student.id
                  });
                  pushToast("success", t('school.accountCreated'));
                  setShowCreateAccount(false);
                } catch (err) {
                  pushToast("error", err.response?.data?.error || t('errors.generic'));
                } finally { setCreatingAccount(false); }
              }} disabled={creatingAccount}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {creatingAccount ? <Loader2 size={14} className="animate-spin mx-auto" /> : t('school.createAccount')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

