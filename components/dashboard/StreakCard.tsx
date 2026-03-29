import { View, Text } from 'react-native';
import { useGamificationStore } from '../../stores/gamificationStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

export function StreakCard() {
  const streak = useGamificationStore((s) => s.streak);
  const todayXP = useGamificationStore((s) => s.todayXP);
  const dailyGoal = useGamificationStore((s) => s.dailyGoal);
  const badges = useGamificationStore((s) => s.badges);

  const progress = Math.min(1, todayXP / dailyGoal);
  const hasStreakBadge = streak.current_streak >= 7;

  return (
    <View
      style={{
        marginHorizontal: 28,
        marginBottom: 16,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        borderRadius: 14,
        padding: 20,
        overflow: 'hidden',
      }}
    >
      {/* Ghost number in background */}
      <Text
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          fontSize: 96,
          fontFamily: fonts.serif.black,
          color: colors.ink,
          opacity: 0.05,
          lineHeight: 96,
        }}
      >
        {streak.current_streak}
      </Text>

      {/* Streak display */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', zIndex: 10 }}>
        <Text style={{ fontSize: 20, marginRight: 4 }}>
          {'\uD83D\uDD25'}
        </Text>
        <Text
          style={{
            fontFamily: fonts.serif.black,
            fontSize: 38,
            lineHeight: 38,
            letterSpacing: -1.9,
            color: colors.ink,
          }}
        >
          {streak.current_streak}
        </Text>
        <Text
          style={{
            fontFamily: fonts.serif.lightItalic,
            fontSize: 20,
            color: colors.blue,
            marginLeft: 4,
          }}
        >
          jours
        </Text>
        {hasStreakBadge && (
          <View
            style={{
              marginLeft: 8,
              backgroundColor: colors.blueBg,
              borderWidth: 1,
              borderColor: colors.blueBorder,
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.sans.medium,
                fontSize: 8,
                letterSpacing: 0.96,
                textTransform: 'uppercase',
                color: colors.blue,
              }}
            >
              {streak.current_streak >= 100 ? '100j' : streak.current_streak >= 30 ? '30j' : '7j'}
            </Text>
          </View>
        )}
      </View>

      {/* XP Progress bar */}
      <View style={{ marginTop: 14, zIndex: 10 }}>
        <View
          style={{
            height: 2,
            backgroundColor: colors.borderSoft,
            borderRadius: 1,
          }}
        >
          <View
            style={{
              height: 2,
              backgroundColor: colors.ink,
              borderRadius: 1,
              width: `${Math.round(progress * 100)}%`,
            }}
          >
            {progress > 0 && (
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.blue,
                  transform: [{ translateY: -3 }, { translateX: 3 }],
                }}
              />
            )}
          </View>
        </View>
      </View>

      {/* XP text */}
      <Text
        style={{
          fontFamily: fonts.sans.light,
          fontSize: 9.5,
          color: colors.inkSoft,
          marginTop: 8,
          zIndex: 10,
        }}
      >
        {todayXP} XP aujourd'hui
      </Text>
    </View>
  );
}
