#!/bin/bash

# Kas Kelas Development Environment Startup Script

echo "🚀 Starting Kas Kelas Development Environment..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file from .env.local..."
    cp .env.local .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Start PostgreSQL and PgAdmin
echo ""
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is running
docker exec kas_kelas_postgres pg_isready -U postgres > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL is ready!"
else
    echo "❌ PostgreSQL is not ready. Check logs with: npm run db:logs"
    exit 1
fi

# Display connection information
echo ""
echo "📊 Database Connection Information:"
echo "=================================="
echo "Host: localhost"
echo "Port: 5432"
echo "Database: kas_kelas_db"
echo "Username: postgres"
echo "Password: postgres123"
echo ""
echo "🌐 PgAdmin Web Interface:"
echo "========================"
echo "URL: http://localhost:5050"
echo "Email: admin@kaskelas.com"
echo "Password: admin123"
echo ""

# Start the Next.js application
echo "🚀 Starting Next.js application..."
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

npm run dev