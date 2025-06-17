#!/bin/bash

# Security Scanning Script for Modern LMS
# This script runs various security scans on the application

set -e

echo "🔒 Starting Security Scan for Modern LMS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create reports directory
mkdir -p security-reports

# 1. Dependency Vulnerability Scan
print_status "Running dependency vulnerability scan..."

# Backend dependencies (Maven)
if [ -f "backend/pom.xml" ]; then
    print_status "Scanning Java dependencies..."
    cd backend
    mvn org.owasp:dependency-check-maven:check \
        -DfailBuildOnCVSS=7 \
        -DsuppressionsLocation=../security/dependency-suppressions.xml \
        -Dformat=ALL \
        -DoutputDirectory=../security-reports/backend-dependencies
    cd ..
fi

# Frontend dependencies (npm)
if [ -f "package.json" ]; then
    print_status "Scanning Node.js dependencies..."
    npm audit --audit-level=moderate --json > security-reports/frontend-audit.json || true
    
    # Generate human-readable report
    npm audit --audit-level=moderate > security-reports/frontend-audit.txt || true
fi

# 2. Static Code Analysis
print_status "Running static code analysis..."

# Java code analysis with SpotBugs
if [ -f "backend/pom.xml" ]; then
    print_status "Running SpotBugs analysis..."
    cd backend
    mvn compile spotbugs:spotbugs \
        -Dspotbugs.xmlOutput=true \
        -Dspotbugs.xmlOutputDirectory=../security-reports/spotbugs
    cd ..
fi

# JavaScript/TypeScript analysis with ESLint security plugin
if [ -f "package.json" ]; then
    print_status "Running ESLint security analysis..."
    npx eslint . --ext .js,.jsx,.ts,.tsx \
        --config .eslintrc-security.js \
        --format json \
        --output-file security-reports/eslint-security.json || true
fi

# 3. Secrets Detection
print_status "Scanning for secrets and sensitive data..."

# Use git-secrets if available
if command -v git-secrets &> /dev/null; then
    git secrets --scan --recursive . > security-reports/secrets-scan.txt || true
else
    print_warning "git-secrets not found. Install it for better secrets detection."
fi

# Use truffleHog if available
if command -v trufflehog &> /dev/null; then
    trufflehog --json . > security-reports/trufflehog.json || true
else
    print_warning "trufflehog not found. Consider installing for entropy-based secrets detection."
fi

# 4. Docker Image Security Scan
print_status "Scanning Docker images for vulnerabilities..."

# Scan backend image
if [ -f "backend/Dockerfile" ]; then
    print_status "Building and scanning backend Docker image..."
    docker build -t lms-backend-security-scan backend/
    
    # Use Trivy for container scanning
    if command -v trivy &> /dev/null; then
        trivy image --format json --output security-reports/backend-image-scan.json lms-backend-security-scan
        trivy image --format table --output security-reports/backend-image-scan.txt lms-backend-security-scan
    else
        print_warning "Trivy not found. Install it for container vulnerability scanning."
    fi
fi

# Scan frontend image
if [ -f "Dockerfile.frontend" ]; then
    print_status "Building and scanning frontend Docker image..."
    docker build -t lms-frontend-security-scan -f Dockerfile.frontend .
    
    if command -v trivy &> /dev/null; then
        trivy image --format json --output security-reports/frontend-image-scan.json lms-frontend-security-scan
        trivy image --format table --output security-reports/frontend-image-scan.txt lms-frontend-security-scan
    fi
fi

# 5. Configuration Security Check
print_status "Checking configuration security..."

# Check for insecure configurations
python3 security/config-security-check.py > security-reports/config-security.txt || print_warning "Config security check failed"

# 6. SSL/TLS Configuration Check
print_status "Checking SSL/TLS configuration..."

# Check SSL configuration if certificates exist
if [ -f "ssl/certificate.crt" ]; then
    openssl x509 -in ssl/certificate.crt -text -noout > security-reports/ssl-cert-info.txt
    
    # Check certificate expiry
    expiry_date=$(openssl x509 -in ssl/certificate.crt -noout -enddate | cut -d= -f2)
    expiry_timestamp=$(date -d "$expiry_date" +%s)
    current_timestamp=$(date +%s)
    days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    if [ $days_until_expiry -lt 30 ]; then
        print_warning "SSL certificate expires in $days_until_expiry days!"
    fi
fi

# 7. Generate Security Report Summary
print_status "Generating security report summary..."

cat > security-reports/security-summary.md << EOF
# Security Scan Report

**Scan Date:** $(date)
**Project:** Modern LMS Platform

## Summary

This report contains the results of automated security scans performed on the Modern LMS platform.

## Scans Performed

- ✅ Dependency Vulnerability Scan
- ✅ Static Code Analysis
- ✅ Secrets Detection
- ✅ Docker Image Security Scan
- ✅ Configuration Security Check
- ✅ SSL/TLS Configuration Check

## Report Files

- \`backend-dependencies/\` - Backend dependency vulnerabilities
- \`frontend-audit.json\` - Frontend dependency audit
- \`spotbugs/\` - Java static analysis results
- \`eslint-security.json\` - JavaScript/TypeScript security issues
- \`secrets-scan.txt\` - Secrets detection results
- \`*-image-scan.json\` - Docker image vulnerability scans
- \`config-security.txt\` - Configuration security issues
- \`ssl-cert-info.txt\` - SSL certificate information

## Recommendations

1. Review all HIGH and CRITICAL severity vulnerabilities
2. Update dependencies with known vulnerabilities
3. Fix any secrets or sensitive data found in code
4. Address configuration security issues
5. Monitor SSL certificate expiry dates

## Next Steps

1. Prioritize fixes based on severity and exploitability
2. Implement automated security scanning in CI/CD pipeline
3. Set up monitoring for new vulnerabilities
4. Regular security reviews and penetration testing

EOF

print_status "Security scan completed! Reports available in security-reports/ directory"
print_status "Review the security-summary.md file for an overview of findings"

# Check if any critical issues were found
critical_issues=0

# Count critical vulnerabilities from various sources
if [ -f "security-reports/backend-dependencies/dependency-check-report.json" ]; then
    critical_backend=$(jq '.dependencies[].vulnerabilities[]? | select(.severity == "CRITICAL")' security-reports/backend-dependencies/dependency-check-report.json 2>/dev/null | wc -l || echo 0)
    critical_issues=$((critical_issues + critical_backend))
fi

if [ -f "security-reports/frontend-audit.json" ]; then
    critical_frontend=$(jq '.vulnerabilities | to_entries[] | select(.value.severity == "critical")' security-reports/frontend-audit.json 2>/dev/null | wc -l || echo 0)
    critical_issues=$((critical_issues + critical_frontend))
fi

if [ $critical_issues -gt 0 ]; then
    print_error "Found $critical_issues critical security issues! Please review and fix immediately."
    exit 1
else
    print_status "No critical security issues found."
fi
