import { View, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { TaskList } from '../../components/tasks/TaskList';
import { useTasksStore } from '../../stores/tasksStore';
import { useAuthStore } from '../../stores/authStore';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';

export default function TasksScreen() {
  const { tasks, fetchTasks } = useTasksStore();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (session?.user) fetchTasks(session.user.id);
  }, [session]);

  return (
    <ScrollView className="flex-1 bg-parchment p-xxl" showsVerticalScrollIndicator={false}>
      <KText preset="heroName" color={colors.ink} style={{ marginBottom: 20 }}>
        Taches
      </KText>
      <TaskList tasks={tasks} />
    </ScrollView>
  );
}
