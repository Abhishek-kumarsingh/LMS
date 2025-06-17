import React from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Award, Calendar, User, BookOpen } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Certificate {
  id: string;
  certificateNumber: string;
  courseName: string;
  studentName: string;
  instructorName: string;
  issueDate: string;
  completionDate: string;
  status: 'PENDING' | 'GENERATED' | 'FAILED';
  downloadCount: number;
  fileUrl?: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: (certificateId: string) => void;
  onView?: (certificateId: string) => void;
  showActions?: boolean;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onDownload,
  onView,
  showActions = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GENERATED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'FAILED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Certificate of Completion
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              #{certificate.certificateNumber}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
          {certificate.status}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2 text-sm">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {certificate.courseName}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            Student: {certificate.studentName}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            Instructor: {certificate.instructorName}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Completed</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(certificate.completionDate)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Issued</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(certificate.issueDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showActions && certificate.status === 'GENERATED' && (
        <div className="flex space-x-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onDownload?.(certificate.id)}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(certificate.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )}

      {certificate.status === 'PENDING' && (
        <div className="text-center py-2">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Certificate is being generated...
          </p>
        </div>
      )}

      {certificate.status === 'FAILED' && (
        <div className="text-center py-2">
          <p className="text-sm text-red-600 dark:text-red-400">
            Certificate generation failed. Please contact support.
          </p>
        </div>
      )}

      {certificate.downloadCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Downloaded {certificate.downloadCount} time{certificate.downloadCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </Card>
  );
};

export default CertificateCard;
