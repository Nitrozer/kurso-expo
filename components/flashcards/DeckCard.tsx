import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { KText } from '../ui/Text';
import { Card } from '../ui/Card';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import type { Deck, Flashcard } from '../../types';

type Props = {
  deck: Deck;
  cards: Flashcard[];
  subjectName?: string;
};

export function DeckCard({ deck, cards, subjectName }: Props) {
  const router = useRouter();
  const now = new Date().toISOString();
  const dueCount = cards.filter((c) => !c.next_review || c.next_review <= now).length;

  return (
    <Card onPress={() => router.push(`/flashcards/${deck.id}`)}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <KText
            style={{ fontFamily: fonts.serif.bold, fontSize: 14, letterSpacing: -0.14, color: colors.ink }}
          >
            {deck.title}
          </KText>
          <KText
            style={{ fontFamily: fonts.sans.light, fontSize: 10.5, color: colors.inkSoft, marginTop: 2 }}
          >
            {cards.length} carte{cards.length !== 1 ? 's' : ''}
          </KText>
        </View>
        <View className="flex-row items-center gap-sm">
          {subjectName ? (
            <View className="border border-border rounded-lg px-sm py-xs">
              <KText style={{ fontFamily: fonts.sans.medium, fontSize: 8, letterSpacing: 0.96, textTransform: 'uppercase', color: colors.inkSoft }}>
                {subjectName}
              </KText>
            </View>
          ) : null}
          {dueCount > 0 ? (
            <View className="bg-blue-bg border border-blue-border rounded-lg px-sm py-xs">
              <KText style={{ fontFamily: fonts.sans.medium, fontSize: 9, color: colors.blue }}>
                {dueCount} due
              </KText>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
