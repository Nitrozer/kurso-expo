import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleExamReminder(examTitle: string, examDate: Date, daysBefore: number) {
  const triggerDate = new Date(examDate);
  triggerDate.setDate(triggerDate.getDate() - daysBefore);
  triggerDate.setHours(9, 0, 0, 0); // 9h du matin

  if (triggerDate <= new Date()) return; // Don't schedule past notifications

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📚 Examen dans ${daysBefore} jour${daysBefore > 1 ? 's' : ''}`,
      body: examTitle,
    },
    trigger: { date: triggerDate },
  });
}

export async function scheduleTaskReminder(taskTitle: string, dueDate: Date) {
  const triggerDate = new Date(dueDate);
  triggerDate.setDate(triggerDate.getDate() - 1);
  triggerDate.setHours(18, 0, 0, 0); // 18h la veille

  if (triggerDate <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Devoir pour demain',
      body: taskTitle,
    },
    trigger: { date: triggerDate },
  });
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
