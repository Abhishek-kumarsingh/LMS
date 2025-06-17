import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Search, Filter, Calendar, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import CertificateCard from '../../components/certificates/CertificateCard';

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

const MyCertificates: React.FC = () => {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'GENERATED' | 'PENDING' | 'FAILED'>('all');

  // Mock data - replace with actual API calls
  const mockCertificates: Certificate[] = [
    {
      id: '1',
      certificateNumber: 'CERT-20240101120000-ABC12345',
      courseName: 'Complete React Development Bootcamp',
      studentName: user?.firstName + ' ' + user?.lastName || 'John Doe',
      instructorName: 'Sarah Johnson',
      issueDate: '2024-01-15T10:00:00Z',
      completionDate: '2024-01-14T18:30:00Z',
      status: 'GENERATED',
      downloadCount: 3,
      fileUrl: '/certificates/cert-1.pdf'
    },
    {
      id: '2',
      certificateNumber: 'CERT-20240105140000-DEF67890',
      courseName: 'UI/UX Design Fundamentals',
      studentName: user?.firstName + ' ' + user?.lastName || 'John Doe',
      instructorName: 'Michael Chen',
      issueDate: '2024-01-20T14:00:00Z',
      completionDate: '2024-01-19T16:45:00Z',
      status: 'GENERATED',
      downloadCount: 1,
      fileUrl: '/certificates/cert-2.pdf'
    },
    {
      id: '3',
      certificateNumber: 'CERT-20240110160000-GHI11223',
      courseName: 'Advanced JavaScript Concepts',
      studentName: user?.firstName + ' ' + user?.lastName || 'John Doe',
      instructorName: 'David Wilson',
      issueDate: '2024-01-25T16:00:00Z',
      completionDate: '2024-01-24T20:15:00Z',
      status: 'PENDING',
      downloadCount: 0
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCertificates(mockCertificates);
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownload = async (certificateId: string) => {
    try {
      // Replace with actual download logic
      const certificate = certificates.find(c => c.id === certificateId);
      if (certificate?.fileUrl) {
        // Simulate download
        console.log('Downloading certificate:', certificate.certificateNumber);
        
        // Update download count
        setCertificates(prev => 
          prev.map(cert => 
            cert.id === certificateId 
              ? { ...cert, downloadCount: cert.downloadCount + 1 }
              : cert
          )
        );
      }
    } catch (error) {
      console.error('Failed to download certificate:', error);
    }
  };

  const handleView = (certificateId: string) => {
    const certificate = certificates.find(c => c.id === certificateId);
    if (certificate) {
      // Open certificate in new tab or modal
      console.log('Viewing certificate:', certificate.certificateNumber);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: certificates.length,
    generated: certificates.filter(c => c.status === 'GENERATED').length,
    pending: certificates.filter(c => c.status === 'PENDING').length,
    failed: certificates.filter(c => c.status === 'FAILED').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Award className="w-8 h-8 mr-3 text-yellow-500" />
            My Certificates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and download your earned certificates
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Certificates
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.generated}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Available
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Processing
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.failed}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Failed
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="GENERATED">Available</option>
              <option value="PENDING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <Card className="p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No certificates found' : 'No certificates yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Complete courses to earn your first certificate'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button variant="primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Courses
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate, index) => (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CertificateCard
                certificate={certificate}
                onDownload={handleDownload}
                onView={handleView}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
