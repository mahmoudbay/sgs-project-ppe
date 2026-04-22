-- 1. Users & Staff Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('direction', 'employe', 'financier', 'surveillant', 'admin')),
    email VARCHAR(150) UNIQUE NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    initiales VARCHAR(5),
    poste VARCHAR(100),
    matricule VARCHAR(50),
    solde_conge INTEGER DEFAULT 12
);

-- 2. Students Table (Eleves)
CREATE TABLE eleves (
    id SERIAL PRIMARY KEY,
    id_massar VARCHAR(20) UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    classe VARCHAR(50),
    niveau VARCHAR(50),
    date_naissance DATE,
    absences INTEGER DEFAULT 0,
    absences_justifiees INTEGER DEFAULT 0
);

-- 3. Human Resources Requests (Demandes RH)
CREATE TABLE demandes_rh (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER REFERENCES users(id),
    type VARCHAR(50),
    statut VARCHAR(20) DEFAULT 'en_attente',
    date_creation DATE DEFAULT CURRENT_DATE,
    date_debut DATE,
    date_fin DATE,
    motif TEXT,
    piece_jointe VARCHAR(255),
    commentaire TEXT
);

-- 4. Financial Operations
CREATE TABLE operations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) CHECK (type IN ('revenu', 'depense')),
    categorie VARCHAR(50),
    description TEXT,
    montant DECIMAL(12, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    statut VARCHAR(20) DEFAULT 'en_attente',
    saisie_par INTEGER REFERENCES users(id)
);

-- 5. Academic Results (Resultats)
CREATE TABLE resultats (
    id SERIAL PRIMARY KEY,
    eleve_id INTEGER REFERENCES eleves(id),
    trimestre INTEGER CHECK (trimestre IN (1, 2, 3)),
    maths DECIMAL(4, 2),
    francais DECIMAL(4, 2),
    sciences DECIMAL(4, 2),
    histoire DECIMAL(4, 2),
    arabe DECIMAL(4, 2),
    sport DECIMAL(4, 2),
    moyenne_generale DECIMAL(4, 2)
);
