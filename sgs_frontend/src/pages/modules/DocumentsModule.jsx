import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { FileText, BarChart3, Upload, TrendingUp, Users, Loader2, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import { DataTable } from "../../components/ui/DataTable";
import { pushToast } from "../../components/Notifications";

export default function DocumentsModule({ user, api, hasPermission }) {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/resultats");
      setResults(res.data.data || res.data);
    } catch { pushToast("error", t('documents.loadError')); }
    finally { setLoading(false); }
  };

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
          <Route path="results" element={<ResultsManagement results={results} api={api} onRefresh={fetchDocuments} loading={loading} />} />
          <Route path="certificates" element={<CertificatesManagement api={api} user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

function ResultsManagement({ results, api, onRefresh, loading }) {
  const [trimester, setTrimester] = useState("1");
  const [niveau, setNiveau] = useState("1AC");
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();

  const filtered = results.filter(r => r.trimestre === parseInt(trimester) && r.niveau === niveau);

  const total = filtered.length;
  const avg = total > 0 ? (filtered.reduce((acc, curr) => acc + parseFloat(curr.moyenne_generale), 0) / total).toFixed(2) : "0.00";
  const successCount = filtered.filter(r => parseFloat(r.moyenne_generale) >= 10).length;
  const success = total > 0 ? ((successCount / total) * 100).toFixed(1) : "0";

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
            niveau: niveau,
            trimestre: parseInt(trimester),
            maths: subjects[0], physique: subjects[1], svt: subjects[2],
            francais: subjects[3], arabe: subjects[4], anglais: subjects[5],
            histoire_geo: subjects[6], education_islamique: subjects[7],
            informatique: subjects[8], eps: subjects[9], musique: subjects[10], art: subjects[11],
            moyenne_generale: moy
          };
        });

        await api.post("/resultats/upload", { resultats: processed });
        pushToast("success", t('documents.importedData', { niveau, count: processed.length }));
        onRefresh();
      } catch (err) { pushToast("error", t('documents.errorWithMessage', { message: err.response?.data?.error || err.message })); }
      finally { setUploading(false); e.target.value = null; }
    };
    reader.readAsArrayBuffer(file);
  };

  const columns = [
    { key: "eleve_name", label: t('documents.fullName'), sortable: true, render: (r) => <span className="font-bold text-gray-900">{r.eleve_name}</span> },
    { key: "maths", label: t('documents.math'), sortable: true, render: (r) => <span className="text-gray-600 font-medium">{r.maths}</span> },
    { key: "physique", label: t('documents.physics'), sortable: true, render: (r) => <span className="text-gray-600 font-medium">{r.physique}</span> },
    { key: "svt", label: t('documents.svt'), sortable: true, render: (r) => <span className="text-gray-600 font-medium">{r.svt}</span> },
    { key: "arabe", label: t('documents.ar'), sortable: true, render: (r) => <span className="text-gray-600 font-medium">{r.arabe}</span> },
    { key: "moyenne_generale", label: t('documents.avg'), sortable: true, render: (r) => (
      <span className={`px-3 py-1.5 rounded-lg font-black text-sm ${
        parseFloat(r.moyenne_generale) >= 10 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}>{r.moyenne_generale}</span>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('documents.niveau')}</label>
            <select value={niveau} onChange={e => setNiveau(e.target.value)}
              className="border border-gray-200 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="1AC">{t('documents.year1')}</option>
              <option value="2AC">{t('documents.year2')}</option>
              <option value="3AC">{t('documents.year3')}</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">{t('documents.trimester')}</label>
            <select value={trimester} onChange={e => setTrimester(e.target.value)}
              className="border border-gray-200 p-2.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="1">{t('documents.trimester1')}</option>
              <option value="2">{t('documents.trimester2')}</option>
              <option value="3">{t('documents.trimester3')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          searchable
          searchKeys={["eleve_name"]}
          searchPlaceholder={t('documents.searchStudent')}
          pageSize={15}
          emptyTitle={t('documents.noResults')}
          emptyDescription={t('documents.noResultsDesc')}
        />
      </div>
    </div>
  );
}

function MentionBar({ label, count, total, color, value }) {
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
      await api.post("/certificats/generate", payload);

      setCertData({
        numero: `2025/2026/${Math.floor(Math.random() * 1000)}`,
        eleve: { ...student, classe: student.classe || student.niveau || "—" },
        dateEmission: new Date().toLocaleDateString("fr-FR"),
      });

      setTimeout(() => {
        window.print();
        setCertData(null);
      }, 500);

      pushToast("success", t('documents.generatedSuccess') + " " + student.prenom + " " + student.nom);
    } catch {
      pushToast("error", t('documents.generatedError'));
    } finally { setIsGenerating(false); }
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
        <div className="hidden print:block fixed inset-0 z-[9999] bg-white text-black p-8 font-serif" dir="rtl">

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
            <div className="w-24 h-32 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 text-xs">
              صورة (Photo)
            </div>
            <div className="text-left leading-loose">
              <p>الجماعة : المنارة (المقاطعة)</p>
              <p>المؤسسة : الثانوية الإعدادية برج الزيتون</p>
              <p>الهاتف : 0524000000</p>
            </div>
          </div>

          <div className="flex items-center justify-center mb-10">
            <div className="border-2 border-black px-10 py-3 text-2xl font-black flex items-center gap-4 bg-gray-100">
              <span>شهادة مدرسية رقم : {certData.numero}</span>
              <span className="text-xs border border-black p-1 bg-white mr-4">مسار MASSAR</span>
            </div>
          </div>

          <div className="text-xl leading-loose font-medium mb-12 max-w-4xl mx-auto">
            <p className="mb-6 font-bold">يشهد الموقع (ة) أسفله</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <p>أن التلميذ (ة) الاسم و النسب : <span className="font-bold border-b border-dashed border-gray-400 inline-block px-4">{certData.eleve.nom} {certData.eleve.prenom}</span></p>
              <p dir="ltr" className="text-left"><span className="font-bold border-b border-dashed border-gray-400 inline-block px-4">{certData.eleve.nom.toUpperCase()} {certData.eleve.prenom.toUpperCase()}</span> : Nom et Prénom</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <p>المولود (ة) في : <span className="font-bold border-b border-dashed border-gray-400 inline-block px-4">{certData.eleve.date_naissance ? new Date(certData.eleve.date_naissance).toLocaleDateString("fr-FR") : "................................"}</span></p>
              <p>بـ : <span className="font-bold border-b border-dashed border-gray-400 inline-block px-4">مراكش</span></p>
            </div>

            <p className="mb-6">رقم التلميذ (ة) (مسار) : <span className="font-bold border-b border-dashed border-gray-400 inline-block px-4 tracking-widest">{certData.eleve.id_massar}</span></p>
            <p className="mb-6">كان / يتابع دراسته(ها) بهذه المؤسسة</p>
            <p className="mb-8">و لم يغادر المؤسسة و يتابع دراسته بالمستوى : <span className="font-bold border-b border-dashed border-gray-400 inline-block px-4"> (2025/2026) - {certData.eleve.classe}</span></p>
            <p className="text-lg">ملاحظات : <span className="italic">سلمت له (ها) هذه الشهادة من برنامج "مسار" لغرض إداري.</span></p>
          </div>

          <div className="flex justify-between items-end mt-16 px-10">
            <div className="text-center font-bold text-lg">
              <p className="mb-8">خاتم و توقيع رئيس المؤسسة</p>
              <div className="w-32 h-32 border border-gray-200 rounded-full mx-auto flex items-center justify-center opacity-50">
                ختم الإدارة
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold mb-4">حرر بـ : مراكش في : {certData.dateEmission}</p>
              <p className="font-bold text-lg mb-8">خاتم و توقيع الحارس العام</p>
              <div className="w-32 h-32 border border-gray-200 rounded-full mx-auto flex items-center justify-center opacity-50">
                ختم الحارس العام
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
