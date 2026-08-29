import { View, Text } from 'react-native';
import { useColors } from '../../theme/useColors';
import type { ScheduleEvent } from '../../types';

type Props = {
  events: ScheduleEvent[];
};

export function UpcomingEvents({ events }: Props) {
  const colors = useColors();
  if (events.length === 0) return null;

  return (
    <View style={{ marginTop: 48 }}>
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: colors.ink, marginBottom: 24 }}>
        A venir
      </Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {events.slice(0, 3).map((event) => {
          const date = new Date(event.start_time);
          const day = date.getDate();
          const isImportant = event.title.toLowerCase().includes('rendu') || event.title.toLowerCase().includes('examen');

          return (
            <View
              key={event.id}
              style={{
                flex: 1,
                padding: 24,
                backgroundColor: colors.surfaceBright,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isImportant ? colors.alertRedBg : colors.blueBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Fraunces_300Light_Italic', fontSize: 20, color: isImportant ? colors.alertRed : colors.blue }}>
                  {day}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 14, color: colors.ink, marginBottom: 4 }}>
                  {event.title}
                </Text>
                <Text style={{ fontFamily: 'DMSans_300Light', fontSize: 12, color: colors.inkBody, marginBottom: 12 }}>
                  {event.location
                    ? `${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — ${event.location}`
                    : `Echeance : ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                </Text>
                <View
                  style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 2,
                    backgroundColor: isImportant ? colors.alertRedBg : colors.blueBg,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'DMSans_500Medium',
                      fontSize: 10,
                      color: isImportant ? colors.alertRed : colors.blue,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {isImportant ? 'Important' : 'Seminaire'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
