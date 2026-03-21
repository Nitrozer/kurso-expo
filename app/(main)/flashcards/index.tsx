import { View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { useFlashcardsStore } from '../../../stores/flashcardsStore';
import { useSubjectsStore } from '../../../stores/subjectsStore';
import { useAuthStore } from '../../../stores/authStore';
import { DeckCard } from '../../../components/flashcards/DeckCard';
import { KText } from '../../../components/ui/Text';
import { colors } from '../../../theme/colors';
import { fonts } from '../../../theme/typography';
import { Plus } from 'lucide-react-native';

export default function FlashcardsScreen() {
  const { decks, cards, fetchDecks, addDeck } = useFlashcardsStore();
  const { subjects } = useSubjectsStore();
  const session = useAuthStore((s) => s.session);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (session?.user) fetchDecks(session.user.id);
  }, [session]);

  const handleAddDeck = async () => {
    if (!newDeckTitle.trim() || !session?.user) return;
    await addDeck({ user_id: session.user.id, subject_id: null, title: newDeckTitle.trim() });
    setNewDeckTitle('');
    setShowInput(false);
  };

  return (
    <ScrollView className="flex-1 bg-parchment p-xxl" showsVerticalScrollIndicator={false}>
      <KText preset="heroName" color={colors.ink} style={{ marginBottom: 20 }}>
        Flashcards
      </KText>

      {showInput && (
        <View className="flex-row items-center gap-sm mb-lg">
          <TextInput
            value={newDeckTitle}
            onChangeText={setNewDeckTitle}
            placeholder="Nom du deck..."
            placeholderTextColor={colors.inkMuted}
            autoFocus
            onSubmitEditing={handleAddDeck}
            style={{
              flex: 1,
              fontFamily: fonts.sans.regular,
              fontSize: 13,
              color: colors.ink,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          />
          <Pressable onPress={handleAddDeck}>
            <View className="bg-dark rounded-lg px-md py-sm">
              <KText style={{ fontFamily: fonts.sans.medium, fontSize: 11, color: colors.darkText }}>
                Créer
              </KText>
            </View>
          </Pressable>
        </View>
      )}

      <View className="gap-sm">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            cards={cards.get(deck.id) ?? []}
            subjectName={deck.subject_id ? subjects.find((s) => s.id === deck.subject_id)?.name : undefined}
          />
        ))}
      </View>

      {decks.length === 0 && !showInput && (
        <View className="items-center mt-xxl">
          <KText style={{ fontFamily: fonts.sans.light, fontSize: 12, color: colors.inkSoft }}>
            Aucun deck pour le moment
          </KText>
        </View>
      )}

      {/* FAB */}
      <Pressable
        onPress={() => setShowInput(true)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.dark,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Plus size={20} color={colors.darkText} strokeWidth={1.6} />
      </Pressable>
    </ScrollView>
  );
}
