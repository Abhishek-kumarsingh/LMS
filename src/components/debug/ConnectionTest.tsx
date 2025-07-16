import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Server,
  Wifi,
  User,
  BookOpen,
  Calendar,
  MessageSquare,
  BarChart3,
  Upload,
  Video,
  Bell,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
  icon: React.ComponentType<any>;
}

const ConnectionTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Health Check', status: 'pending', icon: Server },
    { name: 'Database Connection', status: 'pending', icon: Database },
    { name: 'Authentication API', status: 'pending', icon: User },
    { name: 'Courses API', status: 'pending', icon: BookOpen },
    { name: 'Calendar API', status: 'pending', icon: Calendar },
    { name: 'Discussions API', status: 'pending', icon: MessageSquare },
    { name: 'Analytics API', status: 'pending', icon: BarChart3 },
    { name: 'Upload API', status: 'pending', icon: Upload },
    { name: 'Streaming API', status: 'pending', icon: Video },
    { name: 'Notifications API', status: 'pending', icon: Bell },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const updateTestStatus = (index: number, status: 'success' | 'error', message?: string, duration?: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, duration } : test
    ));
  };

  const runTest = async (testName: string, testFn: () => Promise<any>): Promise<{ success: boolean; message?: string; duration: number }> => {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      return { success: true, duration };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return { 
        success: false, 
        message: error.response?.data?.error || error.message || 'Unknown error',
        duration 
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('pending');

    // Reset all tests to pending
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const })));

    const testFunctions = [
      // Backend Health Check
      () => apiService.healthCheck(),
      
      // Database Connection (implicit through any API call)
      () => apiService.get('/users/me').catch(() => Promise.resolve()),
      
      // Authentication API
      () => apiService.post('/auth/login', { email: 'test@example.com', password: 'invalid' }).catch(() => Promise.resolve()),
      
      // Courses API
      () => apiService.getCourses({ limit: 1 }),
      
      // Calendar API
      () => apiService.getEvents(),
      
      // Discussions API
      () => apiService.get('/discussions').catch(() => Promise.resolve()),
      
      // Analytics API
      () => apiService.getDashboardData(),
      
      // Upload API
      () => apiService.get('/upload/config').catch(() => Promise.resolve()),
      
      // Streaming API
      () => apiService.getStreams({ limit: 1 }),
      
      // Notifications API
      () => apiService.getNotifications(),
    ];

    let successCount = 0;

    for (let i = 0; i < testFunctions.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, testFunctions[i]);
      
      if (result.success) {
        successCount++;
        updateTestStatus(i, 'success', 'Connected successfully', result.duration);
      } else {
        updateTestStatus(i, 'error', result.message, result.duration);
      }

      // Small delay between tests for better UX
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setOverallStatus(successCount === testFunctions.length ? 'success' : 'error');
    setIsRunning(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getOverallStatusMessage = () => {
    const successCount = tests.filter(test => test.status === 'success').length;
    const totalCount = tests.length;
    
    if (overallStatus === 'success') {
      return `All systems operational (${successCount}/${totalCount})`;
    } else if (overallStatus === 'error') {
      return `${successCount}/${totalCount} systems operational`;
    } else {
      return 'Testing connections...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          System Connection Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing connectivity between frontend, backend, and database
        </p>
      </div>

      {/* Overall Status */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Wifi className={`w-6 h-6 ${getOverallStatusColor()}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connection Status
              </h2>
              <p className={`text-sm ${getOverallStatusColor()}`}>
                {getOverallStatusMessage()}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={runAllTests}
            disabled={isRunning}
            icon={<RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />}
          >
            {isRunning ? 'Testing...' : 'Retest'}
          </Button>
        </div>
      </Card>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test, index) => {
          const Icon = test.icon;
          
          return (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {test.name}
                      </h3>
                      {test.message && (
                        <p className={`text-sm mt-1 ${
                          test.status === 'error' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {test.message}
                        </p>
                      )}
                      {test.duration && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Response time: {test.duration}ms
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(test.status)}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Connection Details */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connection Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Frontend</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• React 18 with TypeScript</li>
              <li>• Axios for HTTP requests</li>
              <li>• JWT token authentication</li>
              <li>• Automatic token refresh</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Backend</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Express.js with TypeScript</li>
              <li>• PostgreSQL database</li>
              <li>• Prisma ORM</li>
              <li>• JWT authentication</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            API Endpoints
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Backend URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}
          </p>
        </div>
      </Card>

      {/* Troubleshooting */}
      {overallStatus === 'error' && (
        <Card className="mt-6 border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
            Troubleshooting
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                Common Issues:
              </h4>
              <ul className="space-y-1 text-red-700 dark:text-red-300">
                <li>• Backend server not running (npm run dev in backend folder)</li>
                <li>• Database not connected (check DATABASE_URL in .env)</li>
                <li>• CORS issues (check FRONTEND_URL in backend .env)</li>
                <li>• Network connectivity problems</li>
                <li>• Environment variables not configured</li>
              </ul>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Quick Fixes:
              </h4>
              <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>1. Ensure backend is running on port 5000</li>
                <li>2. Check database connection</li>
                <li>3. Verify environment variables</li>
                <li>4. Clear browser cache and cookies</li>
                <li>5. Check browser console for errors</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ConnectionTest;
