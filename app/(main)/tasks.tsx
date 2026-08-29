import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useEffect } from 'react';
import { Plus } from 'lucide-react-native';
import { TaskList } from '../../components/tasks/TaskList';
import { useTasksStore } from '../../stores/tasksStore';
import { useAuthStore } from '../../stores/authStore';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';

export default function TasksScreen() {
  const { tasks, fetchTasks, addTask } = useTasksStore();
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    if (session?.user) fetchTasks(session.user.id);
  }, [session]);

  const nickname = profile?.nickname ?? profile?.full_name ?? 'Student';
  const undoneTasks = tasks.filter((t) => !t.is_done);

  const handleAddTask = async () => {
    if (!session?.user) return;
    try {
      await addTask({
        user_id: session.user.id,
        title: 'Nouvelle tache',
        due_date: null,
        subject_id: null,
      });
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  return (
    <View className="flex-1 bg-parchment">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 28, paddingBottom: 120 }}>
        <View style={{ marginBottom: 32 }}>
          <KText preset="heroName" color={colors.ink} style={{ fontSize: 30, lineHeight: 36 }}>
            Bonjour, {nickname}.
          </KText>
          <KText style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#5F5E5E', marginTop: 8, letterSpacing: 0.3 }}>
            Vous avez {undoneTasks.length} tache{undoneTasks.length > 1 ? 's' : ''} prioritaire{undoneTasks.length > 1 ? 's' : ''} aujourd'hui.
          </KText>
        </View>

        <TaskList tasks={tasks} />
      </ScrollView>

      <Pressable
        onPress={handleAddTask}
        style={{
          position: 'absolute',
          bottom: 96,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.blue,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={22} strokeWidth={1.8} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
