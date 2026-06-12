-- Run this AFTER creating the enseignant user manually
-- or use the Node.js approach below
INSERT INTO users (nom, prenom, email, password, role, subject, initiales, actif)
VALUES ('Alaoui', 'Ahmed', 'teacher@ecole.ma',
        '$2a$10$dummyhash_changeme', 'enseignant', 'maths', 'AA', true);

INSERT INTO teacher_assignments (user_id, subject, niveau, classe)
SELECT id, 'maths', '1AC', 'A' FROM users WHERE email = 'teacher@ecole.ma'
UNION ALL
SELECT id, 'maths', '1AC', 'B' FROM users WHERE email = 'teacher@ecole.ma'
UNION ALL
SELECT id, 'maths', '2AC', 'A' FROM users WHERE email = 'teacher@ecole.ma';
