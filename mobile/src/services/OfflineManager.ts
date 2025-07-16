import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';
import { MMKV } from 'react-native-mmkv';

import { Course, Lesson, Assignment, VideoContent } from '../types';
import { ApiService } from './ApiService';
import { AnalyticsManager } from './AnalyticsManager';

interface OfflineContent {
  id: string;
  type: 'course' | 'lesson' | 'video' | 'document' | 'assignment';
  title: string;
  data: any;
  downloadedAt: string;
  lastAccessed: string;
  fileSize: number;
  filePath?: string;
  thumbnailPath?: string;
  isComplete: boolean;
  expiresAt?: string;
}

interface DownloadProgress {
  id: string;
  progress: number;
  totalSize: number;
  downloadedSize: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  error?: string;
}

interface OfflineSettings {
  autoDownload: boolean;
  downloadOnWifiOnly: boolean;
  maxStorageSize: number; // in MB
  videoQuality: 'low' | 'medium' | 'high';
  deleteAfterDays: number;
}

class OfflineManagerService {
  private storage = new MMKV({ id: 'offline-storage' });
  private downloadQueue: Map<string, DownloadProgress> = new Map();
  private activeDownloads: Set<string> = new Set();
  private maxConcurrentDownloads = 3;
  private listeners: Set<(progress: DownloadProgress) => void> = new Set();

  private readonly STORAGE_KEYS = {
    OFFLINE_CONTENT: 'offline_content',
    DOWNLOAD_QUEUE: 'download_queue',
    OFFLINE_SETTINGS: 'offline_settings',
    PENDING_UPLOADS: 'pending_uploads',
    SYNC_QUEUE: 'sync_queue',
  };

  private readonly DEFAULT_SETTINGS: OfflineSettings = {
    autoDownload: false,
    downloadOnWifiOnly: true,
    maxStorageSize: 2048, // 2GB
    videoQuality: 'medium',
    deleteAfterDays: 30,
  };

  async initialize(): Promise<void> {
    try {
      // Load existing download queue
      await this.loadDownloadQueue();
      
      // Resume any interrupted downloads
      await this.resumeDownloads();
      
      // Clean up expired content
      await this.cleanupExpiredContent();
      
      // Setup network listener
      this.setupNetworkListener();
      
      console.log('OfflineManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OfflineManager:', error);
      throw error;
    }
  }

  // Content Download Methods
  async downloadCourse(courseId: string): Promise<void> {
    try {
      const course = await ApiService.getCourse(courseId);
      const lessons = await ApiService.getCourseLessons(courseId);
      
      // Add course to download queue
      await this.addToDownloadQueue({
        id: `course_${courseId}`,
        type: 'course',
        title: course.title,
        data: { course, lessons },
        totalSize: this.estimateCourseSize(course, lessons),
      });

      // Download individual lessons
      for (const lesson of lessons) {
        await this.downloadLesson(lesson.id);
      }

      AnalyticsManager.trackEvent('offline_course_download_started', {
        courseId,
        lessonCount: lessons.length,
      });
    } catch (error) {
      console.error('Failed to download course:', error);
      throw error;
    }
  }

  async downloadLesson(lessonId: string): Promise<void> {
    try {
      const lesson = await ApiService.getLesson(lessonId);
      
      const downloadId = `lesson_${lessonId}`;
      const totalSize = this.estimateLessonSize(lesson);
      
      await this.addToDownloadQueue({
        id: downloadId,
        type: 'lesson',
        title: lesson.title,
        data: lesson,
        totalSize,
      });

      // Download associated media files
      if (lesson.videoContent) {
        await this.downloadVideo(lesson.videoContent);
      }

      if (lesson.documents) {
        for (const doc of lesson.documents) {
          await this.downloadDocument(doc);
        }
      }

      AnalyticsManager.trackEvent('offline_lesson_download_started', {
        lessonId,
        hasVideo: !!lesson.videoContent,
        documentCount: lesson.documents?.length || 0,
      });
    } catch (error) {
      console.error('Failed to download lesson:', error);
      throw error;
    }
  }

  async downloadVideo(video: VideoContent): Promise<void> {
    try {
      const settings = await this.getSettings();
      const videoUrl = this.getVideoUrlByQuality(video, settings.videoQuality);
      
      const downloadId = `video_${video.id}`;
      const fileName = `video_${video.id}.mp4`;
      const filePath = `${RNFS.DocumentDirectoryPath}/videos/${fileName}`;
      
      // Ensure directory exists
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/videos`);
      
      const downloadProgress: DownloadProgress = {
        id: downloadId,
        progress: 0,
        totalSize: video.fileSize || 0,
        downloadedSize: 0,
        status: 'pending',
      };

      this.downloadQueue.set(downloadId, downloadProgress);
      this.notifyListeners(downloadProgress);

      // Start download
      const downloadResult = await RNFS.downloadFile({
        fromUrl: videoUrl,
        toFile: filePath,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          downloadProgress.progress = progress;
          downloadProgress.downloadedSize = res.bytesWritten;
          downloadProgress.status = 'downloading';
          
          this.downloadQueue.set(downloadId, downloadProgress);
          this.notifyListeners(downloadProgress);
        },
      }).promise;

      if (downloadResult.statusCode === 200) {
        downloadProgress.status = 'completed';
        downloadProgress.progress = 100;
        
        // Save offline content record
        await this.saveOfflineContent({
          id: downloadId,
          type: 'video',
          title: video.title,
          data: video,
          downloadedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          fileSize: video.fileSize || 0,
          filePath,
          isComplete: true,
        });

        // Download thumbnail if available
        if (video.thumbnailUrl) {
          await this.downloadThumbnail(video.id, video.thumbnailUrl);
        }
      } else {
        downloadProgress.status = 'failed';
        downloadProgress.error = 'Download failed';
      }

      this.downloadQueue.set(downloadId, downloadProgress);
      this.notifyListeners(downloadProgress);
    } catch (error) {
      console.error('Failed to download video:', error);
      throw error;
    }
  }

  async downloadDocument(document: any): Promise<void> {
    try {
      const downloadId = `document_${document.id}`;
      const fileName = `document_${document.id}.${document.extension}`;
      const filePath = `${RNFS.DocumentDirectoryPath}/documents/${fileName}`;
      
      // Ensure directory exists
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/documents`);
      
      const downloadResult = await RNFS.downloadFile({
        fromUrl: document.url,
        toFile: filePath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        await this.saveOfflineContent({
          id: downloadId,
          type: 'document',
          title: document.title,
          data: document,
          downloadedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          fileSize: document.fileSize || 0,
          filePath,
          isComplete: true,
        });
      }
    } catch (error) {
      console.error('Failed to download document:', error);
      throw error;
    }
  }

  // Content Access Methods
  async getOfflineContent(): Promise<OfflineContent[]> {
    try {
      const contentJson = this.storage.getString(this.STORAGE_KEYS.OFFLINE_CONTENT);
      return contentJson ? JSON.parse(contentJson) : [];
    } catch (error) {
      console.error('Failed to get offline content:', error);
      return [];
    }
  }

  async getOfflineContentById(id: string): Promise<OfflineContent | null> {
    try {
      const content = await this.getOfflineContent();
      const item = content.find(item => item.id === id);
      
      if (item) {
        // Update last accessed time
        item.lastAccessed = new Date().toISOString();
        await this.saveOfflineContent(item);
      }
      
      return item || null;
    } catch (error) {
      console.error('Failed to get offline content by ID:', error);
      return null;
    }
  }

  async isContentAvailableOffline(id: string, type: string): Promise<boolean> {
    const content = await this.getOfflineContentById(`${type}_${id}`);
    return content?.isComplete || false;
  }

  // Storage Management
  async getStorageInfo(): Promise<{
    totalSize: number;
    usedSize: number;
    availableSize: number;
    contentCount: number;
  }> {
    try {
      const content = await this.getOfflineContent();
      const usedSize = content.reduce((total, item) => total + item.fileSize, 0);
      const totalSize = await this.getMaxStorageSize();
      
      return {
        totalSize,
        usedSize,
        availableSize: totalSize - usedSize,
        contentCount: content.length,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalSize: 0,
        usedSize: 0,
        availableSize: 0,
        contentCount: 0,
      };
    }
  }

  async deleteOfflineContent(id: string): Promise<void> {
    try {
      const content = await this.getOfflineContent();
      const item = content.find(item => item.id === id);
      
      if (item) {
        // Delete file if exists
        if (item.filePath && await RNFS.exists(item.filePath)) {
          await RNFS.unlink(item.filePath);
        }
        
        // Delete thumbnail if exists
        if (item.thumbnailPath && await RNFS.exists(item.thumbnailPath)) {
          await RNFS.unlink(item.thumbnailPath);
        }
        
        // Remove from storage
        const updatedContent = content.filter(item => item.id !== id);
        this.storage.set(this.STORAGE_KEYS.OFFLINE_CONTENT, JSON.stringify(updatedContent));
        
        AnalyticsManager.trackEvent('offline_content_deleted', {
          contentId: id,
          contentType: item.type,
          fileSize: item.fileSize,
        });
      }
    } catch (error) {
      console.error('Failed to delete offline content:', error);
      throw error;
    }
  }

  async clearAllOfflineContent(): Promise<void> {
    try {
      const content = await this.getOfflineContent();
      
      // Delete all files
      for (const item of content) {
        if (item.filePath && await RNFS.exists(item.filePath)) {
          await RNFS.unlink(item.filePath);
        }
        if (item.thumbnailPath && await RNFS.exists(item.thumbnailPath)) {
          await RNFS.unlink(item.thumbnailPath);
        }
      }
      
      // Clear storage
      this.storage.delete(this.STORAGE_KEYS.OFFLINE_CONTENT);
      this.storage.delete(this.STORAGE_KEYS.DOWNLOAD_QUEUE);
      
      AnalyticsManager.trackEvent('offline_content_cleared', {
        contentCount: content.length,
        totalSize: content.reduce((total, item) => total + item.fileSize, 0),
      });
    } catch (error) {
      console.error('Failed to clear offline content:', error);
      throw error;
    }
  }

  // Settings Management
  async getSettings(): Promise<OfflineSettings> {
    try {
      const settingsJson = this.storage.getString(this.STORAGE_KEYS.OFFLINE_SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : this.DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to get offline settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: Partial<OfflineSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      this.storage.set(this.STORAGE_KEYS.OFFLINE_SETTINGS, JSON.stringify(updatedSettings));
      
      AnalyticsManager.trackEvent('offline_settings_updated', settings);
    } catch (error) {
      console.error('Failed to update offline settings:', error);
      throw error;
    }
  }

  // Sync Management
  async addToSyncQueue(data: any): Promise<void> {
    try {
      const queueJson = this.storage.getString(this.STORAGE_KEYS.SYNC_QUEUE);
      const queue = queueJson ? JSON.parse(queueJson) : [];
      
      queue.push({
        id: Date.now().toString(),
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
      
      this.storage.set(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  async syncPendingData(): Promise<void> {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return;
      }

      const queueJson = this.storage.getString(this.STORAGE_KEYS.SYNC_QUEUE);
      const queue = queueJson ? JSON.parse(queueJson) : [];
      
      const successfulSyncs: string[] = [];
      
      for (const item of queue) {
        try {
          await ApiService.syncData(item.data);
          successfulSyncs.push(item.id);
        } catch (error) {
          console.error('Failed to sync item:', error);
          item.retryCount = (item.retryCount || 0) + 1;
          
          // Remove items that have failed too many times
          if (item.retryCount > 3) {
            successfulSyncs.push(item.id);
          }
        }
      }
      
      // Remove successfully synced items
      const remainingQueue = queue.filter(item => !successfulSyncs.includes(item.id));
      this.storage.set(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remainingQueue));
      
      AnalyticsManager.trackEvent('offline_data_synced', {
        syncedCount: successfulSyncs.length,
        remainingCount: remainingQueue.length,
      });
    } catch (error) {
      console.error('Failed to sync pending data:', error);
    }
  }

  // Private Helper Methods
  private async saveOfflineContent(content: OfflineContent): Promise<void> {
    try {
      const existingContent = await this.getOfflineContent();
      const index = existingContent.findIndex(item => item.id === content.id);
      
      if (index >= 0) {
        existingContent[index] = content;
      } else {
        existingContent.push(content);
      }
      
      this.storage.set(this.STORAGE_KEYS.OFFLINE_CONTENT, JSON.stringify(existingContent));
    } catch (error) {
      console.error('Failed to save offline content:', error);
      throw error;
    }
  }

  private async addToDownloadQueue(item: Omit<DownloadProgress, 'progress' | 'downloadedSize' | 'status'>): Promise<void> {
    const downloadProgress: DownloadProgress = {
      ...item,
      progress: 0,
      downloadedSize: 0,
      status: 'pending',
    };
    
    this.downloadQueue.set(item.id, downloadProgress);
    await this.saveDownloadQueue();
    this.processDownloadQueue();
  }

  private async loadDownloadQueue(): Promise<void> {
    try {
      const queueJson = this.storage.getString(this.STORAGE_KEYS.DOWNLOAD_QUEUE);
      if (queueJson) {
        const queueArray = JSON.parse(queueJson);
        this.downloadQueue = new Map(queueArray);
      }
    } catch (error) {
      console.error('Failed to load download queue:', error);
    }
  }

  private async saveDownloadQueue(): Promise<void> {
    try {
      const queueArray = Array.from(this.downloadQueue.entries());
      this.storage.set(this.STORAGE_KEYS.DOWNLOAD_QUEUE, JSON.stringify(queueArray));
    } catch (error) {
      console.error('Failed to save download queue:', error);
    }
  }

  private async processDownloadQueue(): Promise<void> {
    const pendingDownloads = Array.from(this.downloadQueue.values())
      .filter(item => item.status === 'pending');
    
    const availableSlots = this.maxConcurrentDownloads - this.activeDownloads.size;
    const downloadsToStart = pendingDownloads.slice(0, availableSlots);
    
    for (const download of downloadsToStart) {
      this.startDownload(download);
    }
  }

  private async startDownload(download: DownloadProgress): Promise<void> {
    this.activeDownloads.add(download.id);
    
    try {
      // Implementation depends on content type
      switch (download.type) {
        case 'video':
          // Video download logic
          break;
        case 'document':
          // Document download logic
          break;
        default:
          // Generic download logic
          break;
      }
    } catch (error) {
      download.status = 'failed';
      download.error = error.message;
    } finally {
      this.activeDownloads.delete(download.id);
      this.processDownloadQueue(); // Process next items in queue
    }
  }

  private notifyListeners(progress: DownloadProgress): void {
    this.listeners.forEach(listener => listener(progress));
  }

  // Additional helper methods...
  private estimateCourseSize(course: Course, lessons: Lesson[]): number {
    // Estimate based on lesson count and average sizes
    return lessons.length * 50 * 1024 * 1024; // 50MB per lesson estimate
  }

  private estimateLessonSize(lesson: Lesson): number {
    let size = 1024 * 1024; // 1MB base size
    
    if (lesson.videoContent) {
      size += lesson.videoContent.fileSize || 50 * 1024 * 1024;
    }
    
    if (lesson.documents) {
      size += lesson.documents.reduce((total, doc) => total + (doc.fileSize || 1024 * 1024), 0);
    }
    
    return size;
  }

  private getVideoUrlByQuality(video: VideoContent, quality: string): string {
    // Return appropriate video URL based on quality setting
    switch (quality) {
      case 'low':
        return video.urls?.low || video.url;
      case 'high':
        return video.urls?.high || video.url;
      default:
        return video.urls?.medium || video.url;
    }
  }

  private async downloadThumbnail(videoId: string, thumbnailUrl: string): Promise<void> {
    try {
      const fileName = `thumbnail_${videoId}.jpg`;
      const filePath = `${RNFS.DocumentDirectoryPath}/thumbnails/${fileName}`;
      
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/thumbnails`);
      
      await RNFS.downloadFile({
        fromUrl: thumbnailUrl,
        toFile: filePath,
      }).promise;
      
      // Update content record with thumbnail path
      const content = await this.getOfflineContentById(`video_${videoId}`);
      if (content) {
        content.thumbnailPath = filePath;
        await this.saveOfflineContent(content);
      }
    } catch (error) {
      console.error('Failed to download thumbnail:', error);
    }
  }

  private async getMaxStorageSize(): Promise<number> {
    const settings = await this.getSettings();
    return settings.maxStorageSize * 1024 * 1024; // Convert MB to bytes
  }

  private async resumeDownloads(): Promise<void> {
    // Resume any downloads that were interrupted
    const pendingDownloads = Array.from(this.downloadQueue.values())
      .filter(item => item.status === 'downloading');
    
    for (const download of pendingDownloads) {
      download.status = 'pending';
    }
    
    this.processDownloadQueue();
  }

  private async cleanupExpiredContent(): Promise<void> {
    try {
      const content = await this.getOfflineContent();
      const settings = await this.getSettings();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - settings.deleteAfterDays);
      
      const expiredContent = content.filter(item => {
        const downloadDate = new Date(item.downloadedAt);
        return downloadDate < expirationDate;
      });
      
      for (const item of expiredContent) {
        await this.deleteOfflineContent(item.id);
      }
    } catch (error) {
      console.error('Failed to cleanup expired content:', error);
    }
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        // Resume downloads when network is available
        this.processDownloadQueue();
        
        // Sync pending data
        this.syncPendingData();
      }
    });
  }

  // Public API for listeners
  addProgressListener(listener: (progress: DownloadProgress) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getDownloadProgress(): DownloadProgress[] {
    return Array.from(this.downloadQueue.values());
  }

  async pauseDownload(id: string): Promise<void> {
    const download = this.downloadQueue.get(id);
    if (download && download.status === 'downloading') {
      download.status = 'paused';
      this.downloadQueue.set(id, download);
      await this.saveDownloadQueue();
    }
  }

  async resumeDownload(id: string): Promise<void> {
    const download = this.downloadQueue.get(id);
    if (download && download.status === 'paused') {
      download.status = 'pending';
      this.downloadQueue.set(id, download);
      await this.saveDownloadQueue();
      this.processDownloadQueue();
    }
  }

  async cancelDownload(id: string): Promise<void> {
    const download = this.downloadQueue.get(id);
    if (download) {
      this.downloadQueue.delete(id);
      this.activeDownloads.delete(id);
      await this.saveDownloadQueue();
    }
  }

  // Save any pending data before app closes
  savePendingData(): void {
    try {
      this.saveDownloadQueue();
    } catch (error) {
      console.error('Failed to save pending data:', error);
    }
  }
}

export const OfflineManager = new OfflineManagerService();
