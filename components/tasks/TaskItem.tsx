import { useEffect } from 'react';
import { View, Pressable, Alert } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Checkbox } from '../ui/Checkbox';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import type { Task, Subject } from '../../types';

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  subject?: Subject;
};

export function TaskItem({ task, onToggle, onDelete, subject }: Props) {
  const strikeWidth = useSharedValue(task.is_done ? 1 : 0);

  useEffect(() => {
    strikeWidth.value = withTiming(task.is_done ? 1 : 0, { duration: 300 });
  }, [task.is_done]);

  const strikeStyle = useAnimatedStyle(() => ({
    width: `${strikeWidth.value * 100}%`,
  }));

  const handleLongPress = () => {
    Alert.alert(
      'Supprimer la tache',
      `Supprimer "${task.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(task.id) },
      ],
    );
  };

  const dueColor = task.is_done ? colors.inkGhost : colors.blue;

  return (
    <Pressable onLongPress={handleLongPress} className="flex-row items-center gap-sm py-sm">
      <Checkbox checked={task.is_done} onToggle={() => onToggle(task.id)} />

      <View style={{ flex: 1, position: 'relative', justifyContent: 'center' }}>
        <KText
          preset="taskText"
          color={task.is_done ? colors.inkMuted : colors.ink}
          numberOfLines={1}
        >
          {task.title}
        </KText>
        {/* Animated strikethrough line */}
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

      {subject && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: subject.color,
          }}
        />
      )}

      {task.due_date && (
        <KText preset="taskDue" color={dueColor}>
          {new Date(task.due_date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          })}
        </KText>
      )}
    </Pressable>
  );
}
