import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const BACKGROUND_NOTIFICATION_TASK = 'background-notification-fetch';

const STORAGE_KEYS = {
  NOTIFICATION_CONFIG: 'notification_config',
  DEVICE_ID: 'device_id',
  USER_ID: 'user_id',
  LAST_NOTIFICATION_CHECK: 'last_notification_check',
  NOTIFICATION_HISTORY: 'notification_history'
};

class NotificationService {
  constructor() {
    this.config = null;
    this.deviceId = null;
    this.userId = null;
    this.isInitialized = false;
  }

  async initialize(config = {}) {
    try {
      const storedConfig = await this.getStoredConfig();
      this.config = { ...storedConfig, ...config };

      this.deviceId = await this.getOrCreateDeviceId();
      
      this.userId = config.userId || await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      await this.requestPermissions();

      if (this.config.apiEndpoint) {
        await this.setupBackgroundTask();
        await this.registerDevice();
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
      return false;
    }
  }

  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
    }
  }

  async getOrCreateDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      
      if (!deviceId) {
        deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Failed to get or create device ID:', error);
      return `fallback_${Date.now()}`;
    }
  }

  async setupBackgroundTask() {
    try {
      TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
        try {
          await this.fetchNotificationsFromAPI();
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (error) {
          console.error('Background notification fetch failed:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
          minimumInterval: (this.config.pollInterval || 15) * 60 * 1000,
          stopOnTerminate: false,
          startOnBoot: true,
        });
      }
    } catch (error) {
      console.error('Failed to setup background task:', error);
    }
  }

  async fetchNotificationsFromAPI() {
    if (!this.config.apiEndpoint) {
      return;
    }

    try {
      const lastCheck = await AsyncStorage.getItem(STORAGE_KEYS.LAST_NOTIFICATION_CHECK);
      const headers = {
        'Content-Type': 'application/json',
        ...this.config.headers
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const params = new URLSearchParams({
        deviceId: this.deviceId,
        ...(this.userId && { userId: this.userId }),
        ...(lastCheck && { since: lastCheck })
      });

      const response = await fetch(`${this.config.apiEndpoint}?${params}`, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const notifications = await response.json();
        
        if (Array.isArray(notifications)) {
          for (const notification of notifications) {
            await this.processAPINotification(notification);
          }
        }

        await AsyncStorage.setItem(STORAGE_KEYS.LAST_NOTIFICATION_CHECK, new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to fetch notifications from API:', error);
    }
  }

  async processAPINotification(notification) {
    try {
      const history = await this.getNotificationHistory();
      
      if (history.includes(notification.id)) {
        return;
      }

      await this.sendNotification(
        notification.title || 'New Notification',
        notification.body || notification.message || '',
        notification.data || {}
      );

      await this.addToNotificationHistory(notification.id);
    } catch (error) {
      console.error('Failed to process API notification:', error);
    }
  }

  async sendNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_CONFIG, JSON.stringify(this.config));
      
      if (this.config.apiEndpoint && this.isInitialized) {
        await this.setupBackgroundTask();
      }
    } catch (error) {
      console.error('Failed to update notification config:', error);
    }
  }

  async setUserId(userId) {
    this.userId = userId;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  async getStoredConfig() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_CONFIG);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get stored notification config:', error);
      return {};
    }
  }

  async getNotificationHistory() {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  async addToNotificationHistory(notificationId) {
    try {
      const history = await this.getNotificationHistory();
      history.push(notificationId);
      
      if (history.length > 1000) {
        history.splice(0, history.length - 1000);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to add to notification history:', error);
    }
  }

  async clearHistory() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_HISTORY);
    } catch (error) {
      console.error('Failed to clear notification history:', error);
    }
  }

  getDeviceInfo() {
    return {
      deviceId: this.deviceId,
      platform: Platform.OS,
      version: Platform.Version,
      isDevice: Device.isDevice,
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion
    };
  }

  async registerDevice() {
    if (!this.config.apiEndpoint) {
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...this.config.headers
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      await fetch(`${this.config.apiEndpoint}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          deviceId: this.deviceId,
          userId: this.userId,
          deviceInfo: this.getDeviceInfo(),
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  }

  async checkForNotifications() {
    if (this.isInitialized && this.config.apiEndpoint) {
      await this.fetchNotificationsFromAPI();
    }
  }
}

export default new NotificationService();