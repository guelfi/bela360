-- Renomeia os valores do enum UserRole para PT-BR.
-- RENAME VALUE e um relabel de metadado (pg_enum) - nao reescreve linhas,
-- preserva todos os dados existentes sem perda.
ALTER TYPE "UserRole" RENAME VALUE 'OWNER' TO 'PROPRIETARIO';
ALTER TYPE "UserRole" RENAME VALUE 'ADMIN' TO 'ADMINISTRADOR';
ALTER TYPE "UserRole" RENAME VALUE 'PROFESSIONAL' TO 'PROFISSIONAL';
ALTER TYPE "UserRole" RENAME VALUE 'RECEPTIONIST' TO 'RECEPCIONISTA';