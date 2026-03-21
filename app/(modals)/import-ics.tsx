import { useState } from 'react';
import { View, TextInput, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { parseICS } from '../../lib/ics-parser';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useAuthStore } from '../../stores/authStore';
import type { ScheduleEvent } from '../../types';

export default function ImportICSModal() {
  const [url, setUrl] = useState('');
  const [parsedEvents, setParsedEvents] = useState<Partial<ScheduleEvent>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addEvent = useScheduleStore((s) => s.addEvent);
  const session = useAuthStore((s) => s.session);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      // Read file content via fetch on the file URI
      const response = await fetch(asset.uri);
      const content = await response.text();
      const events = parseICS(content);
      setParsedEvents(events);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de lire le fichier.');
    }
  };

  const handleURLImport = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(url.trim());
      const content = await response.text();
      const events = parseICS(content);
      setParsedEvents(events);
    } catch (e) {
      Alert.alert('Erreur', "Impossible de recuperer le fichier depuis l'URL.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    const userId = session?.user?.id;
    if (!userId || parsedEvents.length === 0) return;

    setIsLoading(true);
    try {
      for (const evt of parsedEvents) {
        await addEvent({
          user_id: userId,
          subject_id: evt.subject_id ?? null,
          title: evt.title ?? 'Sans titre',
          location: evt.location ?? null,
          start_time: evt.start_time ?? new Date().toISOString(),
          end_time: evt.end_time ?? new Date().toISOString(),
          recurrence_rule: evt.recurrence_rule ?? null,
          recurrence_end: null,
        });
      }
      router.back();
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'importer les evenements.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-parchment p-xxl">
      <KText preset="sectionTitle" color={colors.ink} style={{ marginBottom: 20 }}>
        Importer un calendrier
      </KText>

      {/* File import */}
      <Pressable
        onPress={handleFilePick}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <KText preset="taskText" color={colors.ink}>
          Importer un fichier .ics
        </KText>
      </Pressable>

      {/* URL import */}
      <KText preset="calHeader" color={colors.inkGhost} style={{ marginBottom: 6 }}>
        OU DEPUIS UNE URL
      </KText>
      <View className="flex-row gap-sm mb-lg">
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="https://..."
          placeholderTextColor={colors.inkDim}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontFamily: fonts.sans.regular,
            fontSize: 12,
            color: colors.ink,
          }}
        />
        <Pressable
          onPress={handleURLImport}
          style={{
            borderWidth: 1,
            borderColor: colors.dark,
            borderRadius: 14,
            paddingHorizontal: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <KText preset="taskText" color={colors.ink}>
            OK
          </KText>
        </Pressable>
      </View>

      {/* Preview */}
      {parsedEvents.length > 0 && (
        <View className="mb-lg">
          <KText preset="taskText" color={colors.blue}>
            {parsedEvents.length} evenement{parsedEvents.length > 1 ? 's' : ''} trouve{parsedEvents.length > 1 ? 's' : ''}
          </KText>
        </View>
      )}

      {/* Confirm */}
      {parsedEvents.length > 0 && (
        <Pressable
          onPress={handleConfirm}
          disabled={isLoading}
          style={{
            backgroundColor: colors.dark,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <KText preset="taskText" color={colors.darkText}>
            {isLoading ? 'Importation...' : 'Confirmer'}
          </KText>
        </Pressable>
      )}

      {/* Cancel */}
      <Pressable onPress={() => router.back()} style={{ marginTop: 12, alignItems: 'center' }}>
        <KText preset="sectionAction" color={colors.inkMuted}>
          Annuler
        </KText>
      </Pressable>
    </View>
  );
}
