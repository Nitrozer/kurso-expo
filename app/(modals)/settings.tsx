import { useState } from 'react';
import { View, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { X, Pencil, Trash2, Plus } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useAuthStore } from '../../stores/authStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useNotesStore } from '../../stores/notesStore';
import { useNotebooksStore } from '../../stores/notebooksStore';
import { useExamsStore } from '../../stores/examsStore';
import { updateProfile, signOut } from '../../lib/auth';
import type { Subject } from '../../types';

const PRESET_COLORS = ['#3D5AFE', '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#795548', '#607D8B'];

type SubjectForm = {
  name: string;
  short_name: string;
  professor: string;
  color: string;
};

const emptySubjectForm: SubjectForm = { name: '', short_name: '', professor: '', color: PRESET_COLORS[0] };

export default function SettingsModal() {
  const { session, profile, setProfile } = useAuthStore();
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjectsStore();

  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [avatarLetter, setAvatarLetter] = useState(profile?.avatar_letter ?? '');

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState<SubjectForm>(emptySubjectForm);

  const [examReminders, setExamReminders] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);

  const userId = session?.user?.id;

  const handleSaveProfile = async () => {
    if (!userId) return;
    try {
      const updated = await updateProfile(userId, {
        nickname: nickname || undefined,
        avatar_letter: avatarLetter.toUpperCase() || undefined,
      });
      setProfile(updated);
      Alert.alert('Profil mis à jour');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const handleDeleteSubject = (id: string, name: string) => {
    Alert.alert('Supprimer', `Supprimer la matière "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteSubject(id) },
    ]);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setSubjectForm({
      name: subject.name,
      short_name: subject.short_name ?? '',
      professor: subject.professor ?? '',
      color: subject.color,
    });
    setShowAddSubject(false);
  };

  const handleSaveSubject = async () => {
    if (!subjectForm.name.trim() || !userId) return;
    if (editingSubjectId) {
      await updateSubject(editingSubjectId, {
        name: subjectForm.name.trim(),
        short_name: subjectForm.short_name.trim() || null,
        professor: subjectForm.professor.trim() || null,
        color: subjectForm.color,
      });
      setEditingSubjectId(null);
    } else {
      await addSubject({
        user_id: userId,
        name: subjectForm.name.trim(),
        short_name: subjectForm.short_name.trim() || null,
        professor: subjectForm.professor.trim() || null,
        color: subjectForm.color,
        icon: null,
        coefficient: null,
      });
      setShowAddSubject(false);
    }
    setSubjectForm(emptySubjectForm);
  };

  const handleExportData = async () => {
    if (!userId) return;
    try {
      const data = {
        profile,
        subjects: useSubjectsStore.getState().subjects,
        tasks: useTasksStore.getState().tasks,
        events: useScheduleStore.getState().events,
        notes: useNotesStore.getState().notes,
        notebooks: useNotebooksStore.getState().notebooks,
        exams: useExamsStore.getState().exams,
        exportedAt: new Date().toISOString(),
      };
      const json = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + 'kurso-export.json';
      await FileSystem.writeAsStringAsync(fileUri, json);
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
    } catch {
      Alert.alert('Erreur', "Impossible d'exporter les données");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer le compte');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 }}>
        <KText preset="sectionTitle" color={colors.ink}>
          Paramètres
        </KText>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <X size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {/* 1. Profil */}
        <Section title="Profil">
          <View style={{ gap: 10 }}>
            <LabeledInput label="Surnom" value={nickname} onChangeText={setNickname} placeholder="Ton surnom" />
            <LabeledInput
              label="Lettre avatar"
              value={avatarLetter}
              onChangeText={(t) => setAvatarLetter(t.slice(0, 1).toUpperCase())}
              placeholder="A"
              maxLength={1}
            />
            <Pressable
              onPress={handleSaveProfile}
              style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 6, marginTop: 4 }}
            >
              <KText preset="sectionAction" color={colors.ink}>
                Enregistrer
              </KText>
            </Pressable>
          </View>
        </Section>

        {/* 2. Matières */}
        <Section title="Matières">
          <View style={{ gap: 8 }}>
            {subjects.map((subject) => (
              <View key={subject.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: subject.color }} />
                <KText preset="taskText" color={colors.ink} style={{ flex: 1 }}>
                  {subject.name}
                </KText>
                <Pressable onPress={() => handleEditSubject(subject)} hitSlop={8}>
                  <Pencil size={14} color={colors.inkSoft} />
                </Pressable>
                <Pressable onPress={() => handleDeleteSubject(subject.id, subject.name)} hitSlop={8}>
                  <Trash2 size={14} color={colors.inkSoft} />
                </Pressable>
              </View>
            ))}

            {(showAddSubject || editingSubjectId) && (
              <SubjectFormView form={subjectForm} setForm={setSubjectForm} onSave={handleSaveSubject} onCancel={() => { setShowAddSubject(false); setEditingSubjectId(null); setSubjectForm(emptySubjectForm); }} />
            )}

            {!showAddSubject && !editingSubjectId && (
              <Pressable
                onPress={() => { setShowAddSubject(true); setSubjectForm(emptySubjectForm); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
              >
                <Plus size={14} color={colors.blue} />
                <KText preset="sectionAction" color={colors.blue}>
                  Ajouter une matière
                </KText>
              </Pressable>
            )}
          </View>
        </Section>

        {/* 3. Notifications */}
        <Section title="Notifications">
          <View style={{ gap: 10 }}>
            <ToggleRow label="Rappels examens" value={examReminders} onToggle={() => setExamReminders(!examReminders)} />
            <ToggleRow label="Rappels devoirs" value={taskReminders} onToggle={() => setTaskReminders(!taskReminders)} />
          </View>
        </Section>

        {/* 4. Données */}
        <Section title="Données">
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={handleExportData}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' }}
            >
              <KText preset="sectionAction" color={colors.ink}>
                Exporter mes données
              </KText>
            </Pressable>
            <Pressable
              onPress={handleDeleteAccount}
              style={{ borderWidth: 1, borderColor: colors.examRed, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' }}
            >
              <KText preset="sectionAction" color={colors.examRed}>
                Supprimer mon compte
              </KText>
            </Pressable>
          </View>
        </Section>

        {/* 5. À propos */}
        <Section title="À propos">
          <View style={{ gap: 4 }}>
            <KText preset="courseDetail" color={colors.inkSoft}>
              Kurso v1.0.0
            </KText>
            <KText preset="courseDetail" color={colors.inkMuted}>
              Fait avec Kurso
            </KText>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

/* ─── Helper Components ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 16, marginTop: 16 }}>
      <KText preset="sectionTitle" color={colors.ink} style={{ marginBottom: 12 }}>
        {title}
      </KText>
      {children}
    </View>
  );
}

function LabeledInput({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 4 }}>
      <KText preset="sectionAction" color={colors.inkSoft}>
        {label}
      </KText>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 6,
          paddingHorizontal: 10,
          paddingVertical: 6,
          fontFamily: fonts.sans.regular,
          fontSize: 12,
          color: colors.ink,
        }}
        placeholderTextColor={colors.inkMuted}
        {...props}
      />
    </View>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <KText preset="taskText" color={colors.ink}>
        {label}
      </KText>
      <Pressable
        onPress={onToggle}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          borderWidth: 1,
          borderColor: value ? colors.dark : colors.border,
          backgroundColor: value ? colors.dark : 'transparent',
          justifyContent: 'center',
          paddingHorizontal: 2,
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: value ? colors.bg : colors.inkMuted,
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </Pressable>
    </View>
  );
}

function SubjectFormView({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: SubjectForm;
  setForm: (f: SubjectForm) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.borderSoft, borderRadius: 6, padding: 12, gap: 8, marginTop: 4 }}>
      <LabeledInput label="Nom" value={form.name} onChangeText={(t: string) => setForm({ ...form, name: t })} placeholder="Mathématiques" />
      <LabeledInput label="Abréviation" value={form.short_name} onChangeText={(t: string) => setForm({ ...form, short_name: t })} placeholder="MATH" />
      <LabeledInput label="Professeur" value={form.professor} onChangeText={(t: string) => setForm({ ...form, professor: t })} placeholder="M. Dupont" />

      <View style={{ gap: 4 }}>
        <KText preset="sectionAction" color={colors.inkSoft}>
          Couleur
        </KText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {PRESET_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setForm({ ...form, color: c })}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: c,
                borderWidth: form.color === c ? 2 : 0,
                borderColor: colors.ink,
              }}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
        <Pressable
          onPress={onSave}
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <KText preset="sectionAction" color={colors.ink}>
            Enregistrer
          </KText>
        </Pressable>
        <Pressable onPress={onCancel} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
          <KText preset="sectionAction" color={colors.inkMuted}>
            Annuler
          </KText>
        </Pressable>
      </View>
    </View>
  );
}
