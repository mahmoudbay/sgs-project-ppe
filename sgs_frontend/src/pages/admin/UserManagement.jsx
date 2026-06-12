import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Users, Shield, UserCog, Search, Filter, MoreHorizontal, Edit3, Trash2, ToggleLeft, ToggleRight, X, Mail, Lock, Eye, EyeOff, GraduationCap, Link } from "lucide-react";
import { DataTable, StatusBadge, QuickActionButton } from "../../components/ui/DataTable";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { pushToast } from "../../components/Notifications";

const ROLES = [
  { value: "administrateur", labelKey: "users.admin", color: "bg-purple-100 text-purple-800" },
  { value: "direction", labelKey: "users.direction", color: "bg-emerald-100 text-emerald-800" },
  { value: "employe", labelKey: "users.employee", color: "bg-blue-100 text-blue-800" },
  { value: "service_financier", labelKey: "users.finance", color: "bg-cyan-100 text-cyan-800" },
  { value: "surveillant_general", labelKey: "users.supervisor", color: "bg-amber-100 text-amber-800" },
  { value: "enseignant", labelKey: "users.teacher", color: "bg-indigo-100 text-indigo-800" },
  { value: "eleve", labelKey: "users.eleve", color: "bg-teal-100 text-teal-800" },
];

const ROLE_MAP = Object.fromEntries(ROLES.map(r => [r.value, r]));
const INITIAL_FORM = { nom: "", prenom: "", email: "", password: "", role: "employe", actif: true, subject: "" };

export default function UserManagement({ api }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningUser, setAssigningUser] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingUser, setLinkingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data.data || response.data);
    } catch {
      pushToast("error", t("users.loadError"));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setFormData(INITIAL_FORM);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setFormData({ nom: u.nom, prenom: u.prenom || "", email: u.email, password: "", role: u.role, actif: u.actif !== false, subject: u.subject || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.email) {
      pushToast("error", t("users.fieldsRequired"));
      return;
    }
    if (!editingUser && !formData.password) {
      pushToast("error", t("users.passwordRequired"));
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const payload = { nom: formData.nom, prenom: formData.prenom, email: formData.email, role: formData.role, actif: formData.actif, subject: formData.subject };
        if (formData.password) payload.password = formData.password;
        await api.put(`/users/${editingUser.id}`, payload);
        pushToast("success", t("users.modifiedSuccess"));
      } else {
        await api.post("/auth/signup", formData);
        pushToast("success", t("users.createdSuccess"));
      }
      fetchUsers();
      setShowForm(false);
    } catch (err) {
      pushToast("error", err.response?.data?.error || t("users.error"));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u) => {
    try {
      await api.put(`/users/${u.id}`, { actif: !u.actif });
      pushToast("success", t(u.actif ? "users.toggledInactive" : "users.toggledActive"));
      fetchUsers();
    } catch {
      pushToast("error", t("users.statusModifyError"));
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/users/${confirmDelete.id}`);
      pushToast("success", t("users.deletedSuccess"));
      fetchUsers();
    } catch {
      pushToast("error", t("users.deleteError"));
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns = [
    { key: "nom", label: t("users.user"), sortable: true, render: (u) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {u.initiales || u.nom?.charAt(0) || "U"}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{u.prenom} {u.nom}</p>
          <p className="text-xs text-gray-400">{u.email}</p>
        </div>
      </div>
    )},
    { key: "email", label: t("users.email"), sortable: true, render: (u) => <span className="text-sm text-gray-600">{u.email}</span> },
    { key: "role", label: t("users.role"), sortable: true, render: (u) => {
      const r = ROLE_MAP[u.role] || { labelKey: null, color: "bg-gray-100 text-gray-700" };
      return <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${r.color}`}>{r.labelKey ? t(r.labelKey) : u.role}</span>;
    }},
    { key: "actif", label: t("users.status"), sortable: true, render: (u) => (
      <StatusBadge status={t(u.actif ? "users.active" : "users.inactive")} config={{
        [t("users.active")]: { label: t("users.active"), bg: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
        [t("users.inactive")]: { label: t("users.inactive"), bg: "bg-red-100 text-red-800", dot: "bg-red-500" },
      }} />
    )},
  ];

  const filteredUsers = roleFilter === "all" ? users : users.filter(u => u.role === roleFilter);

  const openAssignModal = (u) => {
    setAssigningUser(u);
    setShowAssignModal(true);
  };

  const openLinkModal = (u) => {
    setLinkingUser(u);
    setShowLinkModal(true);
  };

  const actions = (u) => (
    <>
      <QuickActionButton icon={Edit3} label={t("users.edit")} onClick={() => openEdit(u)} color="blue" />
      {u.role === "enseignant" && (
        <QuickActionButton icon={GraduationCap} label={t("users.assignAction")} onClick={() => openAssignModal(u)} color="indigo" />
      )}
      {u.role === "eleve" && (
        <QuickActionButton icon={Link} label={t("users.linkStudent")} onClick={() => openLinkModal(u)} color="teal" />
      )}
      <QuickActionButton icon={u.actif ? ToggleRight : ToggleLeft} label={t(u.actif ? "users.disable" : "users.enable")} onClick={() => toggleStatus(u)} color={u.actif ? "amber" : "green"} />
      <QuickActionButton icon={Trash2} label={t("users.delete")} onClick={() => setConfirmDelete(u)} color="red" />
    </>
  );

  return (
    <div className="min-h-full bg-gray-50 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-4 lg:px-6 py-6 lg:py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-blue-300" />
              <span className="text-blue-300 text-xs font-medium uppercase tracking-widest">{t("sidebar.admin")}</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{t("users.title")}</h1>
            <p className="text-blue-200 mt-1 text-sm">{t("users.subtitle")}</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-3 bg-white text-blue-900 rounded-xl font-semibold text-sm hover:bg-blue-50 transition shadow-lg">
            <Plus size={18} /> {t("users.newUser")}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-6">
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-slide-up max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserCog size={20} className="text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{editingUser ? t("users.editUser") : t("users.createUser")}</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("users.prenom")}</label>
                  <input type="text" required value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("users.nom")}</label>
                  <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("users.email")}</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {editingUser ? t("users.newPassword") : t("users.password")}
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} required={!editingUser} value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("users.role")}</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{t(r.labelKey)}</option>)}
                </select>
              </div>
              {formData.role === "enseignant" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("users.subject")}</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder={t("users.subjectPlaceholder")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                </div>
              )}
              <button type="submit" disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? t("users.saving") : (editingUser ? t("users.modifyUserBtn") : t("users.createUserBtn"))}
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500 font-medium">{t("users.filterByRole")}</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${roleFilter === "all" ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t("users.all")}
            </button>
            {ROLES.map(r => (
              <button key={r.value} onClick={() => setRoleFilter(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${roleFilter === r.value ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {t(r.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          searchable
          searchKeys={["nom", "prenom", "email"]}
          searchPlaceholder={t("users.searchPlaceholder")}
          pageSize={8}
          emptyTitle={t("users.noUsers")}
          emptyDescription={t("users.noUsersDesc")}
          actions={actions}
        />
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title={t("users.deleteTitle")}
        message={t("users.deleteMessage", { name: `${confirmDelete?.prenom} ${confirmDelete?.nom}` })}
        confirmLabel={t("users.deleteConfirm")}
        cancelLabel={t("users.cancel")}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {showAssignModal && assigningUser && (
        <AssignModal
          api={api}
          user={assigningUser}
          t={t}
          onClose={() => { setShowAssignModal(false); setAssigningUser(null); }}
        />
      )}

      {showLinkModal && linkingUser && (
        <LinkStudentModal
          api={api}
          user={linkingUser}
          t={t}
          onClose={() => { setShowLinkModal(false); setLinkingUser(null); }}
        />
      )}
    </div>
  );
}

function AssignModal({ api, user, t, onClose }) {
  const [assignments, setAssignments] = useState([]);
  const [subject, setSubject] = useState(user.subject || "");
  const [niveaux, setNiveaux] = useState([]);
  const [niveau, setNiveau] = useState("");
  const [classes, setClasses] = useState([]);
  const [classe, setClasse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/users/${user.id}/assignments`).then(res => {
      setAssignments(res.data.assignments || []);
      if (!subject && res.data.subject) setSubject(res.data.subject);
    }).catch(() => {});
    api.get("/eleves/niveaux").then(res => setNiveaux(res.data || [])).catch(() => {});
  }, [user.id]);

  useEffect(() => {
    if (!niveau) { setClasses([]); setClasse(""); return; }
    api.get("/eleves/classes", { params: { niveau } })
      .then(res => setClasses(res.data || []))
      .catch(() => setClasses([]));
  }, [niveau, api]);

  const handleAdd = async () => {
    if (!subject || !niveau || !classe) return;
    try {
      const res = await api.post(`/users/${user.id}/assignments`, { subject, niveau, classe });
      setAssignments(prev => [...prev, res.data]);
      pushToast("success", t("users.assignmentAdded"));
    } catch (err) {
      pushToast("error", err.response?.data?.error || t("users.error"));
    }
  };

  const handleDelete = async (assignId) => {
    try {
      await api.delete(`/users/${user.id}/assignments/${assignId}`);
      setAssignments(prev => prev.filter(a => a.id !== assignId));
      pushToast("success", t("users.assignmentDeleted"));
    } catch (err) {
      pushToast("error", err.response?.data?.error || t("users.error"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <GraduationCap size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">{t("users.assignTitle")}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {user.prenom} {user.nom}
        </p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("users.currentAssignments")}</h3>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">{t("users.noAssignments")}</p>
          ) : (
            <div className="space-y-2">
              {assignments.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">{a.niveau}</span>
                    <span className="text-sm font-medium text-gray-700">{a.classe}</span>
                    <span className="text-xs text-gray-400">— {a.subject}</span>
                  </div>
                  <button onClick={() => handleDelete(a.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{t("users.addAssignment")}</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("users.subject")}</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("users.niveau")}</label>
              <select value={niveau} onChange={e => setNiveau(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">--</option>
                {niveaux.map(n => <option key={n.niveau} value={n.niveau}>{n.niveau}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("users.classe")}</label>
              <select value={classe} onChange={e => setClasse(e.target.value)} disabled={!niveau}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50">
                <option value="">--</option>
                {classes.map(c => <option key={c.classe} value={c.classe}>{c.classe}</option>)}
              </select>
            </div>
            <button onClick={handleAdd} disabled={!subject || !niveau || !classe}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {t("users.addAssignment")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkStudentModal({ api, user, t, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(() => {
      setSearching(true);
      api.get("/eleves/search", { params: { q: query } })
        .then(res => setResults(res.data || []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, api]);

  const handleLink = async () => {
    if (!selected) return;
    setLinking(true);
    try {
      await api.put(`/eleves/${selected.id}/link-user`, { user_id: user.id });
      pushToast("success", t("users.studentLinked"));
      onClose();
    } catch (err) {
      pushToast("error", err.response?.data?.error || t("users.linkError"));
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Link size={20} className="text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">{t("users.linkStudent")}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <p className="text-sm text-gray-600 mb-4">{user.prenom} {user.nom} ({user.email})</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("users.searchStudent")}</label>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
        </div>

        {searching && <div className="text-center py-4 text-sm text-gray-400"><Loader2 size={20} className="animate-spin inline-block mr-2" />Recherche...</div>}

        {!searching && results.length > 0 && (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {results.map(s => (
              <button key={s.id} onClick={() => setSelected(s)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                  selected?.id === s.id ? "bg-teal-50 border border-teal-300" : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                }`}>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{s.prenom} {s.nom}</p>
                  <p className="text-xs text-gray-500">{s.niveau} · {s.classe} · {s.id_massar}</p>
                </div>
                {s.user_id && <span className="text-xs text-red-500 font-medium">{t("users.alreadyLinked")}</span>}
              </button>
            ))}
          </div>
        )}

        {!searching && query.length >= 2 && results.length === 0 && (
          <p className="text-center py-4 text-sm text-gray-400">{t("users.noStudentsFound")}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            {t("users.cancel")}
          </button>
          <button onClick={handleLink} disabled={!selected || linking}
            className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {linking ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("users.linkStudent")}
          </button>
        </div>
      </div>
    </div>
  );
}
