#!/bin/bash

# Quick fix script for LMS deployment issues
set -e

echo "🔧 Fixing LMS deployment issues..."

# Make scripts executable
echo "📝 Making scripts executable..."
chmod +x scripts/*.sh
chmod +x fix-deployment.sh

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs backups ssl monitoring scripts

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env.production ]; then
    echo "📄 Creating production environment file..."
    cp .env.production.example .env.production
    echo "⚠️  Please edit .env.production with your actual values"
fi

# Test Docker build locally
echo "🐳 Testing Docker builds..."

# Test frontend build
echo "Testing frontend Docker build..."
if docker build -f Dockerfile.frontend -t lms-frontend-test .; then
    echo "✅ Frontend Docker build successful"
    docker rmi lms-frontend-test
else
    echo "❌ Frontend Docker build failed"
    exit 1
fi

# Test backend build
echo "Testing backend Docker build..."
if docker build -f backend/Dockerfile -t lms-backend-test backend/; then
    echo "✅ Backend Docker build successful"
    docker rmi lms-backend-test
else
    echo "❌ Backend Docker build failed"
    exit 1
fi

# Check GitHub Actions workflow
echo "🔍 Checking GitHub Actions workflow..."
if [ -f .github/workflows/ci-cd.yml ]; then
    echo "✅ GitHub Actions workflow exists"
else
    echo "❌ GitHub Actions workflow missing"
    exit 1
fi

# Display next steps
echo ""
echo "🎉 Deployment fixes applied successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure GitHub Secrets (see docs/deployment/github-actions-setup.md)"
echo "2. Edit .env.production with your actual values"
echo "3. Push to GitHub to trigger deployment"
echo ""
echo "🔑 Required GitHub Secrets:"
echo "   - PRODUCTION_HOST"
echo "   - PRODUCTION_USER" 
echo "   - PRODUCTION_SSH_KEY"
echo "   - SLACK_WEBHOOK_URL"
echo "   - REACT_APP_API_URL"
echo "   - REACT_APP_SOCKET_URL"
echo ""
echo "📖 Full documentation: docs/deployment/github-actions-setup.md"
echo ""
echo "🚀 Ready for deployment!"
