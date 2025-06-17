#!/usr/bin/env python3
"""
Configuration Security Checker for Modern LMS
Checks for common security misconfigurations
"""

import os
import yaml
import json
import re
from pathlib import Path

class SecurityChecker:
    def __init__(self):
        self.issues = []
        self.warnings = []
        
    def add_issue(self, severity, file_path, issue, recommendation):
        self.issues.append({
            'severity': severity,
            'file': file_path,
            'issue': issue,
            'recommendation': recommendation
        })
    
    def add_warning(self, file_path, warning):
        self.warnings.append({
            'file': file_path,
            'warning': warning
        })
    
    def check_yaml_config(self, file_path):
        """Check YAML configuration files for security issues"""
        try:
            with open(file_path, 'r') as f:
                config = yaml.safe_load(f)
            
            # Check for hardcoded passwords
            self._check_hardcoded_secrets(file_path, str(config))
            
            # Check Spring Boot specific configurations
            if 'spring' in config:
                self._check_spring_config(file_path, config['spring'])
            
            # Check management endpoints
            if 'management' in config:
                self._check_actuator_config(file_path, config['management'])
                
        except Exception as e:
            self.add_warning(file_path, f"Could not parse YAML: {e}")
    
    def check_properties_config(self, file_path):
        """Check properties files for security issues"""
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            self._check_hardcoded_secrets(file_path, content)
            
            # Check for insecure configurations
            if 'spring.datasource.password=' in content:
                if not content.count('${') > content.count('spring.datasource.password='):
                    self.add_issue('HIGH', file_path, 
                                 'Hardcoded database password',
                                 'Use environment variables or encrypted properties')
            
        except Exception as e:
            self.add_warning(file_path, f"Could not read properties file: {e}")
    
    def check_docker_config(self, file_path):
        """Check Docker configurations for security issues"""
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Check for running as root
            if 'USER root' in content or not 'USER ' in content:
                self.add_issue('MEDIUM', file_path,
                             'Container may run as root user',
                             'Add USER directive to run as non-root user')
            
            # Check for hardcoded secrets
            self._check_hardcoded_secrets(file_path, content)
            
            # Check for COPY . . (copying everything)
            if re.search(r'COPY\s+\.\s+\.', content):
                self.add_warning(file_path, 
                               'Copying entire context - consider using .dockerignore')
            
        except Exception as e:
            self.add_warning(file_path, f"Could not read Dockerfile: {e}")
    
    def check_kubernetes_config(self, file_path):
        """Check Kubernetes configurations for security issues"""
        try:
            with open(file_path, 'r') as f:
                content = f.read()
                
            # Parse YAML documents
            docs = yaml.safe_load_all(content)
            
            for doc in docs:
                if not doc:
                    continue
                    
                kind = doc.get('kind', '')
                
                if kind == 'Deployment':
                    self._check_k8s_deployment(file_path, doc)
                elif kind == 'Service':
                    self._check_k8s_service(file_path, doc)
                elif kind == 'Secret':
                    self._check_k8s_secret(file_path, doc)
                    
        except Exception as e:
            self.add_warning(file_path, f"Could not parse Kubernetes config: {e}")
    
    def _check_hardcoded_secrets(self, file_path, content):
        """Check for hardcoded secrets and passwords"""
        secret_patterns = [
            (r'password\s*[:=]\s*["\']?[^"\'\s]{8,}["\']?', 'Potential hardcoded password'),
            (r'secret\s*[:=]\s*["\']?[^"\'\s]{16,}["\']?', 'Potential hardcoded secret'),
            (r'api[_-]?key\s*[:=]\s*["\']?[^"\'\s]{16,}["\']?', 'Potential hardcoded API key'),
            (r'token\s*[:=]\s*["\']?[^"\'\s]{20,}["\']?', 'Potential hardcoded token'),
            (r'["\'][A-Za-z0-9+/]{40,}={0,2}["\']', 'Potential base64 encoded secret'),
        ]
        
        for pattern, description in secret_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                # Skip if it's clearly a placeholder or environment variable
                if not re.search(r'\$\{|\{\{|your-|example|placeholder|changeme', content, re.IGNORECASE):
                    self.add_issue('HIGH', file_path, description,
                                 'Use environment variables or secure secret management')
    
    def _check_spring_config(self, file_path, spring_config):
        """Check Spring Boot specific configurations"""
        # Check datasource configuration
        if 'datasource' in spring_config:
            ds = spring_config['datasource']
            if 'password' in ds and not str(ds['password']).startswith('${'):
                self.add_issue('HIGH', file_path,
                             'Hardcoded database password in Spring config',
                             'Use ${DB_PASSWORD} environment variable')
        
        # Check security configuration
        if 'security' in spring_config:
            security = spring_config['security']
            if 'require-ssl' in security and not security['require-ssl']:
                self.add_issue('MEDIUM', file_path,
                             'SSL not required',
                             'Enable SSL in production environments')
    
    def _check_actuator_config(self, file_path, management_config):
        """Check Spring Boot Actuator configuration"""
        if 'endpoints' in management_config:
            endpoints = management_config['endpoints']
            if 'web' in endpoints and 'exposure' in endpoints['web']:
                exposure = endpoints['web']['exposure']
                if 'include' in exposure:
                    exposed = exposure['include']
                    if '*' in str(exposed) or 'env' in str(exposed):
                        self.add_issue('HIGH', file_path,
                                     'Sensitive actuator endpoints exposed',
                                     'Limit exposed endpoints and secure with authentication')
    
    def _check_k8s_deployment(self, file_path, deployment):
        """Check Kubernetes Deployment for security issues"""
        spec = deployment.get('spec', {})
        template = spec.get('template', {})
        pod_spec = template.get('spec', {})
        
        # Check security context
        if 'securityContext' not in pod_spec:
            self.add_issue('MEDIUM', file_path,
                         'No pod security context defined',
                         'Add securityContext to run as non-root user')
        
        # Check containers
        containers = pod_spec.get('containers', [])
        for container in containers:
            # Check for privileged containers
            security_context = container.get('securityContext', {})
            if security_context.get('privileged', False):
                self.add_issue('HIGH', file_path,
                             'Privileged container detected',
                             'Remove privileged: true unless absolutely necessary')
            
            # Check resource limits
            if 'resources' not in container:
                self.add_warning(file_path,
                               'No resource limits defined for container')
    
    def _check_k8s_service(self, file_path, service):
        """Check Kubernetes Service for security issues"""
        spec = service.get('spec', {})
        
        # Check for NodePort services
        if spec.get('type') == 'NodePort':
            self.add_warning(file_path,
                           'NodePort service exposes ports on all nodes')
        
        # Check for LoadBalancer without proper annotations
        if spec.get('type') == 'LoadBalancer':
            metadata = service.get('metadata', {})
            annotations = metadata.get('annotations', {})
            if not any('ssl' in key.lower() for key in annotations.keys()):
                self.add_warning(file_path,
                               'LoadBalancer service without SSL annotations')
    
    def _check_k8s_secret(self, file_path, secret):
        """Check Kubernetes Secret for security issues"""
        data = secret.get('data', {})
        
        # Check for base64 encoded secrets that might be hardcoded
        for key, value in data.items():
            if isinstance(value, str) and len(value) > 0:
                # This is a basic check - in practice, you'd want more sophisticated detection
                if not re.match(r'^[A-Za-z0-9+/]*={0,2}$', value):
                    self.add_warning(file_path,
                                   f'Secret {key} may not be properly base64 encoded')
    
    def run_checks(self):
        """Run all security checks"""
        print("🔍 Running configuration security checks...")
        
        # Check application configuration files
        config_files = [
            'backend/src/main/resources/application.yml',
            'backend/src/main/resources/application.properties',
            'backend/src/main/resources/application-prod.yml',
            'backend/src/test/resources/application-test.yml',
        ]
        
        for config_file in config_files:
            if os.path.exists(config_file):
                if config_file.endswith('.yml') or config_file.endswith('.yaml'):
                    self.check_yaml_config(config_file)
                elif config_file.endswith('.properties'):
                    self.check_properties_config(config_file)
        
        # Check Docker files
        docker_files = [
            'backend/Dockerfile',
            'Dockerfile.frontend',
            'docker-compose.yml',
            'docker-compose.prod.yml',
        ]
        
        for docker_file in docker_files:
            if os.path.exists(docker_file):
                self.check_docker_config(docker_file)
        
        # Check Kubernetes configurations
        k8s_dir = Path('k8s')
        if k8s_dir.exists():
            for k8s_file in k8s_dir.glob('*.yaml'):
                self.check_kubernetes_config(str(k8s_file))
        
        # Print results
        self.print_results()
    
    def print_results(self):
        """Print security check results"""
        print("\n" + "="*60)
        print("CONFIGURATION SECURITY REPORT")
        print("="*60)
        
        if self.issues:
            print(f"\n🚨 SECURITY ISSUES FOUND ({len(self.issues)}):")
            print("-" * 40)
            
            for issue in sorted(self.issues, key=lambda x: x['severity']):
                severity_icon = "🔴" if issue['severity'] == 'HIGH' else "🟡"
                print(f"{severity_icon} {issue['severity']}: {issue['file']}")
                print(f"   Issue: {issue['issue']}")
                print(f"   Fix: {issue['recommendation']}")
                print()
        else:
            print("\n✅ No security issues found!")
        
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            print("-" * 40)
            
            for warning in self.warnings:
                print(f"⚠️  {warning['file']}: {warning['warning']}")
        
        print("\n" + "="*60)
        print("RECOMMENDATIONS:")
        print("="*60)
        print("1. Use environment variables for all sensitive configuration")
        print("2. Enable SSL/TLS in production environments")
        print("3. Implement proper authentication for management endpoints")
        print("4. Use non-root users in containers")
        print("5. Set resource limits for Kubernetes deployments")
        print("6. Regular security audits and dependency updates")

if __name__ == "__main__":
    checker = SecurityChecker()
    checker.run_checks()
