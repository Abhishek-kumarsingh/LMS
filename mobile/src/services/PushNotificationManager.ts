import { Platform, Alert, Linking, AppState } from 'react-native';
import PushNotification, { Importance } from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ApiService } from './ApiService';
import { AnalyticsManager } from './AnalyticsManager';
import { NavigationService } from '../navigation/NavigationService';

interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: NotificationType;
  priority: 'high' | 'normal' | 'low';
  scheduledTime?: string;
  courseId?: string;
  lessonId?: string;
  assignmentId?: string;
}

type NotificationType = 
  | 'assignment_due'
  | 'course_update'
  | 'lesson_available'
  | 'grade_posted'
  | 'message_received'
  | 'live_stream_starting'
  | 'reminder'
  | 'announcement'
  | 'discussion_reply';

interface NotificationSettings {
  enabled: boolean;
  assignments: boolean;
  courses: boolean;
  messages: boolean;
  liveStreams: boolean;
  reminders: boolean;
  announcements: boolean;
  discussions: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  };
  sound: boolean;
  vibration: boolean;
}

class PushNotificationManagerService {
  private fcmToken: string | null = null;
  private isInitialized = false;
  private notificationQueue: NotificationData[] = [];
  private settings: NotificationSettings | null = null;

  private readonly STORAGE_KEYS = {
    FCM_TOKEN: 'fcm_token',
    NOTIFICATION_SETTINGS: 'notification_settings',
    SCHEDULED_NOTIFICATIONS: 'scheduled_notifications',
  };

  private readonly DEFAULT_SETTINGS: NotificationSettings = {
    enabled: true,
    assignments: true,
    courses: true,
    messages: true,
    liveStreams: true,
    reminders: true,
    announcements: true,
    discussions: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    sound: true,
    vibration: true,
  };

  async initialize(): Promise<void> {
    try {
      // Request permissions
      await this.requestPermissions();
      
      // Configure push notifications
      await this.configurePushNotifications();
      
      // Setup Firebase messaging
      await this.setupFirebaseMessaging();
      
      // Load settings
      await this.loadSettings();
      
      // Setup notification handlers
      this.setupNotificationHandlers();
      
      // Process any queued notifications
      this.processNotificationQueue();
      
      this.isInitialized = true;
      console.log('PushNotificationManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PushNotificationManager:', error);
      throw error;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in Settings to receive important updates.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }

        return enabled;
      } else {
        // Android
        const permission = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        return permission === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  async configurePushNotifications(): Promise<void> {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
        this.handleTokenUpdate(token.token);
      },

      onNotification: (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);

        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      onAction: (notification) => {
        console.log('Notification action:', notification);
        this.handleNotificationAction(notification);
      },

      onRegistrationError: (error) => {
        console.error('Push notification registration error:', error);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      this.createNotificationChannels();
    }
  }

  async setupFirebaseMessaging(): Promise<void> {
    try {
      // Get FCM token
      const token = await messaging().getToken();
      this.fcmToken = token;
      await AsyncStorage.setItem(this.STORAGE_KEYS.FCM_TOKEN, token);
      
      // Send token to server
      await this.registerTokenWithServer(token);

      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        this.fcmToken = newToken;
        await AsyncStorage.setItem(this.STORAGE_KEYS.FCM_TOKEN, newToken);
        await this.registerTokenWithServer(newToken);
      });

      // Handle background messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message received:', remoteMessage);
        await this.handleBackgroundMessage(remoteMessage);
      });

      // Handle foreground messages
      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message received:', remoteMessage);
        await this.handleForegroundMessage(remoteMessage);
      });

      // Handle notification opened app
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification opened app:', remoteMessage);
        this.handleNotificationOpened(remoteMessage);
      });

      // Check if app was opened from a notification
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('App opened from notification:', initialNotification);
        this.handleNotificationOpened(initialNotification);
      }
    } catch (error) {
      console.error('Failed to setup Firebase messaging:', error);
    }
  }

  private createNotificationChannels(): void {
    const channels = [
      {
        channelId: 'assignments',
        channelName: 'Assignments',
        channelDescription: 'Assignment due dates and updates',
        importance: Importance.HIGH,
      },
      {
        channelId: 'courses',
        channelName: 'Courses',
        channelDescription: 'Course updates and new content',
        importance: Importance.DEFAULT,
      },
      {
        channelId: 'messages',
        channelName: 'Messages',
        channelDescription: 'Direct messages and chat notifications',
        importance: Importance.HIGH,
      },
      {
        channelId: 'live_streams',
        channelName: 'Live Streams',
        channelDescription: 'Live stream notifications',
        importance: Importance.HIGH,
      },
      {
        channelId: 'reminders',
        channelName: 'Reminders',
        channelDescription: 'Study reminders and scheduled notifications',
        importance: Importance.DEFAULT,
      },
      {
        channelId: 'announcements',
        channelName: 'Announcements',
        channelDescription: 'Important announcements',
        importance: Importance.HIGH,
      },
    ];

    channels.forEach((channel) => {
      PushNotification.createChannel(
        {
          channelId: channel.channelId,
          channelName: channel.channelName,
          channelDescription: channel.channelDescription,
          importance: channel.importance,
          vibrate: true,
        },
        (created) => console.log(`Channel ${channel.channelId} created: ${created}`)
      );
    });
  }

  // Notification Sending Methods
  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.enabled || !this.shouldSendNotification(notification, settings)) {
        return;
      }

      const channelId = this.getChannelId(notification.type);
      
      PushNotification.localNotification({
        id: notification.id,
        title: notification.title,
        message: notification.body,
        channelId,
        userInfo: notification.data,
        playSound: settings.sound,
        vibrate: settings.vibration,
        priority: notification.priority,
        importance: notification.priority === 'high' ? 'high' : 'default',
        allowWhileIdle: true,
        ignoreInForeground: false,
      });

      AnalyticsManager.trackEvent('local_notification_sent', {
        type: notification.type,
        priority: notification.priority,
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  async scheduleNotification(notification: NotificationData, date: Date): Promise<void> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.enabled || !this.shouldSendNotification(notification, settings)) {
        return;
      }

      const channelId = this.getChannelId(notification.type);
      
      PushNotification.localNotificationSchedule({
        id: notification.id,
        title: notification.title,
        message: notification.body,
        date,
        channelId,
        userInfo: notification.data,
        playSound: settings.sound,
        vibrate: settings.vibration,
        allowWhileIdle: true,
      });

      // Save scheduled notification
      await this.saveScheduledNotification(notification, date);

      AnalyticsManager.trackEvent('notification_scheduled', {
        type: notification.type,
        scheduledTime: date.toISOString(),
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  async cancelNotification(id: string): Promise<void> {
    try {
      PushNotification.cancelLocalNotification(id);
      await this.removeScheduledNotification(id);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      PushNotification.cancelAllLocalNotifications();
      await AsyncStorage.removeItem(this.STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Settings Management
  async getSettings(): Promise<NotificationSettings> {
    if (this.settings) {
      return this.settings;
    }

    try {
      const settingsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.NOTIFICATION_SETTINGS);
      this.settings = settingsJson ? JSON.parse(settingsJson) : this.DEFAULT_SETTINGS;
      return this.settings;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      
      this.settings = updatedSettings;
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.NOTIFICATION_SETTINGS,
        JSON.stringify(updatedSettings)
      );

      // Update server preferences
      await this.updateServerPreferences(updatedSettings);

      AnalyticsManager.trackEvent('notification_settings_updated', settings);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  // Badge Management
  async updateBadgeCount(count: number): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        PushNotificationIOS.setApplicationIconBadgeNumber(count);
      } else {
        PushNotification.setApplicationIconBadgeNumber(count);
      }
    } catch (error) {
      console.error('Failed to update badge count:', error);
    }
  }

  async clearBadge(): Promise<void> {
    await this.updateBadgeCount(0);
  }

  // Private Helper Methods
  private async loadSettings(): Promise<void> {
    this.settings = await this.getSettings();
  }

  private setupNotificationHandlers(): void {
    // Handle app state changes
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        this.clearBadge();
      }
    });
  }

  private async handleTokenUpdate(token: string): Promise<void> {
    try {
      this.fcmToken = token;
      await AsyncStorage.setItem(this.STORAGE_KEYS.FCM_TOKEN, token);
      await this.registerTokenWithServer(token);
    } catch (error) {
      console.error('Failed to handle token update:', error);
    }
  }

  private async registerTokenWithServer(token: string): Promise<void> {
    try {
      await ApiService.registerPushToken(token, Platform.OS);
    } catch (error) {
      console.error('Failed to register token with server:', error);
    }
  }

  private async handleNotificationReceived(notification: any): Promise<void> {
    try {
      AnalyticsManager.trackEvent('notification_received', {
        type: notification.data?.type,
        foreground: notification.foreground,
      });

      // Update badge count
      if (notification.badge) {
        await this.updateBadgeCount(notification.badge);
      }
    } catch (error) {
      console.error('Failed to handle notification received:', error);
    }
  }

  private handleNotificationAction(notification: any): void {
    try {
      AnalyticsManager.trackEvent('notification_action', {
        action: notification.action,
        type: notification.data?.type,
      });

      // Handle specific actions
      switch (notification.action) {
        case 'reply':
          // Handle reply action
          break;
        case 'mark_read':
          // Handle mark as read action
          break;
        default:
          this.handleNotificationOpened(notification);
          break;
      }
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  }

  private async handleBackgroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    try {
      console.log('Background message handled:', remoteMessage);
      
      // Process background message
      if (remoteMessage.data) {
        await this.processRemoteMessage(remoteMessage);
      }
    } catch (error) {
      console.error('Failed to handle background message:', error);
    }
  }

  private async handleForegroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    try {
      console.log('Foreground message handled:', remoteMessage);
      
      // Show local notification for foreground messages
      if (remoteMessage.notification) {
        await this.sendLocalNotification({
          id: remoteMessage.messageId || Date.now().toString(),
          title: remoteMessage.notification.title || '',
          body: remoteMessage.notification.body || '',
          data: remoteMessage.data,
          type: (remoteMessage.data?.type as NotificationType) || 'announcement',
          priority: 'normal',
        });
      }
    } catch (error) {
      console.error('Failed to handle foreground message:', error);
    }
  }

  private handleNotificationOpened(remoteMessage: FirebaseMessagingTypes.RemoteMessage | any): void {
    try {
      AnalyticsManager.trackEvent('notification_opened', {
        type: remoteMessage.data?.type,
      });

      // Navigate based on notification type
      const data = remoteMessage.data;
      if (data) {
        this.navigateFromNotification(data);
      }
    } catch (error) {
      console.error('Failed to handle notification opened:', error);
    }
  }

  private navigateFromNotification(data: Record<string, any>): void {
    try {
      switch (data.type) {
        case 'assignment_due':
          if (data.assignmentId) {
            NavigationService.navigate('AssignmentDetail', { assignmentId: data.assignmentId });
          }
          break;
        case 'course_update':
          if (data.courseId) {
            NavigationService.navigate('CourseDetail', { courseId: data.courseId });
          }
          break;
        case 'lesson_available':
          if (data.lessonId) {
            NavigationService.navigate('Lesson', { lessonId: data.lessonId });
          }
          break;
        case 'message_received':
          NavigationService.navigate('MessagesTab');
          break;
        case 'live_stream_starting':
          if (data.streamId) {
            NavigationService.navigate('LiveStream', { streamId: data.streamId });
          }
          break;
        default:
          NavigationService.navigate('DashboardTab');
          break;
      }
    } catch (error) {
      console.error('Failed to navigate from notification:', error);
    }
  }

  private async processRemoteMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    // Process remote message data
    // This could include updating local data, triggering sync, etc.
  }

  private shouldSendNotification(notification: NotificationData, settings: NotificationSettings): boolean {
    // Check if notifications are enabled for this type
    switch (notification.type) {
      case 'assignment_due':
        return settings.assignments;
      case 'course_update':
      case 'lesson_available':
        return settings.courses;
      case 'message_received':
        return settings.messages;
      case 'live_stream_starting':
        return settings.liveStreams;
      case 'reminder':
        return settings.reminders;
      case 'announcement':
        return settings.announcements;
      case 'discussion_reply':
        return settings.discussions;
      default:
        return true;
    }
  }

  private isInQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const startTime = settings.quietHours.startTime;
    const endTime = settings.quietHours.endTime;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private getChannelId(type: NotificationType): string {
    switch (type) {
      case 'assignment_due':
        return 'assignments';
      case 'course_update':
      case 'lesson_available':
        return 'courses';
      case 'message_received':
        return 'messages';
      case 'live_stream_starting':
        return 'live_streams';
      case 'reminder':
        return 'reminders';
      case 'announcement':
        return 'announcements';
      case 'discussion_reply':
        return 'discussions';
      default:
        return 'default';
    }
  }

  private processNotificationQueue(): void {
    // Process any queued notifications
    this.notificationQueue.forEach(async (notification) => {
      await this.sendLocalNotification(notification);
    });
    this.notificationQueue = [];
  }

  private async saveScheduledNotification(notification: NotificationData, date: Date): Promise<void> {
    try {
      const scheduledJson = await AsyncStorage.getItem(this.STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
      const scheduled = scheduledJson ? JSON.parse(scheduledJson) : [];
      
      scheduled.push({
        ...notification,
        scheduledTime: date.toISOString(),
      });
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SCHEDULED_NOTIFICATIONS,
        JSON.stringify(scheduled)
      );
    } catch (error) {
      console.error('Failed to save scheduled notification:', error);
    }
  }

  private async removeScheduledNotification(id: string): Promise<void> {
    try {
      const scheduledJson = await AsyncStorage.getItem(this.STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
      const scheduled = scheduledJson ? JSON.parse(scheduledJson) : [];
      
      const updated = scheduled.filter((notification: any) => notification.id !== id);
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SCHEDULED_NOTIFICATIONS,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Failed to remove scheduled notification:', error);
    }
  }

  private async updateServerPreferences(settings: NotificationSettings): Promise<void> {
    try {
      await ApiService.updateNotificationPreferences(settings);
    } catch (error) {
      console.error('Failed to update server preferences:', error);
    }
  }

  // Public API
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async getScheduledNotifications(): Promise<NotificationData[]> {
    try {
      const scheduledJson = await AsyncStorage.getItem(this.STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
      return scheduledJson ? JSON.parse(scheduledJson) : [];
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }
}

export const PushNotificationManager = new PushNotificationManagerService();
