# PostgreSQL Local Development Setup

## Overview
This guide provides instructions for setting up PostgreSQL locally for the Kas Kelas application development.

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ installed
- npm or yarn package manager

## Quick Start

### 1. Start PostgreSQL with Docker Compose
```bash
# Start PostgreSQL and PgAdmin
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 2. Database Access
- **PostgreSQL Connection**:
  - Host: `localhost`
  - Port: `5432`
  - Database: `kas_kelas_db`
  - Username: `postgres`
  - Password: `postgres123`

- **PgAdmin Web Interface**:
  - URL: http://localhost:5050
  - Email: `admin@kaskelas.com`
  - Password: `admin123`

### 3. Environment Variables
Copy the `.env.local` file to `.env`:
```bash
cp .env.local .env
```

## Database Structure

The database includes the following main tables:
- `app_users` - User authentication and profiles
- `students` - Student information
- `transactions` - Financial transactions
- `expenses` - Expense records
- `expense_categories` - Expense categorization
- `payment_reminders` - Payment reminder system
- `notifications` - Notification system
- `activity_logs` - Activity tracking

## Common Commands

### Docker Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset database (WARNING: This will delete all data)
docker-compose down -v
docker-compose up -d
```

### Database Commands
```bash
# Connect to PostgreSQL
docker exec -it kas_kelas_postgres psql -U postgres -d kas_kelas_db

# Backup database
docker exec kas_kelas_postgres pg_dump -U postgres kas_kelas_db > backup.sql

# Restore database
docker exec -i kas_kelas_postgres psql -U postgres kas_kelas_db < backup.sql
```

## Troubleshooting

### Port Already in Use
If port 5432 is already in use:
```bash
# Find process using port
sudo lsof -i :5432

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

### Connection Issues
1. Check if Docker containers are running:
   ```bash
   docker-compose ps
   ```

2. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

3. Test connection:
   ```bash
   docker exec -it kas_kelas_postgres pg_isready -U postgres
   ```

## Development Workflow

1. **Make Database Changes**: Edit SQL files in `init-db/` directory
2. **Apply Changes**: 
   ```bash
   # Recreate database with changes
   docker-compose down -v
   docker-compose up -d
   ```
3. **Test Changes**: Use PgAdmin or connect via application

## Security Notes
- The current setup uses simple passwords for local development only
- Never use these credentials in production
- Always use environment variables for sensitive data
- Enable SSL for production databases

## Next Steps
After setting up PostgreSQL:
1. Run the application: `npm run dev`
2. Access the app at http://localhost:3000
3. Login with default credentials from `app_users` table
4. Start fixing bugs one by one!