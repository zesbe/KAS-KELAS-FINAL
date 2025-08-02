-- =================================================================
-- KAS KELAS - COMPLETE DATABASE INITIALIZATION
-- =================================================================
-- This file combines all database setup scripts for local development

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Include the main database setup
\i /docker-entrypoint-initdb.d/02-database-setup.sql

-- Include users table setup
\i /docker-entrypoint-initdb.d/03-users-table.sql

-- Include expense categories
\i /docker-entrypoint-initdb.d/04-expense-categories.sql

-- Include sample data
\i /docker-entrypoint-initdb.d/05-sample-data.sql

-- Include update expenses data
\i /docker-entrypoint-initdb.d/06-update-expenses-data.sql

-- Cleanup old sessions
\i /docker-entrypoint-initdb.d/07-cleanup-sessions.sql

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;