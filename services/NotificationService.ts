import { NotificationType } from '../types';

// Simple notification sound (Beep) - simplified base64 for MVP
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT1dXRXF1ZW5jZQA0AAAAREJjZABAAABAAAAAAAAAAAAAAP//AAAAAAAAAAAAAP//AAAAAAAAAAAAAP//AAAAAAAAAAAAAAAA//8AAAAAAAAAAAAA//8AAAAAAAAAAAAA//8AA';

export const NotificationService = {
  
  /**
   * Request permission to show notifications
   */
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  /**
   * Send a notification
   */
  send: (title: string, body: string, type: NotificationType = 'habit') => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Play sound
    try {
      // In a real app, use a real audio file path
      // const audio = new Audio('/sounds/notification.mp3'); 
      // audio.play().catch(e => console.log('Audio play blocked', e));
    } catch (e) {
      console.error('Error playing sound', e);
    }

    const options: any = {
      body,
      icon: '/vite.svg', // Fallback icon
      badge: '/vite.svg',
      tag: type, // Group notifications by type
      renotify: true, // Alert again even if same tag is active
      requireInteraction: type === 'summary', // Keep summary open until clicked
    };

    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Handle navigation logic if needed via window location or messaging
    };
  },

  /**
   * Send Achievement Notification
   */
  sendAchievement: (title: string, message: string) => {
    NotificationService.send(`🏆 ${title}`, message, 'achievement');
  },

  /**
   * Send Streak Alert
   */
  sendStreakAlert: (habitName: string, streak: number) => {
    NotificationService.send(
      '🔥 Streak at Risk!', 
      `Don't break your ${streak}-day streak for ${habitName}! Complete it before the day ends.`,
      'streak'
    );
  }
};