import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, School } from "lucide-react";

const DEMO_ACCOUNTS = (t) => [
  { email: "admin@college.ma", password: "password123", label: t('login.admin') },
  { email: "direction@college.ma", password: "password123", label: t('login.direction') },
  { email: "h.benali@college.ma", password: "password123", label: t('login.employee') },
  { email: "surveillant@college.ma", password: "password123", label: t('login.supervisor') },
  { email: "ezzahraelzangati@gmail.com", password: "987654321", label: t('login.finance') },
];

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await onLogin(email, password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || t('login.invalidCredentials'));
      }
    } catch {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 relative">
              <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('app.short')}</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white text-center">{t('app.title')}</h1>
              <p className="text-blue-100 text-center mt-1.5 text-sm">{t('app.subtitle')}</p>
            </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-up">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">{t('login.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required disabled={loading} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('login.password')}</label>
                <button type="button" className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  {t('login.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder={t('login.passwordPlaceholder')}
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2">
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> {t('login.loggingIn')}</>
              ) : t('login.login')}
            </button>

            <div className="pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setShowDemo(!showDemo)}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                <School size={14} />
                {showDemo ? t('login.hideDemo') : t('login.showDemo')}
              </button>
              {showDemo && (
                <div className="mt-3 space-y-1.5 animate-slide-up">
                  {DEMO_ACCOUNTS(t).map((acc) => (
                    <button key={acc.email} type="button" onClick={() => fillDemo(acc)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-gray-50 transition-colors group">
                      <span className="font-medium text-gray-600 group-hover:text-gray-900">{acc.label}</span>
                      <span className="text-gray-400 group-hover:text-gray-600">{acc.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
        <p className="text-center text-white/60 text-xs mt-6">© 2026 SGS — {t('app.subtitle')}</p>
      </div>
    </div>
  );
}
