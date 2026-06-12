-- Migration: trimestre → semestre, ajout classe + eleve_id
ALTER TABLE resultats ADD COLUMN IF NOT EXISTS semestre INTEGER DEFAULT 1;
ALTER TABLE resultats ADD COLUMN IF NOT EXISTS classe VARCHAR(50);
ALTER TABLE resultats ADD COLUMN IF NOT EXISTS eleve_id INTEGER REFERENCES eleves(id) ON DELETE SET NULL;

-- Convertir trimestre en semestre (1→1, 2→2, 3→2)
UPDATE resultats SET semestre = CASE WHEN trimestre = 1 THEN 1 ELSE 2 END WHERE semestre IS NULL;

-- Lier aux élèves existants
UPDATE resultats r SET eleve_id = e.id, classe = e.classe
FROM eleves e WHERE e.id_massar = r.massar_id AND r.eleve_id IS NULL;

-- Supprimer l'ancienne colonne
ALTER TABLE resultats DROP COLUMN IF EXISTS trimestre;
