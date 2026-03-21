import { useState, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { TaskItem } from './TaskItem';
import { SectionDivider } from '../ui/SectionDivider';
import { KText } from '../ui/Text';
import { useTasksStore } from '../../stores/tasksStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { colors } from '../../theme/colors';
import type { Task } from '../../types';

type Props = {
  tasks: Task[];
};

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isThisWeek(date: Date, today: Date) {
  const weekStart = new Date(today);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return date >= weekStart && date <= weekEnd;
}

export function TaskList({ tasks }: Props) {
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const subjects = useSubjectsStore((s) => s.subjects);
  const [doneExpanded, setDoneExpanded] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sections = useMemo(() => {
    const todayTasks: Task[] = [];
    const weekTasks: Task[] = [];
    const laterTasks: Task[] = [];
    const doneTasks: Task[] = [];

    tasks.forEach((t) => {
      if (t.is_done) {
        doneTasks.push(t);
        return;
      }

      if (!t.due_date) {
        laterTasks.push(t);
        return;
      }

      const due = new Date(t.due_date);
      due.setHours(0, 0, 0, 0);

      if (isSameDay(due, today)) {
        todayTasks.push(t);
      } else if (isThisWeek(due, today)) {
        weekTasks.push(t);
      } else {
        laterTasks.push(t);
      }
    });

    return { todayTasks, weekTasks, laterTasks, doneTasks };
  }, [tasks]);

  const getSubject = (subjectId: string | null) =>
    subjectId ? subjects.find((s) => s.id === subjectId) : undefined;

  const renderSection = (title: string, sectionTasks: Task[]) => {
    if (sectionTasks.length === 0) return null;
    return (
      <View className="mb-lg">
        <SectionDivider title={title} />
        {sectionTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggleTask}
            onDelete={deleteTask}
            subject={getSubject(task.subject_id)}
          />
        ))}
      </View>
    );
  };

  return (
    <View>
      {renderSection("Aujourd'hui", sections.todayTasks)}
      {renderSection('Cette semaine', sections.weekTasks)}
      {renderSection('Plus tard', sections.laterTasks)}

      {/* Done section - collapsed by default */}
      {sections.doneTasks.length > 0 && (
        <View className="mb-lg">
          <Pressable
            onPress={() => setDoneExpanded(!doneExpanded)}
            className="flex-row items-center gap-sm my-lg"
          >
            <KText preset="sectionTitle" color={colors.inkMuted}>
              Terminees
            </KText>
            <View className="flex-1 h-[1px] bg-border" />
            {doneExpanded ? (
              <ChevronDown size={14} strokeWidth={1.6} color={colors.inkMuted} />
            ) : (
              <ChevronRight size={14} strokeWidth={1.6} color={colors.inkMuted} />
            )}
            <KText preset="sectionAction" color={colors.inkMuted}>
              {sections.doneTasks.length}
            </KText>
          </Pressable>
          {doneExpanded &&
            sections.doneTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                subject={getSubject(task.subject_id)}
              />
            ))}
        </View>
      )}
    </View>
  );
}
