
export function showNotification(message: string) {
  console.log(message);
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('StudyMate Pro', { body: message, icon: '/favicon.ico' });
  }
  if (typeof window !== 'undefined' && (window as any).toast) {
    (window as any).toast({ title: 'StudyMate Pro', description: message });
  }
}
