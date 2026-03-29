import { useEffect } from 'react';
import { View, Pressable, Alert, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Checkbox } from '../ui/Checkbox';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import { useTasksStore } from '../../stores/tasksStore';
import type { Task, Subject } from '../../types';

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  subject?: Subject;
};

export function TaskItem({ task, onToggle, onDelete, subject }: Props) {
  const updateTask = useTasksStore((s) => s.updateTask);
  const strikeWidth = useSharedValue(task.is_done ? 1 : 0);

  useEffect(() => {
    strikeWidth.value = withTiming(task.is_done ? 1 : 0, { duration: 300 });
  }, [task.is_done]);

  const strikeStyle = useAnimatedStyle(() => ({
    width: `${strikeWidth.value * 100}%`,
  }));

  const handleEditTitle = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Modifier la tâche',
        '',
        (newTitle) => {
          if (newTitle && newTitle.trim()) {
            updateTask(task.id, { title: newTitle.trim() });
          }
        },
        'plain-text',
        task.title,
      );
    } else {
      // Android fallback — use Alert with info
      Alert.alert('Modifier la tâche', 'Utilisez le menu (appui long) pour modifier cette tâche.');
    }
  };

  const handleEditDueDate = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Changer la date',
        'Format : AAAA-MM-JJ HH:MM',
        (newDate) => {
          if (newDate && newDate.trim()) {
            const parsed = new Date(newDate.trim().replace(' ', 'T'));
            if (!isNaN(parsed.getTime())) {
              updateTask(task.id, { due_date: parsed.toISOString() });
            } else {
              Alert.alert('Erreur', 'Format de date invalide.');
            }
          }
        },
        'plain-text',
        task.due_date
          ? new Date(task.due_date).toISOString().slice(0, 16).replace('T', ' ')
          : '',
      );
    }
  };

  const handleLongPress = () => {
    Alert.alert(
      task.title,
      '',
      [
        {
          text: 'Modifier',
          onPress: handleEditTitle,
        },
        {
          text: 'Changer la date',
          onPress: handleEditDueDate,
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Supprimer la tâche',
              `Supprimer "${task.title}" ?`,
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(task.id) },
              ],
            );
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ],
    );
  };

  const dueColor = task.is_done ? colors.inkGhost : colors.blue;

  return (
    <Pressable
      onLongPress={handleLongPress}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E8E0',
      }}
    >
      <Checkbox checked={task.is_done} onToggle={() => onToggle(task.id)} />

      <Pressable onPress={handleEditTitle} style={{ flex: 1 }}>
        <View style={{ position: 'relative', justifyContent: 'center' }}>
          <KText
            preset="taskText"
            color={task.is_done ? colors.inkGhost : colors.ink}
            numberOfLines={1}
          >
            {task.title}
          </KText>
          <Animated.View
            style={[
              strikeStyle,
              {
                position: 'absolute',
                top: '50%',
                left: 0,
                height: 1,
                backgroundColor: colors.inkMuted,
              },
            ]}
          />
        </View>
        {task.due_date && (
          <KText
            style={{
              fontFamily: 'DMSans_300Light',
              fontSize: 9,
              color: task.is_done ? colors.inkGhost : colors.blue,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginTop: 4,
            }}
          >
            {task.is_done && task.done_at
              ? `Termine a ${new Date(task.done_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
              : new Date(task.due_date).toLocaleDateString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
          </KText>
        )}
      </Pressable>

      {subject && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: subject.color,
            marginTop: 4,
          }}
        />
      )}
    </Pressable>
  );
}
