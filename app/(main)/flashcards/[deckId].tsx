import { View, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useFlashcardsStore } from '../../../stores/flashcardsStore';
import { useAuthStore } from '../../../stores/authStore';
import { FlipCard } from '../../../components/flashcards/FlipCard';
import { KText } from '../../../components/ui/Text';
import { colors } from '../../../theme/colors';
import { fonts } from '../../../theme/typography';
import { Trash2, Share2 } from 'lucide-react-native';

export default function DeckReviewScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const session = useAuthStore((s) => s.session);
  const { decks, cards, fetchCards, addCard, updateCard, deleteCard, reviewCard } = useFlashcardsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const deck = decks.find((d) => d.id === deckId);
  const allCards = cards.get(deckId ?? '') ?? [];

  const dueCards = useMemo(() => {
    const now = new Date().toISOString();
    return allCards.filter((c) => !c.next_review || c.next_review <= now);
  }, [allCards]);

  useEffect(() => {
    if (deckId) fetchCards(deckId);
  }, [deckId]);

  const handleReview = async (quality: number) => {
    const card = dueCards[currentIndex];
    if (!card) return;
    await reviewCard(card.id, quality);
    setIsFlipped(false);
    if (currentIndex + 1 >= dueCards.length) {
      setReviewDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleAddCard = async () => {
    if (!newFront.trim() || !newBack.trim() || !session?.user || !deckId) return;
    await addCard({ deck_id: deckId, user_id: session.user.id, front: newFront.trim(), back: newBack.trim() });
    setNewFront('');
    setNewBack('');
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!deckId) return;
    await deleteCard(cardId, deckId);
  };

  const handleShareDeck = async () => {
    if (!deck) return;
    const exportData = {
      deck_title: deck.title,
      cards: allCards.map((c) => ({ front: c.front, back: c.back })),
    };
    try {
      const fileUri = `${FileSystem.cacheDirectory}deck_${deckId}.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Partager le deck',
      });
    } catch {
      // User cancelled or sharing not available
    }
  };

  const difficultyButtons = [
    { label: 'Difficile', quality: 2, color: colors.examRed },
    { label: 'Moyen', quality: 3, color: colors.inkSoft },
    { label: 'Facile', quality: 5, color: colors.blue },
  ];

  return (
    <ScrollView className="flex-1 bg-parchment p-xxl" showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <KText preset="heroName" color={colors.ink} style={{ flex: 1 }}>
          {deck?.title ?? 'Deck'}
        </KText>
        <Pressable
          onPress={handleShareDeck}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Share2 size={14} strokeWidth={1.6} color={colors.inkSoft} />
          <KText style={{ fontFamily: fonts.sans.medium, fontSize: 10, color: colors.inkSoft, letterSpacing: 0.3 }}>
            Partager
          </KText>
        </Pressable>
      </View>

      {/* Toggle review / manage */}
      <View className="flex-row gap-sm mb-xl">
        <Pressable onPress={() => setShowManage(false)}>
          <View
            style={{
              borderWidth: 1,
              borderColor: !showManage ? colors.dark : colors.border,
              backgroundColor: !showManage ? colors.dark : 'transparent',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <KText style={{ fontFamily: fonts.sans.medium, fontSize: 11, color: !showManage ? colors.darkText : colors.ink }}>
              Réviser
            </KText>
          </View>
        </Pressable>
        <Pressable onPress={() => setShowManage(true)}>
          <View
            style={{
              borderWidth: 1,
              borderColor: showManage ? colors.dark : colors.border,
              backgroundColor: showManage ? colors.dark : 'transparent',
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <KText style={{ fontFamily: fonts.sans.medium, fontSize: 11, color: showManage ? colors.darkText : colors.ink }}>
              Gérer
            </KText>
          </View>
        </Pressable>
      </View>

      {!showManage ? (
        /* Review mode */
        <View>
          {reviewDone || dueCards.length === 0 ? (
            <View className="items-center mt-xxl">
              <KText style={{ fontFamily: fonts.serif.bold, fontSize: 20, color: colors.ink }}>
                Terminé !
              </KText>
              <KText style={{ fontFamily: fonts.sans.light, fontSize: 12, color: colors.inkSoft, marginTop: 8 }}>
                {dueCards.length === 0
                  ? 'Aucune carte à réviser pour le moment'
                  : `${dueCards.length} carte${dueCards.length !== 1 ? 's' : ''} révisée${dueCards.length !== 1 ? 's' : ''}`}
              </KText>
            </View>
          ) : (
            <View>
              <KText style={{ fontFamily: fonts.sans.light, fontSize: 10, color: colors.inkSoft, marginBottom: 12 }}>
                {currentIndex + 1} / {dueCards.length}
              </KText>
              <FlipCard
                front={dueCards[currentIndex].front}
                back={dueCards[currentIndex].back}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
              />
              {isFlipped && (
                <View className="flex-row justify-center gap-md mt-xl">
                  {difficultyButtons.map((btn) => (
                    <Pressable key={btn.label} onPress={() => handleReview(btn.quality)}>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: btn.color,
                          borderRadius: 20,
                          paddingHorizontal: 18,
                          paddingVertical: 8,
                        }}
                      >
                        <KText style={{ fontFamily: fonts.sans.medium, fontSize: 12, color: btn.color }}>
                          {btn.label}
                        </KText>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ) : (
        /* Manage mode */
        <View>
          {/* Add card form */}
          <View className="mb-lg">
            <TextInput
              value={newFront}
              onChangeText={setNewFront}
              placeholder="Recto..."
              placeholderTextColor={colors.inkMuted}
              style={{
                fontFamily: fonts.sans.regular,
                fontSize: 13,
                color: colors.ink,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginBottom: 8,
              }}
            />
            <TextInput
              value={newBack}
              onChangeText={setNewBack}
              placeholder="Verso..."
              placeholderTextColor={colors.inkMuted}
              style={{
                fontFamily: fonts.sans.regular,
                fontSize: 13,
                color: colors.ink,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginBottom: 8,
              }}
            />
            <Pressable onPress={handleAddCard}>
              <View className="bg-dark rounded-lg px-md py-sm self-start">
                <KText style={{ fontFamily: fonts.sans.medium, fontSize: 11, color: colors.darkText }}>
                  Ajouter
                </KText>
              </View>
            </Pressable>
          </View>

          {/* Card list */}
          <View className="gap-sm">
            {allCards.map((card) => (
              <Pressable
                key={card.id}
                onPress={() => {
                  if (Platform.OS === 'ios' && deckId) {
                    Alert.prompt(
                      'Modifier le recto',
                      '',
                      (newFront) => {
                        if (newFront && newFront.trim()) {
                          Alert.prompt(
                            'Modifier le verso',
                            '',
                            (newBack) => {
                              if (newBack && newBack.trim()) {
                                updateCard(card.id, deckId, { front: newFront.trim(), back: newBack.trim() });
                              }
                            },
                            'plain-text',
                            card.back,
                          );
                        }
                      },
                      'plain-text',
                      card.front,
                    );
                  }
                }}
                onLongPress={() => {
                  Alert.alert(
                    'Supprimer la carte',
                    `Supprimer cette carte ?`,
                    [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Supprimer', style: 'destructive', onPress: () => handleDeleteCard(card.id) },
                    ],
                  );
                }}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View className="flex-1">
                  <KText style={{ fontFamily: fonts.sans.medium, fontSize: 12, color: colors.ink }}>
                    {card.front}
                  </KText>
                  <KText style={{ fontFamily: fonts.sans.light, fontSize: 11, color: colors.inkSoft, marginTop: 2 }}>
                    {card.back}
                  </KText>
                </View>
                <Pressable onPress={() => handleDeleteCard(card.id)}>
                  <Trash2 size={16} color={colors.inkMuted} strokeWidth={1.6} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
