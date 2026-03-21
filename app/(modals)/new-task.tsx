import { useState } from 'react';
import { View, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useTasksStore } from '../../stores/tasksStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useAuthStore } from '../../stores/authStore';

export default function NewTaskModal() {
  const [title, setTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addTask = useTasksStore((s) => s.addTask);
  const subjects = useSubjectsStore((s) => s.subjects);
  const session = useAuthStore((s) => s.session);

  const handleSave = async () => {
    const userId = session?.user?.id;
    if (!userId || !title.trim()) return;

    setIsLoading(true);
    try {
      await addTask({
        user_id: userId,
        title: title.trim(),
        subject_id: selectedSubject,
        due_date: dueDate.trim() || null,
      });
      router.back();
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-parchment p-xxl">
      <KText preset="sectionTitle" color={colors.ink} style={{ marginBottom: 20 }}>
        Nouvelle tache
      </KText>

      {/* Title input */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Titre de la tache"
        placeholderTextColor={colors.inkDim}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontFamily: fonts.sans.regular,
          fontSize: 13,
          color: colors.ink,
          marginBottom: 16,
        }}
      />

      {/* Subject picker */}
      <KText preset="calHeader" color={colors.inkGhost} style={{ marginBottom: 8 }}>
        MATIERE
      </KText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        <Pressable
          onPress={() => setSelectedSubject(null)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: !selectedSubject ? colors.dark : colors.border,
            backgroundColor: !selectedSubject ? colors.dark : 'transparent',
          }}
        >
          <KText preset="calDay" color={!selectedSubject ? colors.darkText : colors.ink}>
            Aucune
          </KText>
        </Pressable>
        {subjects.map((s) => {
          const active = selectedSubject === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setSelectedSubject(s.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: active ? colors.dark : colors.border,
                backgroundColor: active ? colors.dark : 'transparent',
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: s.color,
                }}
              />
              <KText preset="calDay" color={active ? colors.darkText : colors.ink}>
                {s.short_name || s.name}
              </KText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Due date */}
      <KText preset="calHeader" color={colors.inkGhost} style={{ marginBottom: 8 }}>
        DATE LIMITE
      </KText>
      <TextInput
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="AAAA-MM-JJ"
        placeholderTextColor={colors.inkDim}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontFamily: fonts.sans.regular,
          fontSize: 13,
          color: colors.ink,
          marginBottom: 24,
        }}
      />

      {/* Save button */}
      <Pressable
        onPress={handleSave}
        disabled={isLoading || !title.trim()}
        style={{
          backgroundColor: colors.dark,
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: isLoading || !title.trim() ? 0.5 : 1,
        }}
      >
        <KText preset="taskText" color={colors.darkText}>
          {isLoading ? 'Creation...' : 'Creer'}
        </KText>
      </Pressable>

      {/* Cancel */}
      <Pressable onPress={() => router.back()} style={{ marginTop: 12, alignItems: 'center' }}>
        <KText preset="sectionAction" color={colors.inkMuted}>
          Annuler
        </KText>
      </Pressable>
    </View>
  );
}
