import { View, Pressable } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useAudioRecorder, AudioModule, RecordingPresets, useAudioPlayer } from 'expo-audio';
import { Mic, Square, Play, Pause, X } from 'lucide-react-native';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

type RecordingState = 'idle' | 'recording' | 'uploading' | 'done';

type Props = {
  pageId: string;
  onClose: () => void;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function VoiceRecorder({ pageId, onClose }: Props) {
  const session = useAuthStore((s) => s.session);
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(audioUri ?? '');

  const pulseScale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) return;

      // Enable recording mode on iOS before starting — required by expo-audio
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      recorder.record();
      setState('recording');
      setDuration(0);

      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 600 }),
        -1,
        true
      );

      intervalRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      cancelAnimation(pulseScale);
      pulseScale.value = 1;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      recorder.stop();
      const uri = recorder.uri;

      if (uri) {
        setAudioUri(uri);
        setState('uploading');
        await uploadAudio(uri);
        setState('done');
      } else {
        setState('idle');
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setState('idle');
    }
  };

  const uploadAudio = async (uri: string) => {
    if (!session?.user) return;
    try {
      const fileName = `voice_${Date.now()}.m4a`;
      const filePath = `${session.user.id}/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(filePath, blob, { contentType: 'audio/m4a' });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('voice-notes')
        .getPublicUrl(filePath);

      await supabase.from('voice_notes').insert({
        user_id: session.user.id,
        notebook_page_id: pageId,
        audio_url: urlData.publicUrl,
        duration_seconds: duration,
      });
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const togglePlayback = () => {
    if (!audioUri) return;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 70,
        left: 20,
        right: 20,
        backgroundColor: colors.bg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Pressable
        onPress={onClose}
        style={{ position: 'absolute', top: 8, right: 8 }}
      >
        <X size={16} strokeWidth={1.6} color={colors.inkMuted} />
      </Pressable>

      {state === 'idle' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <KText preset="courseDetail" color={colors.inkSoft}>
            Appuyez pour enregistrer
          </KText>
          <Pressable
            onPress={startRecording}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#C04040',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mic size={20} strokeWidth={1.6} color={colors.darkText} />
          </Pressable>
        </View>
      )}

      {state === 'recording' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
          <Animated.View
            style={[
              {
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#C04040',
              },
              pulseStyle,
            ]}
          />
          <KText preset="timeHour" color={colors.ink}>
            {formatDuration(duration)}
          </KText>
          <Pressable
            onPress={stopRecording}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.dark,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Square size={16} strokeWidth={1.6} color={colors.bg} />
          </Pressable>
        </View>
      )}

      {state === 'uploading' && (
        <KText preset="courseDetail" color={colors.inkSoft}>
          Enregistrement en cours...
        </KText>
      )}

      {state === 'done' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <Pressable
            onPress={togglePlayback}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.dark,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPlaying ? (
              <Pause size={16} strokeWidth={1.6} color={colors.bg} />
            ) : (
              <Play size={16} strokeWidth={1.6} color={colors.bg} />
            )}
          </Pressable>
          <KText preset="courseDetail" color={colors.ink}>
            {formatDuration(duration)}
          </KText>
          <KText preset="notePreview" color={colors.inkMuted}>
            Enregistré
          </KText>
        </View>
      )}
    </View>
  );
}
