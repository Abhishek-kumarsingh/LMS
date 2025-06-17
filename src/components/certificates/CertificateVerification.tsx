import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Award, User, BookOpen, Calendar, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CertificateInfo {
  valid: boolean;
  certificateNumber?: string;
  studentName?: string;
  courseName?: string;
  instructorName?: string;
  issueDate?: string;
  completionDate?: string;
  courseInfo?: {
    title: string;
    description: string;
    duration: number;
    level: string;
    category: string;
  };
  instructorInfo?: {
    name: string;
    email: string;
  };
  downloadCount?: number;
  status?: string;
  message?: string;
}

const CertificateVerification: React.FC = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateInfo | null>(null);
  const [searched, setSearched] = useState(false);

  const verifyCertificate = async () => {
    if (!certificateNumber.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/public/certificates/certificate-info/${certificateNumber.trim()}`);
      const data = await response.json();
      
      if (data.exists) {
        setResult({
          valid: true,
          certificateNumber: data.certificateNumber,
          studentName: data.studentName,
          courseName: data.courseName,
          instructorName: data.instructorName,
          issueDate: data.issueDate,
          completionDate: data.completionDate,
          courseInfo: data.courseInfo,
          instructorInfo: data.instructorInfo,
          downloadCount: data.downloadCount,
          status: data.status
        });
      } else {
        setResult({
          valid: false,
          message: data.message || 'Certificate not found or invalid'
        });
      }
    } catch (error) {
      setResult({
        valid: false,
        message: 'Failed to verify certificate. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}m`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyCertificate();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-4"
        >
          <Award className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Certificate Verification
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter a certificate number to verify its authenticity
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter certificate number (e.g., CERT-20240101120000-ABC12345)"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          <Button
            onClick={verifyCertificate}
            loading={loading}
            disabled={!certificateNumber.trim()}
          >
            <Search className="w-4 h-4 mr-2" />
            Verify
          </Button>
        </div>
      </Card>

      {searched && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {result.valid ? (
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Certificate Verified
                  </h2>
                  <p className="text-green-600 dark:text-green-400">
                    This certificate is authentic and valid
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Certificate Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Certificate #: {result.certificateNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Student: {result.studentName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Instructor: {result.instructorName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Dates
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(result.completionDate!)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Issued</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(result.issueDate!)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Course Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {result.courseName}
                          </p>
                          {result.courseInfo && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {result.courseInfo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {result.courseInfo && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Duration: {formatDuration(result.courseInfo.duration)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-4 h-4 text-center text-xs text-gray-400">📚</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Level: {result.courseInfo.level}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-4 h-4 text-center text-xs text-gray-400">🏷️</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Category: {result.courseInfo.category}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-center space-x-3 text-center">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Certificate Not Found
                  </h2>
                  <p className="text-red-600 dark:text-red-400">
                    {result.message}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CertificateVerification;
