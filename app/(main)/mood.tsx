import { View, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useMoodStore } from '../../stores/moodStore';
import { useAuthStore } from '../../stores/authStore';
import { MoodPicker } from '../../components/mood/MoodPicker';
import { MoodHeatmap } from '../../components/mood/MoodHeatmap';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import type { MoodEntry } from '../../types';

export default function MoodScreen() {
  const { moods, fetchMoodsByMonth, addMood, getTodayMood } = useMoodStore();
  const session = useAuthStore((s) => s.session);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchMoodsByMonth(session.user.id, currentYear, currentMonth);
      getTodayMood(session.user.id).then(setTodayMood);
    }
  }, [session, currentMonth, currentYear]);

  const handleSave = async () => {
    if (!selectedMood || !session?.user) return;
    const today = new Date().toISOString().split('T')[0];
    await addMood({
      user_id: session.user.id,
      mood: selectedMood,
      note: note.trim() || null,
      entry_date: today,
    });
    setTodayMood({ id: '', user_id: session.user.id, mood: selectedMood, note: note.trim() || null, entry_date: today, created_at: '' });
    setSelectedMood(null);
    setNote('');
    fetchMoodsByMonth(session.user.id, currentYear, currentMonth);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <ScrollView className="flex-1 bg-parchment p-xxl" showsVerticalScrollIndicator={false}>
      <KText preset="heroName" color={colors.ink} style={{ marginBottom: 20 }}>
        Humeur
      </KText>

      {!todayMood ? (
        <View className="mb-xxl">
          <KText preset="sectionTitle" color={colors.ink} style={{ marginBottom: 12 }}>
            Comment vas-tu aujourd'hui ?
          </KText>
          <MoodPicker
            selectedMood={selectedMood}
            note={note}
            onMoodSelect={setSelectedMood}
            onNoteChange={setNote}
            onSave={handleSave}
          />
        </View>
      ) : (
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            padding: 16,
            marginBottom: 24,
            alignItems: 'center',
          }}
        >
          <KText style={{ fontSize: 32, marginBottom: 4 }}>{todayMood.mood}</KText>
          <KText style={{ fontFamily: fonts.sans.light, fontSize: 11, color: colors.inkSoft }}>
            Humeur du jour enregistrée
          </KText>
          {todayMood.note ? (
            <KText style={{ fontFamily: fonts.sans.regular, fontSize: 12, color: colors.ink, marginTop: 6, textAlign: 'center' }}>
              {todayMood.note}
            </KText>
          ) : null}
        </View>
      )}

      <MoodHeatmap
        moods={moods}
        month={currentMonth}
        year={currentYear}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
    </ScrollView>
  );
}
