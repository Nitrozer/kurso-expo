import { View, Pressable, ScrollView } from 'react-native';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useNotesStore } from '../../stores/notesStore';
import { useFlashcardsStore } from '../../stores/flashcardsStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { FlipCard } from '../../components/flashcards/FlipCard';
import { KText } from '../../components/ui/Text';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

type Phase = 'pick' | 'notes' | 'flashcards' | 'done';

export default function RevisionScreen() {
  const session = useAuthStore((s) => s.session);
  const subjects = useSubjectsStore((s) => s.subjects);
  const notes = useNotesStore((s) => s.notes);
  const { decks, cards, fetchCards } = useFlashcardsStore();
  const reviewCard = useFlashcardsStore((s) => s.reviewCard);
  const logAction = useGamificationStore((s) => s.logAction);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('pick');
  const [noteIndex, setNoteIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [notesReviewed, setNotesReviewed] = useState(0);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Filter notes by subject
  const subjectNotes = useMemo(
    () => notes.filter((n) => n.subject_id === selectedSubjectId),
    [notes, selectedSubjectId]
  );

  // Filter decks by subject, then gather all cards
  const subjectDecks = useMemo(
    () => decks.filter((d) => d.subject_id === selectedSubjectId),
    [decks, selectedSubjectId]
  );

  const subjectCards = useMemo(() => {
    const all: { front: string; back: string; id: string }[] = [];
    for (const deck of subjectDecks) {
      const deckCards = cards.get(deck.id) ?? [];
      for (const c of deckCards) {
        all.push({ front: c.front, back: c.back, id: c.id });
      }
    }
    return all;
  }, [subjectDecks, cards]);

  const totalSteps = subjectNotes.length + subjectCards.length;
  const currentStep =
    phase === 'notes'
      ? noteIndex
      : phase === 'flashcards'
        ? subjectNotes.length + cardIndex
        : phase === 'done'
          ? totalSteps
          : 0;
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;

  // Fetch cards for subject decks when subject selected
  useEffect(() => {
    if (!selectedSubjectId) return;
    for (const deck of subjectDecks) {
      fetchCards(deck.id);
    }
  }, [selectedSubjectId, subjectDecks.length]);

  const selectSubject = useCallback((subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setNoteIndex(0);
    setCardIndex(0);
    setIsFlipped(false);
    setNotesReviewed(0);
    setCardsReviewed(0);
    setXpEarned(0);
  }, []);

  // Start session once data is ready
  useEffect(() => {
    if (!selectedSubjectId || phase !== 'pick') return;
    // Small delay to let cards load
    const timeout = setTimeout(() => {
      if (subjectNotes.length > 0) {
        setPhase('notes');
      } else if (subjectCards.length > 0) {
        setPhase('flashcards');
      } else {
        setPhase('done');
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [selectedSubjectId, subjectNotes.length, subjectCards.length]);

  const handleNextNote = () => {
    const userId = session?.user?.id;
    if (userId) {
      logAction(userId, 'note_edited'); // 5 XP
    }
    setNotesReviewed((n) => n + 1);
    setXpEarned((x) => x + 5);

    if (noteIndex + 1 < subjectNotes.length) {
      setNoteIndex((i) => i + 1);
    } else if (subjectCards.length > 0) {
      setPhase('flashcards');
    } else {
      setPhase('done');
    }
  };

  const handleCardReview = async (quality: number) => {
    const card = subjectCards[cardIndex];
    if (!card) return;
    await reviewCard(card.id, quality);
    setCardsReviewed((n) => n + 1);
    setXpEarned((x) => x + 5);
    setIsFlipped(false);

    if (cardIndex + 1 < subjectCards.length) {
      setCardIndex((i) => i + 1);
    } else {
      setPhase('done');
    }
  };

  const resetSession = () => {
    setSelectedSubjectId(null);
    setPhase('pick');
    setNoteIndex(0);
    setCardIndex(0);
    setIsFlipped(false);
    setNotesReviewed(0);
    setCardsReviewed(0);
    setXpEarned(0);
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const difficultyButtons = [
    { label: 'Difficile', quality: 2, color: colors.examRed },
    { label: 'Moyen', quality: 3, color: colors.inkSoft },
    { label: 'Facile', quality: 5, color: colors.blue },
  ];

  return (
    <ScrollView className="flex-1 bg-parchment" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ paddingHorizontal: 28, paddingTop: 28, paddingBottom: 12 }}>
        <KText style={{ fontFamily: fonts.serif.bold, fontSize: 28, color: colors.ink, letterSpacing: -0.8 }}>
          Revision
        </KText>
        {selectedSubject && (
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 8,
              backgroundColor: selectedSubject.color,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <KText style={{ fontFamily: fonts.sans.medium, fontSize: 10, color: '#FFFFFF', letterSpacing: 0.4 }}>
              {selectedSubject.name}
            </KText>
          </View>
        )}
      </View>

      {/* Progress bar */}
      {phase !== 'pick' && (
        <View style={{ paddingHorizontal: 28, marginBottom: 20 }}>
          <View style={{ height: 3, backgroundColor: colors.borderSoft, borderRadius: 2 }}>
            <View
              style={{
                height: 3,
                backgroundColor: colors.ink,
                borderRadius: 2,
                width: `${Math.round(progress * 100)}%`,
              }}
            />
          </View>
        </View>
      )}

      {/* Subject picker */}
      {phase === 'pick' && !selectedSubjectId && (
        <View style={{ paddingHorizontal: 28 }}>
          <KText style={{ fontFamily: fonts.sans.regular, fontSize: 13, color: colors.inkSoft, marginBottom: 16 }}>
            Choisissez une matiere pour commencer la session
          </KText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {subjects.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => selectSubject(s.id)}
                style={{
                  borderWidth: 1,
                  borderColor: s.color,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 10,
                }}
              >
                <KText style={{ fontFamily: fonts.sans.medium, fontSize: 11, color: s.color }}>
                  {s.name}
                </KText>
              </Pressable>
            ))}
          </ScrollView>
          {subjects.length === 0 && (
            <KText style={{ fontFamily: fonts.sans.light, fontSize: 12, color: colors.inkMuted }}>
              Aucune matiere disponible
            </KText>
          )}
        </View>
      )}

      {/* Phase 1: Notes review */}
      {phase === 'notes' && subjectNotes.length > 0 && (
        <View style={{ paddingHorizontal: 28 }}>
          <KText style={{ fontFamily: fonts.sans.medium, fontSize: 10, color: colors.inkSoft, letterSpacing: 0.5, marginBottom: 12 }}>
            Note {noteIndex + 1}/{subjectNotes.length}
          </KText>
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              padding: 20,
              marginBottom: 20,
              minHeight: 200,
            }}
          >
            <KText style={{ fontFamily: fonts.serif.bold, fontSize: 18, color: colors.ink, marginBottom: 10, letterSpacing: -0.3 }}>
              {subjectNotes[noteIndex].title}
            </KText>
            <KText style={{ fontFamily: fonts.sans.regular, fontSize: 14, lineHeight: 22, color: colors.inkSoft }}>
              {subjectNotes[noteIndex].content_preview ||
                (typeof subjectNotes[noteIndex].content === 'object' && subjectNotes[noteIndex].content !== null
                  ? (subjectNotes[noteIndex].content as { text?: string }).text?.slice(0, 300) ?? ''
                  : '') ||
                'Aucun contenu'}
            </KText>
            {(subjectNotes[noteIndex].tags ?? []).length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {subjectNotes[noteIndex].tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: 20,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <KText style={{ fontFamily: fonts.sans.medium, fontSize: 9, color: colors.inkSoft }}>
                      {tag}
                    </KText>
                  </View>
                ))}
              </View>
            )}
          </View>
          <Pressable onPress={handleNextNote}>
            <View
              style={{
                backgroundColor: colors.dark,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <KText style={{ fontFamily: fonts.sans.medium, fontSize: 13, color: colors.darkText }}>
                Suivant
              </KText>
            </View>
          </Pressable>
        </View>
      )}

      {/* Phase 2: Flashcards */}
      {phase === 'flashcards' && subjectCards.length > 0 && (
        <View style={{ paddingHorizontal: 28 }}>
          <KText style={{ fontFamily: fonts.sans.medium, fontSize: 10, color: colors.inkSoft, letterSpacing: 0.5, marginBottom: 12 }}>
            Carte {cardIndex + 1}/{subjectCards.length}
          </KText>
          <FlipCard
            front={subjectCards[cardIndex].front}
            back={subjectCards[cardIndex].back}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
          {isFlipped && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              {difficultyButtons.map((btn) => (
                <Pressable key={btn.label} onPress={() => handleCardReview(btn.quality)}>
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
          {!isFlipped && (
            <KText
              style={{
                fontFamily: fonts.sans.light,
                fontSize: 11,
                color: colors.inkMuted,
                textAlign: 'center',
                marginTop: 16,
              }}
            >
              Tapez la carte pour la retourner
            </KText>
          )}
        </View>
      )}

      {/* Completion screen */}
      {phase === 'done' && (
        <View style={{ paddingHorizontal: 28, alignItems: 'center', paddingTop: 40 }}>
          <KText style={{ fontSize: 48, marginBottom: 16 }}>
            {'\u2705'}
          </KText>
          <KText style={{ fontFamily: fonts.serif.bold, fontSize: 24, color: colors.ink, marginBottom: 8, letterSpacing: -0.5 }}>
            Session terminee !
          </KText>
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              padding: 20,
              width: '100%',
              marginTop: 16,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <KText style={{ fontFamily: fonts.sans.regular, fontSize: 13, color: colors.inkSoft }}>
                Notes relues
              </KText>
              <KText style={{ fontFamily: fonts.serif.bold, fontSize: 15, color: colors.ink }}>
                {notesReviewed}
              </KText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <KText style={{ fontFamily: fonts.sans.regular, fontSize: 13, color: colors.inkSoft }}>
                Cartes revisees
              </KText>
              <KText style={{ fontFamily: fonts.serif.bold, fontSize: 15, color: colors.ink }}>
                {cardsReviewed}
              </KText>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <KText style={{ fontFamily: fonts.sans.regular, fontSize: 13, color: colors.inkSoft }}>
                XP gagnes
              </KText>
              <KText style={{ fontFamily: fonts.serif.bold, fontSize: 15, color: colors.blue }}>
                +{xpEarned}
              </KText>
            </View>
          </View>
          <Pressable onPress={resetSession} style={{ marginTop: 24, width: '100%' }}>
            <View
              style={{
                backgroundColor: colors.dark,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <KText style={{ fontFamily: fonts.sans.medium, fontSize: 13, color: colors.darkText }}>
                Nouvelle session
              </KText>
            </View>
          </Pressable>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
