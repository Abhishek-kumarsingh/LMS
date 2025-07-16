import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  FileText,
  Image,
  BarChart3,
  Calendar,
  Users,
  BookOpen,
  Award,
  MessageSquare,
  CheckCircle,
  Clock
} from 'lucide-react';
import { AnalyticsDashboard } from '../../types';
import { useToastStore } from '../../store/toastStore';
import Button from '../ui/Button';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: AnalyticsDashboard | null;
  courseId: string;
  timeRange: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  analytics,
  courseId,
  timeRange
}) => {
  const { addToast } = useToastStore();
  
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'overview',
    'engagement',
    'content',
    'assessments'
  ]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportSections = [
    {
      id: 'overview',
      label: 'Overview Summary',
      description: 'Key metrics and performance indicators',
      icon: BarChart3
    },
    {
      id: 'engagement',
      label: 'Student Engagement',
      description: 'Activity patterns and participation metrics',
      icon: Users
    },
    {
      id: 'content',
      label: 'Content Performance',
      description: 'Content views, completion rates, and effectiveness',
      icon: BookOpen
    },
    {
      id: 'assessments',
      label: 'Assessment Analytics',
      description: 'Grades, submission patterns, and question analysis',
      icon: Award
    },
    {
      id: 'forums',
      label: 'Forum Activity',
      description: 'Discussion participation and sentiment analysis',
      icon: MessageSquare
    },
    {
      id: 'insights',
      label: 'AI Insights',
      description: 'Recommendations and at-risk student identification',
      icon: CheckCircle
    }
  ];

  const formatOptions = [
    {
      id: 'pdf',
      label: 'PDF Report',
      description: 'Comprehensive formatted report with charts',
      icon: FileText,
      features: ['Charts & Graphs', 'Executive Summary', 'Formatted Layout']
    },
    {
      id: 'excel',
      label: 'Excel Workbook',
      description: 'Interactive spreadsheet with multiple sheets',
      icon: BarChart3,
      features: ['Multiple Worksheets', 'Raw Data', 'Pivot Tables']
    },
    {
      id: 'csv',
      label: 'CSV Data',
      description: 'Raw data export for custom analysis',
      icon: Download,
      features: ['Raw Data Only', 'Machine Readable', 'Custom Analysis']
    }
  ];

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    if (!analytics) {
      addToast('No analytics data available to export', 'error');
      return;
    }

    if (selectedSections.length === 0) {
      addToast('Please select at least one section to export', 'error');
      return;
    }

    setIsExporting(true);

    try {
      const exportData = {
        courseId,
        timeRange,
        format: selectedFormat,
        sections: selectedSections,
        includeCharts,
        includeRawData,
        analytics
      };

      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(exportData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `course-analytics-${courseId}-${timeRange}-${timestamp}.${selectedFormat}`;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        addToast('Analytics report exported successfully', 'success');
        onClose();
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      addToast('Failed to export analytics report', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const getEstimatedSize = () => {
    const baseSize = selectedSections.length * 0.5; // MB per section
    const chartSize = includeCharts ? selectedSections.length * 0.3 : 0;
    const rawDataSize = includeRawData ? 2 : 0;
    
    return Math.round((baseSize + chartSize + rawDataSize) * 10) / 10;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Export Analytics Report
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Generate a comprehensive analytics report for your course
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Format Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Export Format
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formatOptions.map((format) => {
                    const Icon = format.icon;
                    const isSelected = selectedFormat === format.id;
                    
                    return (
                      <label
                        key={format.id}
                        className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format.id}
                          checked={isSelected}
                          onChange={(e) => setSelectedFormat(e.target.value as any)}
                          className="sr-only"
                        />
                        
                        <div className="flex items-center space-x-3 mb-2">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {format.label}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {format.description}
                        </p>
                        
                        <div className="space-y-1">
                          {format.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Report Sections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exportSections.map((section) => {
                    const Icon = section.icon;
                    const isSelected = selectedSections.includes(section.id);
                    
                    return (
                      <label
                        key={section.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSectionToggle(section.id)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded mt-0.5"
                        />
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {section.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {section.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Export Options */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Export Options
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                      disabled={selectedFormat === 'csv'}
                    />
                    <Image className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Include Charts and Visualizations
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Add graphs and charts to the report (PDF/Excel only)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeRawData}
                      onChange={(e) => setIncludeRawData(e.target.checked)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                    />
                    <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Include Raw Data Tables
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Add detailed data tables for further analysis
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Export Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Export Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Format</div>
                    <div className="font-medium text-gray-900 dark:text-white uppercase">
                      {selectedFormat}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Sections</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedSections.length} of {exportSections.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Time Range</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {timeRange === '7d' ? '7 days' : 
                       timeRange === '30d' ? '30 days' : 
                       timeRange === '90d' ? '3 months' : '1 year'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Est. Size</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      ~{getEstimatedSize()} MB
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleExport}
                  loading={isExporting}
                  disabled={selectedSections.length === 0}
                  icon={<Download className="w-4 h-4" />}
                  className="flex-1"
                >
                  {isExporting ? 'Generating...' : 'Export Report'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;
