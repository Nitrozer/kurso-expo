import { View, ScrollView, Pressable } from 'react-native';
import { useEffect, useRef } from 'react';
import { usePomodoroStore } from '../../stores/pomodoroStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useAuthStore } from '../../stores/authStore';
import { TimerCircle } from '../../components/pomodoro/TimerCircle';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { Play, Pause, Square } from 'lucide-react-native';

const DURATIONS = [15, 25, 30, 45];

export default function PomodoroScreen() {
  const {
    duration,
    remaining,
    isRunning,
    selectedSubjectId,
    sessions,
    setDuration,
    setSelectedSubjectId,
    start,
    pause,
    reset,
    tick,
    complete,
    fetchSessions,
  } = usePomodoroStore();
  const { subjects } = useSubjectsStore();
  const session = useAuthStore((s) => s.session);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (session?.user) fetchSessions(session.user.id);
  }, [session]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Auto-complete when timer reaches 0
  useEffect(() => {
    if (remaining === 0 && !isRunning && session?.user) {
      complete(session.user.id);
    }
  }, [remaining, isRunning]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView className="flex-1 bg-parchment p-xxl" showsVerticalScrollIndicator={false}>
      <KText preset="heroName" color={colors.ink} style={{ marginBottom: 24 }}>
        Pomodoro
      </KText>

      {/* Timer */}
      <TimerCircle remaining={remaining} total={duration * 60} />

      {/* Subject selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-xl mb-lg" contentContainerStyle={{ gap: 8 }}>
        <Pressable onPress={() => setSelectedSubjectId(null)}>
          <View
            style={{
              borderWidth: 1,
              borderColor: !selectedSubjectId ? colors.dark : colors.border,
              backgroundColor: !selectedSubjectId ? colors.dark : 'transparent',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
          >
            <KText style={{ fontFamily: fonts.sans.medium, fontSize: 10, color: !selectedSubjectId ? colors.darkText : colors.ink }}>
              Aucune
            </KText>
          </View>
        </Pressable>
        {subjects.map((s) => (
          <Pressable key={s.id} onPress={() => setSelectedSubjectId(s.id)}>
            <View
              style={{
                borderWidth: 1,
                borderColor: selectedSubjectId === s.id ? colors.dark : colors.border,
                backgroundColor: selectedSubjectId === s.id ? colors.dark : 'transparent',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <KText style={{ fontFamily: fonts.sans.medium, fontSize: 10, color: selectedSubjectId === s.id ? colors.darkText : colors.ink }}>
                {s.short_name ?? s.name}
              </KText>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Duration selector */}
      <View className="flex-row justify-center gap-sm mb-xl">
        {DURATIONS.map((d) => (
          <Pressable key={d} onPress={() => setDuration(d)}>
            <View
              style={{
                borderWidth: 1,
                borderColor: duration === d ? colors.dark : colors.border,
                backgroundColor: duration === d ? colors.dark : 'transparent',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <KText style={{ fontFamily: fonts.sans.medium, fontSize: 12, color: duration === d ? colors.darkText : colors.ink }}>
                {d}
              </KText>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Controls */}
      <View className="flex-row justify-center gap-lg mb-xxl">
        <Pressable onPress={isRunning ? pause : start}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isRunning ? (
              <Pause size={20} color={colors.ink} strokeWidth={1.6} />
            ) : (
              <Play size={20} color={colors.ink} strokeWidth={1.6} />
            )}
          </View>
        </Pressable>
        <Pressable onPress={reset}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Square size={18} color={colors.ink} strokeWidth={1.6} />
          </View>
        </Pressable>
      </View>

      {/* Recent sessions */}
      <KText preset="sectionTitle" color={colors.ink} style={{ marginBottom: 12 }}>
        Sessions récentes
      </KText>
      <View className="gap-sm mb-xxl">
        {sessions.map((s) => {
          const subject = s.subject_id ? subjects.find((sub) => sub.id === s.subject_id) : null;
          return (
            <View
              key={s.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <KText style={{ fontFamily: fonts.sans.regular, fontSize: 11, color: colors.ink }}>
                  {s.duration_minutes} min
                </KText>
                {subject && (
                  <KText style={{ fontFamily: fonts.sans.light, fontSize: 9.5, color: colors.inkSoft, marginTop: 1 }}>
                    {subject.name}
                  </KText>
                )}
              </View>
              <KText style={{ fontFamily: fonts.sans.light, fontSize: 9.5, color: colors.inkMuted }}>
                {formatDate(s.completed_at)}
              </KText>
            </View>
          );
        })}
        {sessions.length === 0 && (
          <KText style={{ fontFamily: fonts.sans.light, fontSize: 11, color: colors.inkSoft }}>
            Aucune session pour le moment
          </KText>
        )}
      </View>
    </ScrollView>
  );
}
