import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, FileEdit, Loader2, Calendar, FileText, GraduationCap, User, Video, Eye, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReactPlayer from "react-player";
import DOMPurify from "dompurify";
import { exportToPdf } from "../../utils/pdfExport";

const TABS = [
  { key: "courses", icon: BookOpen },
  { key: "exercises", icon: FileEdit },
];

export default function StudentModule({ api }) {
  const { t } = useTranslation();
  const { subject } = useParams();
  const [tab, setTab] = useState("courses");
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    api.get("/student/profile").then(res => setProfile(res.data)).catch(() => {});
  }, [api]);

  useEffect(() => {
    if (!profile || !subject) return;
    setLoading(true);
    setSelectedItem(null);
    const endpoint = tab === "courses" ? "/student/courses" : "/student/exercises";
    api.get(endpoint, { params: { subject } })
      .then(res => setItems(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, subject, profile, api]);

  useEffect(() => {
    if (!selectedItem) return;
    const payload = tab === "courses"
      ? { course_id: selectedItem.id }
      : { exercise_id: selectedItem.id };
    api.post('/student/view', payload).catch(() => {});
  }, [selectedItem, tab, api]);

  const handleExportPdf = async () => {
    await exportToPdf(contentRef.current, `${selectedItem?.title || 'document'}.pdf`);
  };

  return (
    <div className="min-h-full bg-gray-50 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-6 py-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={16} className="text-blue-300" />
              <span className="text-blue-300 text-xs font-medium uppercase tracking-widest">{t('student.title')}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {profile?.prenom} {profile?.nom}
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              {profile?.niveau} · {t('class')} {profile?.classe}
              {subject && <span> · {subject}</span>}
            </p>
          </div>
          {subject && (
            <div className="flex items-center gap-2">
              {TABS.map(({ key, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    tab === key ? "bg-white text-blue-900 shadow-sm" : "bg-white/10 text-white hover:bg-white/20"
                  }`}>
                  <Icon size={16} /> {t(`student.${key}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {selectedItem ? (
          <div>
            <button onClick={() => setSelectedItem(null)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors">
              <Eye size={16} /> {t('student.backToList')}
            </button>
            <div ref={contentRef} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedItem.title}</h2>
                  {selectedItem.teacher_prenom && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <User size={14} />
                      <span>{selectedItem.teacher_prenom} {selectedItem.teacher_nom}</span>
                    </div>
                  )}
                </div>
                <button onClick={handleExportPdf}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Download size={16} /> {t('student.exportPdf')}
                </button>
              </div>
              {selectedItem.description && (
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              )}
              {selectedItem.content && (
                <div className="prose prose-sm max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedItem.content) }} />
              )}
              {selectedItem.video_url && <VideoPlayer url={selectedItem.video_url} />}
              <div className="flex items-center gap-3 text-sm text-gray-500 border-t border-gray-100 pt-4 mt-4">
                {selectedItem.due_date && (
                  <span className="flex items-center gap-1"><Calendar size={14} /> {t('student.dueDate')} {new Date(selectedItem.due_date).toLocaleDateString()}</span>
                )}
                {selectedItem.file_url && (
                  <a href={`http://localhost:5000${selectedItem.file_url}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline">
                    <FileText size={14} /> {t('student.file')}
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : !subject ? (
          <div className="text-center py-16">
            <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{t('sidebar.student')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('student.selectSubject')}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t(`student.no${tab === "courses" ? "Courses" : "Exercises"}`)}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <div key={item.id} onClick={() => setSelectedItem(item)}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    {tab === "courses" ? <BookOpen size={16} className="text-blue-600" /> : <FileEdit size={16} className="text-blue-600" />}
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <User size={12} />
                  <span>{item.teacher_prenom} {item.teacher_nom}</span>
                </div>
                {item.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {item.due_date && (
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(item.due_date).toLocaleDateString()}</span>
                  )}
                  {item.file_url && (
                    <span className="flex items-center gap-1 text-blue-600"><FileText size={12} /> {t('student.file')}</span>
                  )}
                  {item.video_url && (
                    <span className="flex items-center gap-1 text-purple-600"><Video size={12} /> Vidéo</span>
                  )}
                  {item.content && (
                    <span className="flex items-center gap-1 text-emerald-600"><Eye size={12} /> Contenu</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VideoPlayer({ url }) {
  const [error, setError] = useState(false);
  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;

  if (error) {
    return (
      <div className="mb-4 rounded-xl p-6 text-center bg-red-50 border border-red-200">
        <p className="text-sm text-red-700 mb-2">Format vidéo non supporté par le navigateur</p>
        <a href={fullUrl} target="_blank" rel="noopener noreferrer" download
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
          <Download size={16} /> Télécharger la vidéo
        </a>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
      <ReactPlayer
        url={fullUrl}
        controls
        width="100%"
        height="100%"
        onError={() => setError(true)}
      />
    </div>
  );
}
