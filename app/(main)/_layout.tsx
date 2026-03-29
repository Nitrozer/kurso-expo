import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { ThreeColumnLayout } from '../../components/layout/ThreeColumnLayout';
import { SidebarProvider, useSidebar } from '../../components/layout/SidebarContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { useNetworkStore } from '../../lib/offline';
import { useAuthStore } from '../../stores/authStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useNotesStore } from '../../stores/notesStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useNotebooksStore } from '../../stores/notebooksStore';
import { useExamsStore } from '../../stores/examsStore';
import { useFlashcardsStore } from '../../stores/flashcardsStore';

function MainLayoutInner() {
  const content = useSidebar((s) => s.content);
  const isOnline = useNetworkStore((s) => s.isOnline);

  // Task 35: Network state listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      useNetworkStore.getState().setOnline(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // Task 34: Supabase Realtime subscriptions
  useEffect(() => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return;
    const userId = session.user.id;

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, () => {
        useTasksStore.getState().fetchTasks(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_events', filter: `user_id=eq.${userId}` }, () => {
        useScheduleStore.getState().fetchEvents(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` }, () => {
        useNotesStore.getState().fetchNotes(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notebook_pages', filter: `user_id=eq.${userId}` }, () => {
        // Refresh current notebook pages if viewing
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects', filter: `user_id=eq.${userId}` }, () => {
        useSubjectsStore.getState().fetchSubjects(userId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams', filter: `user_id=eq.${userId}` }, () => {
        useExamsStore.getState().fetchExams(userId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Task 36: Fetch all data on authenticated app load
  useEffect(() => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return;
    const userId = session.user.id;

    Promise.all([
      useSubjectsStore.getState().fetchSubjects(userId),
      useScheduleStore.getState().fetchEvents(userId),
      useTasksStore.getState().fetchTasks(userId),
      useNotesStore.getState().fetchNotes(userId),
      useNotebooksStore.getState().fetchNotebooks(userId),
      useExamsStore.getState().fetchExams(userId),
      useFlashcardsStore.getState().fetchDecks(userId),
    ]).catch(() => {
      // Silently handle initial fetch errors (e.g. offline)
    });
  }, []);

  // Task 36: TTL cache refresh (5 min interval)
  useEffect(() => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return;
    const userId = session.user.id;

    const interval = setInterval(() => {
      useScheduleStore.getState().fetchEvents(userId);
      useTasksStore.getState().fetchTasks(userId);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ThreeColumnLayout sidebar={content ? <Sidebar>{content}</Sidebar> : undefined}>
      {!isOnline && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceAlt, paddingVertical: 4, paddingHorizontal: 16 }}>
          <WifiOff size={12} color={colors.inkSoft} />
          <KText style={{ fontFamily: 'DMSans_500Medium', fontSize: 9, color: colors.inkSoft }}>
            Hors ligne
          </KText>
        </View>
      )}
      <Slot />
    </ThreeColumnLayout>
  );
}

export default function MainLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <SidebarProvider>
        <MainLayoutInner />
      </SidebarProvider>
    </SafeAreaView>
  );
}
