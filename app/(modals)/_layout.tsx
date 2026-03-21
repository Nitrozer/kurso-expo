import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="new-task" />
      <Stack.Screen name="new-event" />
      <Stack.Screen name="import-ics" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
