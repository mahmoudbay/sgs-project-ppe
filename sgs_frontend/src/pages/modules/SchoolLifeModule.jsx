import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Plus, List, Users } from "lucide-react";

export default function SchoolLifeModule({ user, api, hasPermission }) {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/eleves");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vie Scolaire</h1>
        <p className="text-gray-600 mt-2">
          Gestion des dossiers élèves, absences et documents
        </p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <Link
          to="students"
          className={`px-4 py-3 font-medium border-b-2 transition ${
            isActive("students")
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          <Users className="inline mr-2" size={18} />
          Élèves
        </Link>
        <Link
          to="absences"
          className={`px-4 py-3 font-medium border-b-2 transition ${
            isActive("absences")
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          <List className="inline mr-2" size={18} />
          Absences
        </Link>
      </div>

      <Routes>
        <Route
          path="students"
          element={
            <StudentsList
              students={students}
              loading={loading}
              api={api}
              onRefresh={fetchStudents}
            />
          }
        />
        <Route
          path="absences"
          element={
            <AbsenceManagement
              students={students}
              api={api}
              onRefresh={fetchStudents}
            />
          }
        />
      </Routes>
    </div>
  );
}

function StudentsList({ students, loading, api, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = students.filter(
    (s) =>
      s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id_massar.includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou numéro MASSAR..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedStudent(student)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {student.prenom} {student.nom}
                </h3>
                <p className="text-sm text-gray-600 mt-1">ID: {student.id_massar}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {student.prenom.charAt(0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbsenceManagement({ students, api, onRefresh }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [absences, setAbsences] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const absentStudents = Object.keys(absences).filter((id) => absences[id]).map(Number);
      await api.post("/absences", {
        date: selectedDate,
        classe: selectedClass,
        eleves_absents: absentStudents,
      });
      onRefresh();
      setAbsences({});
      alert("Absences enregistrées avec succès");
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner une classe</label>
        <select 
          className="w-full border p-2 rounded"
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Choisir...</option>
          {[...new Set(students.map(s => s.classe))].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Enregistrement..." : "Enregistrer les Absences"}
        </button>
      </div>
    </div>
  );
}
