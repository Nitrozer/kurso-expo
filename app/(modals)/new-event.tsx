import { useState, useEffect } from 'react';
import { View, TextInput, Pressable, ScrollView, Switch, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

const RECURRENCE_OPTIONS = [
  { key: 'none', label: 'Aucune' },
  { key: 'daily', label: 'Quotidien' },
  { key: 'weekly', label: 'Hebdomadaire' },
];

export default function NewEventModal() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const isEditMode = !!eventId;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [isExam, setIsExam] = useState(false);
  const [examNotes, setExamNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addEvent = useScheduleStore((s) => s.addEvent);
  const updateEvent = useScheduleStore((s) => s.updateEvent);
  const events = useScheduleStore((s) => s.events);
  const subjects = useSubjectsStore((s) => s.subjects);
  const session = useAuthStore((s) => s.session);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditMode && eventId) {
      const existingEvent = events.find((e) => e.id === eventId);
      if (existingEvent) {
        setTitle(existingEvent.title);
        setLocation(existingEvent.location ?? '');
        setSelectedSubject(existingEvent.subject_id);
        const startDate = new Date(existingEvent.start_time);
        const endDate = new Date(existingEvent.end_time);
        setDate(existingEvent.start_time.split('T')[0]);
        setStartTime(
          `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
        );
        setEndTime(
          `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
        );
        if (existingEvent.recurrence_rule === 'FREQ=DAILY') {
          setRecurrence('daily');
        } else if (existingEvent.recurrence_rule === 'FREQ=WEEKLY') {
          setRecurrence('weekly');
        } else {
          setRecurrence('none');
        }
      }
    }
  }, [isEditMode, eventId]);

  const handleSave = async () => {
    const userId = session?.user?.id;
    if (!userId || !title.trim() || !date.trim() || !startTime.trim() || !endTime.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsLoading(true);
    try {
      const startISO = `${date}T${startTime}:00`;
      const endISO = `${date}T${endTime}:00`;

      const recurrenceRule = recurrence === 'daily'
        ? 'FREQ=DAILY'
        : recurrence === 'weekly'
        ? 'FREQ=WEEKLY'
        : null;

      if (isEditMode && eventId) {
        // Update existing event
        await updateEvent(eventId, {
          subject_id: selectedSubject,
          title: title.trim(),
          location: location.trim() || null,
          start_time: startISO,
          end_time: endISO,
          recurrence_rule: recurrenceRule,
          recurrence_end: null,
        });
      } else if (isExam) {
        // Save to exams table
        await supabase.from('exams').insert({
          user_id: userId,
          subject_id: selectedSubject,
          title: title.trim(),
          exam_date: startISO,
          location: location.trim() || null,
          notes: examNotes.trim() || null,
        });
      } else {
        // Save as schedule event
        await addEvent({
          user_id: userId,
          subject_id: selectedSubject,
          title: title.trim(),
          location: location.trim() || null,
          start_time: startISO,
          end_time: endISO,
          recurrence_rule: recurrenceRule,
          recurrence_end: null,
        });
      }

      router.back();
    } catch {
      Alert.alert('Erreur', "Impossible de creer l'evenement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-parchment p-xxl" showsVerticalScrollIndicator={false}>
      <KText preset="sectionTitle" color={colors.ink} style={{ marginBottom: 20 }}>
        {isEditMode ? 'Modifier l\'événement' : 'Nouvel evenement'}
      </KText>

      {/* Title */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Titre"
        placeholderTextColor={colors.inkDim}
        style={inputStyle}
      />

      {/* Location */}
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Lieu (optionnel)"
        placeholderTextColor={colors.inkDim}
        style={inputStyle}
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
          style={chipStyle(!selectedSubject)}
        >
          <KText preset="calDay" color={!selectedSubject ? colors.darkText : colors.ink}>
            Aucune
          </KText>
        </Pressable>
        {subjects.map((s) => {
          const active = selectedSubject === s.id;
          return (
            <Pressable key={s.id} onPress={() => setSelectedSubject(s.id)} style={chipStyle(active)}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s.color }} />
              <KText preset="calDay" color={active ? colors.darkText : colors.ink}>
                {s.short_name || s.name}
              </KText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Date */}
      <KText preset="calHeader" color={colors.inkGhost} style={{ marginBottom: 8 }}>
        DATE
      </KText>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="AAAA-MM-JJ"
        placeholderTextColor={colors.inkDim}
        style={inputStyle}
      />

      {/* Time inputs */}
      <View className="flex-row gap-sm mb-lg">
        <View style={{ flex: 1 }}>
          <KText preset="calHeader" color={colors.inkGhost} style={{ marginBottom: 8 }}>
            DEBUT
          </KText>
          <TextInput
            value={startTime}
            onChangeText={setStartTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.inkDim}
            style={inputStyle}
          />
        </View>
        <View style={{ flex: 1 }}>
          <KText preset="calHeader" color={colors.inkGhost} style={{ marginBottom: 8 }}>
            FIN
          </KText>
          <TextInput
            value={endTime}
            onChangeText={setEndTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.inkDim}
            style={inputStyle}
          />
        </View>
      </View>

      {/* Recurrence */}
      <KText preset="calHeader" color={colors.inkGhost} style={{ marginBottom: 8 }}>
        RECURRENCE
      </KText>
      <View className="flex-row gap-sm mb-lg">
        {RECURRENCE_OPTIONS.map(({ key, label }) => {
          const active = recurrence === key;
          return (
            <Pressable key={key} onPress={() => setRecurrence(key)} style={chipStyle(active)}>
              <KText preset="calDay" color={active ? colors.darkText : colors.ink}>
                {label}
              </KText>
            </Pressable>
          );
        })}
      </View>

      {/* Exam toggle — only show in create mode */}
      {!isEditMode && (
        <View className="flex-row items-center justify-between mb-lg">
          <KText preset="taskText" color={colors.ink}>
            Examen
          </KText>
          <Switch
            value={isExam}
            onValueChange={setIsExam}
            trackColor={{ false: colors.border, true: colors.blue }}
            thumbColor={colors.darkText}
          />
        </View>
      )}

      {/* Exam notes (conditional) */}
      {isExam && !isEditMode && (
        <TextInput
          value={examNotes}
          onChangeText={setExamNotes}
          placeholder="Notes pour l'examen (optionnel)"
          placeholderTextColor={colors.inkDim}
          multiline
          numberOfLines={3}
          style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
        />
      )}

      {/* Save button */}
      <Pressable
        onPress={handleSave}
        disabled={isLoading}
        style={{
          backgroundColor: colors.dark,
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        <KText preset="taskText" color={colors.darkText}>
          {isLoading
            ? (isEditMode ? 'Enregistrement...' : 'Creation...')
            : (isEditMode ? 'Enregistrer' : 'Creer')}
        </KText>
      </Pressable>

      {/* Cancel */}
      <Pressable onPress={() => router.back()} style={{ marginTop: 12, alignItems: 'center', paddingBottom: 40 }}>
        <KText preset="sectionAction" color={colors.inkMuted}>
          Annuler
        </KText>
      </Pressable>
    </ScrollView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontFamily: fonts.sans.regular,
  fontSize: 13,
  color: colors.ink,
  marginBottom: 16,
};

const chipStyle = (active: boolean) => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 6,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: active ? colors.dark : colors.border,
  backgroundColor: active ? colors.dark : 'transparent',
});
