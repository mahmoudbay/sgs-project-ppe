import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, DollarSign, BookOpen, FileText, Settings,
  ChevronRight, X, GraduationCap, UserCheck, BookMarked, MessageCircle,
} from "lucide-react";

function useNavSections() {
  const { t } = useTranslation();
  return [
    {
      label: t('sidebar.principal'),
      items: [
        { label: t('sidebar.dashboard'), path: "/dashboard", icon: LayoutDashboard, permission: null },
      ],
    },
    {
      label: t('sidebar.modules'),
      items: [
        { label: t('sidebar.rh'), path: "/rh", icon: Users, permission: ["hr:read_own", "hr:read_all"], badge: 3 },
        { label: t('sidebar.finance'), path: "/finance", icon: DollarSign, permission: ["finance:read", "finance:manage_expense", "finance:manage_revenue"] },
        { label: t('sidebar.school'), path: "/school-life", icon: BookOpen, permission: ["students:read", "students:manage"], excludeAdmin: true, excludeRoles: ["enseignant"] },
        { label: t('sidebar.documents'), path: "/documents", icon: FileText, permission: ["certificates:generate", "grades:manage"] },
        { label: t('sidebar.teacher'), path: "/teacher", icon: GraduationCap, permission: ["courses:manage", "grades:manage_own"] },
      ],
    },
    {
      label: t('sidebar.system'),
      items: [
        { label: t('sidebar.admin'), path: "/admin/users", icon: Settings, permission: "users:manage", adminOnly: true },
      ],
    },
  ];
}

export default function Sidebar({ isOpen, onToggle, user, api, hasPermission }) {
  const navSections = useNavSections();
  const location = useLocation();
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (user?.dbRole === 'eleve') {
      api.get("/student/subjects").then(res => setSubjects(res.data || [])).catch(() => {});
    }
  }, [user?.dbRole, api]);

  const isActive = (path) => location.pathname.startsWith(path);

  const isItemVisible = (item) => {
    if (item.adminOnly) return user?.role === "administrateur";
    if (item.excludeAdmin && user?.role === "administrateur") return false;
    if (item.excludeRoles?.includes(user?.dbRole)) return false;
    if (item.permission) return hasPermission(item.permission);
    return true;
  };

  const renderLink = (item, active) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
          active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={active ? "" : "text-gray-400 group-hover:text-white transition-colors"} />
          <span className="font-medium text-sm">{item.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {item.badge && (
            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full">{item.badge}</span>
          )}
          {active && <ChevronRight size={16} className="animate-fade-in" />}
        </div>
      </Link>
    );
  };

  const renderSubjectLink = (subj, active) => {
    const path = `/student/${encodeURIComponent(subj.subject)}`;
    return (
      <Link
        key={path}
        to={path}
        onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
        className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ${
          active
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <BookMarked size={18} className={active ? "" : "text-gray-400 group-hover:text-white transition-colors shrink-0"} />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{subj.subject}</p>
            {subj.teacher_prenom && (
              <p className="text-[10px] text-gray-500 truncate">{subj.teacher_prenom} {subj.teacher_nom}</p>
            )}
          </div>
        </div>
        {active && <ChevronRight size={14} className="shrink-0 animate-fade-in" />}
      </Link>
    );
  };

  return (
    <>
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-30 h-screen w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-5 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
              SGS
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">SGS</h2>
              <p className="text-[10px] text-gray-400 tracking-wide">Collège Borj Azzaitoune</p>
            </div>
            <button onClick={onToggle} className="lg:hidden ml-auto p-1 text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 py-3 mx-3 mt-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shadow-sm bg-gradient-to-br from-blue-400 to-indigo-500">
              {user?.photo ? (
                <img src={`http://localhost:5000${user.photo}`} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.initiales || user?.nom?.charAt(0) || "U"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.prenom} {user?.nom}</p>
              <p className="text-[11px] text-gray-400 capitalize truncate">{user?.role?.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {(user?.dbRole === 'eleve' || user?.dbRole === 'enseignant') && (
          <div className="px-3 mt-1 mb-2">
            <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-chat'))}
              className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-300 hover:bg-white/10 hover:text-white">
              <MessageCircle size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              <span className="font-medium text-sm">{t('sidebar.messages')}</span>
            </button>
          </div>
        )}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {user?.dbRole === 'eleve' ? (
            <>
              <div className="mb-4">
                <div className="px-3 mb-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('sidebar.principal')}</span>
                </div>
                {renderLink({ label: t('sidebar.dashboard'), path: "/dashboard", icon: LayoutDashboard }, location.pathname.startsWith("/dashboard"))}
              </div>
              <div className="mb-4">
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('student.title')}</span>
                </div>
                {subjects.length === 0 ? (
                  <p className="px-3 text-[11px] text-gray-500">{t('student.noSubjects')}</p>
                ) : (
                  <div className="space-y-0.5">
                    {subjects.map(s => renderSubjectLink(s, location.pathname === `/student/${encodeURIComponent(s.subject)}`))}
                  </div>
                )}
              </div>
            </>
          ) : (
            navSections.map((section) => {
              const visibleItems = section.items.filter(isItemVisible);
              if (visibleItems.length === 0) return null;
              return (
                <div key={section.label} className="mb-4">
                  <div className="px-3 mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{section.label}</span>
                  </div>
                  {visibleItems.map((item) => {
                    const active = isActive(item.path);
                    return renderLink(item, active);
                  })}
                </div>
              );
            })
          )}
        </nav>

        <div className="px-5 py-4 border-t border-gray-700/50 bg-gray-800/50">
          <div className="text-[11px] text-gray-500 space-y-0.5">
            <p>SGS v2.0</p>
            <p>© 2026 College Borj Azaitoune</p>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden animate-fade-in" onClick={onToggle} />
      )}
    </>
  );
}
