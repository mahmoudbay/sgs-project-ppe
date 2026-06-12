# Rapport Académique

## Système de Gestion Scolaire (SGS) — Collège Borj Azaitoune, Marrakech

---

**Auteur :** [À compléter]  
**Date :** Juin 2026  
**Établissement :** [À compléter — Université / École]  
**Filière :** [À compléter — Génie Logiciel / Systèmes d'Information]  
**Encadrant :** [À compléter]

---

## Résumé

Le présent rapport décrit la conception, le développement et le déploiement de **SGS (Système de Gestion Scolaire)**, une application web full-stack destinée au Collège Borj Azaitoune de Marrakech. Ce système a pour objectif de numériser et centraliser l'ensemble des processus administratifs, financiers et pédagogiques de l'établissement. Construit avec une architecture moderne (React 19, Node.js/Express, PostgreSQL), SGS intègre cinq modules fonctionnels — Ressources Humaines, Gestion Financière, Vie Scolaire, Documents Scolaires et Administration — accessibles via un contrôle d'accès basé sur les rôles (RBAC). L'application permet notamment l'import de notes depuis Excel, la génération de certificats bilingues français-arabe, la gestion des absences avec notification par email, et le suivi budgétaire en temps réel.

**Mots-clés :** Système de Gestion Scolaire, Application Web, React, Node.js, PostgreSQL, RBAC, Automatisation Administrative.

---

## Abstract

This report describes the design, development, and deployment of **SGS (Système de Gestion Scolaire)**, a full-stack web application built for Collège Borj Azaitoune in Marrakech, Morocco. The system aims to digitize and centralize all administrative, financial, and academic processes of the institution. Built with a modern architecture (React 19, Node.js/Express, PostgreSQL), SGS integrates five functional modules — Human Resources, Financial Management, School Life, Academic Documents, and Administration — accessible through role-based access control (RBAC). The application enables Excel-based grade import, bilingual French-Arabic certificate generation, absence tracking with email notifications, and real-time budget monitoring.

**Keywords:** School Management System, Web Application, React, Node.js, PostgreSQL, RBAC, Administrative Automation.

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Contexte et problématique](#2-contexte-et-problématique)
3. [Objectifs](#3-objectifs)
4. [État de l'art](#4-état-de-lart)
5. [Méthodologie](#5-méthodologie)
6. [Analyse et conception](#6-analyse-et-conception)
7. [Architecture technique](#7-architecture-technique)
8. [Implémentation](#8-implémentation)
9. [Tests et validation](#9-tests-et-validation)
10. [Résultats et discussion](#10-résultats-et-discussion)
11. [Conclusion et perspectives](#11-conclusion-et-perspectives)
12. [Références](#12-références)

---

## 1. Introduction

La transformation numérique des établissements d'enseignement est devenue une priorité dans le système éducatif marocain. Dans ce cadre, le Collège Borj Azaitoune à Marrakech a entrepris un projet de digitalisation de ses processus administratifs et pédagogiques. Ce projet, nommé **SGS (Système de Gestion Scolaire)**, vise à remplacer les méthodes de gestion papier et les outils disparates par une plateforme web centralisée, sécurisée et accessible à l'ensemble du personnel.

Ce rapport présente les différentes phases de réalisation de ce projet, depuis l'analyse des besoins jusqu'au déploiement, en passant par la conception architecturale et l'implémentation technique.

---

## 2. Contexte et problématique

### 2.1 Contexte institutionnel

Le Collège Borj Azaitoune est un établissement d'enseignement secondaire collégial situé à Marrakech. Comme de nombreux établissements publics marocains, sa gestion administrative repose encore largement sur des supports papier et des fichiers Excel non centralisés, ce qui engendre plusieurs difficultés.

### 2.2 Problématique

La problématique centrale de ce projet peut être formulée ainsi :

> **Comment concevoir et développer un système d'information intégré permettant de centraliser, automatiser et sécuriser l'ensemble des processus de gestion d'un établissement scolaire, tout en s'adaptant aux profils et responsabilités variés de ses utilisateurs ?**

### 2.3 Difficultés identifiées

L'analyse des besoins a révélé plusieurs difficultés opérationnelles :

1. **Gestion manuelle des ressources humaines** : Les demandes de congés et d'attestations de travail sont traitées sur papier, sans historique centralisé, ce qui entraîne des pertes de données et des délais de traitement longs.

2. **Suivi financier opaque** : Les opérations financières (inscriptions, dépenses de maintenance, salaires) sont enregistrées dans des fichiers Excel séparés, rendant difficile l'obtention d'un bilan financier global en temps réel.

3. **Gestion fragmentée des absences** : Le suivi des absences des élèves est effectué par le surveillant général sur des registres papier, sans possibilité de notification rapide aux parents.

4. **Production laborieuse des documents** : La génération des certificats de scolarité et des relevés de notes est faite manuellement, ce qui est source d'erreurs et chronophage.

5. **Absence de contrôle d'accès** : Les informations sensibles (données financières, dossiers des employés) sont accessibles sans granularité de permissions.

---

## 3. Objectifs

### 3.1 Objectif général

Développer et déployer un système de gestion scolaire web répondant aux besoins spécifiques du Collège Borj Azaitoune, garantissant la centralisation des données, l'automatisation des processus et la sécurisation des accès.

### 3.2 Objectifs spécifiques

1. **Concevoir une base de données relationnelle** couvrant l'ensemble des entités et leurs interactions (utilisateurs, élèves, opérations financières, demandes RH, résultats scolaires, certificats, notifications).

2. **Implémenter un contrôle d'accès basé sur les rôles (RBAC)** avec cinq profils distincts : administrateur, direction, service financier, surveillant général et employé.

3. **Développer des modules fonctionnels** couvrant la gestion des RH, des finances, de la vie scolaire et des documents académiques.

4. **Automatiser la génération de documents** : certificats de scolarité bilingues (français/arabe), attestations de travail, relevés de notes.

5. **Permettre l'import de données depuis Excel** pour les listes d'élèves et les résultats scolaires, avec un système de correspondance intelligente des colonnes.

6. **Assurer la notification des parents** par email en cas d'absences répétées des élèves.

7. **Fournir des tableaux de bord personnalisés** offrant des indicateurs clés adaptés à chaque rôle.

---

## 4. État de l'art

### 4.1 Solutions existantes

Plusieurs solutions de gestion scolaire existent sur le marché :

| Solution | Type | Avantages | Limites |
|---|---|---|---|
| **MASSAR** (Ministère Éducation Maroc) | Nationale | Obligatoire, uniforme | Limitée aux notes et examens, pas de gestion RH/finance |
| **Skhole** | SaaS | Moderne, cloud | Payant, nécessite connexion internet permanente |
| **OpenSIS** | Open Source | Personnalisable | Complexité technique, communauté anglophone |
| **GEST-ECOLE** | Desktop | Simple d'utilisation | Pas de web, mono-utilisateur |

### 4.2 Positionnement de SGS

SGS se distingue par :
- Une solution **sur mesure** adaptée aux besoins spécifiques du Collège Borj Azaitoune
- Une architecture **open source** et **auto-hébergée** (aucun abonnement)
- Une **interface bilingue** français-arabe avec support RTL
- Une **intégration administrative complète** (RH + Finance + Vie Scolaire + Documents) dans une seule plateforme
- Un **déploiement local** (serveur PostgreSQL + application Node.js) garantissant la maîtrise des données

---

## 5. Méthodologie

### 5.1 Approche de développement

Le projet a été développé selon une approche **itérative et incrémentale**, avec les phases suivantes :

1. **Analyse des besoins** (2 semaines) : entretiens avec le personnel, observation des processus existants, collecte des documents types
2. **Conception** (2 semaines) : modélisation de la base de données, architecture logicielle, maquettes d'interface
3. **Développement du backend** (3 semaines) : API REST, base de données, authentification
4. **Développement du frontend** (3 semaines) : composants React, pages, intégration API
5. **Tests et déploiement** (1 semaine) : tests fonctionnels, correction des anomalies, mise en production

### 5.2 Outils et technologies

#### Frontend
| Technologie | Version | Rôle |
|---|---|---|
| React | 19.2.5 | Bibliothèque UI |
| Vite | 8.0.9 | Build tool |
| Tailwind CSS | 4.2.4 | Framework CSS |
| React Router | 7.14.2 | Routage SPA |
| i18next | 26.3.1 | Internationalisation |
| Framer Motion | 12.40.0 | Animations |
| Lucide React | 1.8.0 | Icônes |
| xlsx | 0.18.5 | Parsing Excel |
| html2canvas / jspdf | — | Génération PDF |

#### Backend
| Technologie | Version | Rôle |
|---|---|---|
| Node.js | — | Runtime |
| Express | 5.2.1 | Framework HTTP |
| pg | 8.20.0 | Driver PostgreSQL |
| bcryptjs | 3.0.3 | Hachage mots de passe |
| jsonwebtoken | 9.0.3 | JWT |
| multer | 2.1.1 | Upload fichiers |
| nodemailer | 8.0.11 | Email SMTP |
| cors | 2.8.6 | Cross-origin |

#### Base de données
| Technologie | Rôle |
|---|---|
| PostgreSQL | SGBD relationnel |
| Ollama (phi3:mini) | Mapping IA des colonnes Excel |

---

## 6. Analyse et conception

### 6.1 Diagramme des cas d'utilisation

Le système SGS définit **5 acteurs** principaux, chacun avec des cas d'utilisation spécifiques :

- **Administrateur** : Gestion complète de tous les modules + administration des utilisateurs
- **Direction** : Validation RH, consultation finance, gestion vie scolaire, certificats
- **Service Financier** : Gestion complète des opérations financières, bilan
- **Surveillant Général** : Gestion des élèves et des absences
- **Employé** : Création et suivi de ses propres demandes RH

### 6.2 Modèle conceptuel des données (MCD)

Le système repose sur **9 tables** interconnectées :

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  users   │────→│ demandes_rh  │     │  operations  │
│ (staff)  │     │ (HR requests)│     │ (finance)    │
└──────────┘     └──────────────┘     └──────────────┘
      │                                      │
      │                                      │
      ▼                                      │
┌──────────┐     ┌──────────────┐            │
│notifica- │     │   eleves     │            │
│ tions    │←────│  (students)  │            │
└──────────┘     └──────┬───────┘            │
                        │                    │
              ┌─────────┼─────────┐          │
              ▼         ▼         ▼          │
        ┌─────────┐ ┌───────┐ ┌────────┐    │
        │absence_ │ │certi- │ │dos-   │    │
        │ records │ │ficats │ │siers  │    │
        └─────────┘ └───────┘ └────────┘    │
                                    │        │
                                    ▼        ▼
                              ┌──────────────┐
                              │  resultats   │
                              │ (grades)     │
                              └──────────────┘
```

### 6.3 Schéma relationnel

Le schéma relationnel complet comprend 9 tables avec les relations suivantes :

- **users** → **demandes_rh** : Un employé peut avoir plusieurs demandes RH (1..N)
- **users** → **notifications** : Un utilisateur reçoit plusieurs notifications (1..N)
- **users** → **operations** : Un utilisateur peut saisir plusieurs opérations (1..N)
- **eleves** → **absence_records** : Un élève a plusieurs enregistrements d'absence (1..N)
- **eleves** → **certificats** : Un élève peut avoir plusieurs certificats (1..N)
- **eleves** → **dossiers** : Un élève peut avoir plusieurs dossiers (1..N)

### 6.4 Architecture RBAC (Role-Based Access Control)

Le système définit une matrice de permissions fine pour chaque rôle :

| Permission | Admin | Direction | Financier | Surveillant | Employé |
|---|---|---|---|---|---|
| `hr:read_own` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `hr:read_all` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `hr:validate` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `hr:create_request` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `finance:read` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `finance:manage_expense` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `finance:manage_revenue` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `finance:generate_bilan` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `students:read` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `students:manage` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `certificates:generate` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `grades:manage` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `grades:read` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `users:manage` | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 7. Architecture technique

### 7.1 Architecture globale

```
┌─────────────────────────────────────────────────────────┐
│                    NAVIGATEUR WEB                        │
│              (Chrome / Firefox / Edge)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP (localhost:5173)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND — React + Vite                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │  Pages   │  │Components│  │   i18n (fr/ar)        │  │
│  │ (JSX)    │  │ (UI)     │  │   RTL support         │  │
│  └────┬─────┘  └──────────┘  └───────────────────────┘  │
│       │                                                 │
│  ┌────▼─────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │  Axios   │  │  Router  │  │   localStorage (auth)  │  │
│  └────┬─────┘  └──────────┘  └───────────────────────┘  │
└────────┼────────────────────────────────────────────────┘
         │ API REST (localhost:5000/api)
         ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND — Node.js / Express                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │  Routes  │  │Middleware│  │   Utils               │  │
│  │ (REST)   │  │ (auth)   │  │   (email, aiMapping)  │  │
│  └────┬─────┘  └──────────┘  └───────────────────────┘  │
│       │                                                 │
│  ┌────▼─────┐                                          │
│  │  pg Pool │                                          │
│  │ (db.js)  │                                          │
│  └────┬─────┘                                          │
└────────┼────────────────────────────────────────────────┘
         │ TCP (localhost:5432)
         ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DONNÉES — PostgreSQL                │
│              (sgs_db / sgs_admin)                        │
│  9 tables : users, eleves, demandes_rh, operations,     │
│  resultats, certificats, dossiers, notifications,       │
│  absence_records                                        │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Architecture du frontend

Le frontend adopte une architecture **composants + pages** avec un routage hiérarchique :

```
App.jsx (contexte auth, layout global, routes)
├── Login.jsx (page publique)
├── Dashboard.jsx (5 dashboards selon le rôle)
├── Profile.jsx
├── RHModule.jsx
│   ├── RHRequestsList.jsx
│   ├── NewRHRequest.jsx
│   └── RHValidation.jsx
├── FinanceModule.jsx
│   ├── OperationsList.jsx
│   ├── NewOperation.jsx
│   └── BilanReport.jsx
├── SchoolLifeModule.jsx
│   ├── StudentsList.jsx
│   ├── AbsencesManager.jsx
│   └── ImportStudents.jsx
├── DocumentsModule.jsx
│   ├── ResultsManagement.jsx
│   └── CertificatesManagement.jsx
└── UserManagement.jsx (admin only)
```

### 7.3 Architecture du backend

```
index.js (point d'entrée Express, montage des routes)
├── middlewares/auth.js (JWT verification + RBAC guard)
├── routes/auth.js (login, signup)
├── routes/dashboard.js (statistiques)
├── routes/rh.js (CRUD demandes RH)
├── routes/finance.js (CRUD opérations)
├── routes/school.js (CRUD élèves, absences, import)
├── routes/documents.js (résultats, certificats)
├── routes/users.js (gestion utilisateurs)
├── routes/notifications.js (notifications)
├── utils/email.js (service email SMTP)
└── utils/aiMapping.js (mapping IA colonnes Excel)
```

---

## 8. Implémentation

### 8.1 Authentification et sécurité

Le système d'authentification repose sur **JSON Web Tokens (JWT)** avec hachage des mots de passe via **bcryptjs**.

**Flux d'authentification :**
1. L'utilisateur soumet ses identifiants (email + mot de passe)
2. Le backend vérifie les credentials et génère un token JWT contenant l'ID, l'email et le rôle
3. Le frontend stocke le token dans `localStorage` et l'envoie dans l'en-tête `Authorization` pour chaque requête
4. Le middleware d'authentification vérifie le token sur les routes protégées

### 8.2 Module RH (Ressources Humaines)

Ce module gère le cycle de vie complet des demandes RH :

- **Création** : L'employé soumet une demande (attestation de travail, congé maladie, congé exceptionnel)
- **Validation** : L'administrateur ou la direction approuve ou rejette la demande
- **Notification** : Une notification système est automatiquement créée pour l'employé lors de la validation
- **Impression** : Les attestations de travail approuvées peuvent être imprimées avec un template officiel

**Workflow :**
```
Employé crée → Statut: "en_attente" → Admin/Direction valide
→ Approuvé → Notification employé → Impression possible
→ Rejeté → Notification employé + commentaire
```

### 8.3 Module Finance

Le module finance permet la gestion complète des opérations financières :

- **Revenus** : Inscription, Frais Scolaires, Subventions, Dons
- **Dépenses** : Maintenance, Matériel, Salaires, Électricité, Eau, Fournitures
- **Bilan financier** : Calcul automatique du solde (revenus - dépenses), détail par catégorie

### 8.4 Module Vie Scolaire

Ce module est le plus complexe du système, avec plusieurs sous-fonctionnalités :

- **Gestion des élèves** : CRUD complet avec recherche par nom, prénom ou code MASSAR
- **Gestion des absences** : Suivi quotidien avec distinction absence simple / justifiée
- **Import Excel** : Import des listes d'élèves avec mapping intelligent des colonnes (support IA via Ollama)
- **Upload de justificatifs** : Les parents peuvent fournir des justificatifs d'absence (fichiers PDF/images)
- **Notification email** : Alerte automatique aux parents via SMTP en cas d'absences répétées

### 8.5 Module Documents

- **Import des notes** : Parsing de fichiers Excel contenant les notes des élèves, calcul automatique de la moyenne générale
- **Certificats de scolarité** : Génération de certificats bilingues français-arabe avec support RTL, intégrant les informations de l'élève, le logo de l'établissement et les emplacements pour cachets

### 8.6 Internationalisation

L'application supporte deux langues via **i18next** :

- **Français** : Langue par défaut
- **Arabe** : Support RTL complet (direction du texte, alignement des menus)

Les traductions couvrent 642 clés par langue, incluant la navigation, les formulaires, les messages d'erreur et les notifications.

---

## 9. Tests et validation

### 9.1 Tests fonctionnels

Les tests ont été effectués manuellement par les utilisateurs cibles (personnel du collège) sur les scénarios suivants :

| Module | Scénario testé | Résultat |
|---|---|---|
| Authentification | Connexion des 5 rôles | ✅ Validé |
| RH | Création → Validation → Notification | ✅ Validé |
| Finance | CRUD opérations → Bilan | ✅ Validé |
| Vie Scolaire | Import Excel → Gestion absences | ✅ Validé |
| Documents | Import notes → Certificats | ✅ Validé |
| Internationalisation | Bascule FR/AR + RTL | ✅ Validé |

### 9.2 Comptes de démonstration

| Email | Mot de passe | Rôle |
|---|---|---|
| admin@sgs.ma | password | Administrateur |
| direction@sgs.ma | password | Direction |
| employe1@sgs.ma | password | Employé |
| employe2@sgs.ma | password | Employé |
| surveillant@sgs.ma | password | Surveillant |
| financier@sgs.ma | password | Service Financier |

---

## 10. Résultats et discussion

### 10.1 Résultats obtenus

Le système SGS a été déployé avec succès et répond aux objectifs fixés :

1. **Centralisation des données** : 9 tables interconnectées stockant l'ensemble des données de l'établissement
2. **Automatisation des processus** : Les demandes RH, le bilan financier, les certificats et les relevés de notes sont générés automatiquement
3. **Contrôle d'accès granulaire** : 5 rôles avec une matrice de 14 permissions distinctes
4. **Interface bilingue** : Support complet du français et de l'arabe avec bascule en temps réel
5. **Import de données** : Parsing de fichiers Excel avec mapping intelligent des colonnes
6. **Notification** : Alertes email aux parents et notifications système

### 10.2 Discussion et limites

Plusieurs points d'amélioration ont été identifiés :

1. **Sécurité** : Bien que bcrypt soit implémenté, l'application nécessite le déploiement d'un middleware d'authentification JWT sur l'ensemble des routes API pour une sécurité complète.

2. **Permissions côté serveur** : Le système RBAC est actuellement implémenté côté client ; une vérification côté serveur via middleware renforcerait la sécurité.

3. **Pagination** : Certaines listes (élèves, opérations) ne disposent pas encore de pagination, ce qui peut poser problème avec de grands volumes de données.

4. **Tests automatisés** : Aucun test unitaire ou d'intégration n'a été implémenté ; des tests automatisés permettraient une meilleure maintenance.

5. **Déploiement** : L'application est actuellement déployée en local ; une migration vers un environnement cloud avec conteneurisation (Docker) améliorerait la disponibilité.

### 10.3 Analyse comparative

Par rapport aux solutions existantes, SGS offre l'avantage d'être :
- **Gratuit** (open source, sans abonnement)
- **Complet** (couvre RH, Finance, Vie Scolaire, Documents)
- **Personnalisable** (code source disponible, adaptable à d'autres établissements)
- **Bilingue** (français-arabe avec support RTL)

---

## 11. Conclusion et perspectives

### 11.1 Conclusion

Le projet SGS a permis de concevoir et développer un système de gestion scolaire complet répondant aux besoins spécifiques du Collège Borj Azaitoune. L'application offre une solution intégrée couvrant les ressources humaines, la gestion financière, la vie scolaire et les documents académiques, le tout accessible via une interface web moderne, sécurisée et bilingue.

Les objectifs fixés ont été atteints : la plateforme est opérationnelle, utilisée par le personnel de l'établissement, et remplace efficacement les méthodes de gestion papier antérieures.

### 11.2 Perspectives d'évolution

Plusieurs axes d'amélioration sont envisagés pour les versions futures :

1. **Module emploi du temps** : Génération et visualisation des emplois du temps
2. **Espace parents** : Portail dédié permettant aux parents de consulter les notes, absences et payements
3. **Espace élèves** : Accès aux relevés de notes et certificats en ligne
4. **Conteneurisation Docker** : Pour faciliter le déploiement et la portabilité
5. **Tests automatisés** : Implémentation de tests unitaires (Jest) et d'intégration
6. **API documentation** : Génération automatique de la documentation API via Swagger
7. **Sauvegarde automatique** : Script de backup automatisé de la base de données
8. **Mode hors-ligne** : Fonctionnalités limitées sans connexion internet via PWA

### 11.3 Impact

Ce projet démontre la faisabilité et l'intérêt d'une solution de gestion scolaire open source, adaptée au contexte marocain, et pourrait servir de modèle pour d'autres établissements d'enseignement secondaire au Maroc et dans les pays francophones.

---

## 12. Références

1. React Documentation. (2026). *React 19 Documentation*. https://react.dev
2. Vite Documentation. (2026). *Vite Build Tool*. https://vitejs.dev
3. Tailwind CSS Documentation. (2026). *Tailwind CSS v4*. https://tailwindcss.com
4. Express Documentation. (2026). *Express.js*. https://expressjs.com
5. PostgreSQL Documentation. (2026). *PostgreSQL 16*. https://postgresql.org
6. i18next Documentation. (2026). *i18next Internationalization Framework*. https://www.i18next.com
7. jsonwebtoken Documentation. (2026). *JWT.IO*. https://jwt.io
8. Massar - Ministère de l'Éducation Nationale du Maroc. (2024). *Système MASSAR*. https://www.men.gov.ma
9. Sandi Metz. (2018). *Practical Object-Oriented Design in Ruby*. Addison-Wesley.
10. Martin Fowler. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.

---

*Document généré le 11/06/2026 — SGS v1.0 — Collège Borj Azaitoune, Marrakech*
