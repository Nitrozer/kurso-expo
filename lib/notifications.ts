// Notifications are disabled — requires Apple Developer Program for Push Notifications capability.
// These are no-op stubs. Re-enable when Developer Program is available.

export async function requestNotificationPermissions() {
  return false;
}

export async function scheduleExamReminder(_examTitle: string, _examDate: Date, _daysBefore: number) {
  // No-op
}

export async function scheduleTaskReminder(_taskTitle: string, _dueDate: Date) {
  // No-op
}

export async function cancelAllReminders() {
  // No-op
}
