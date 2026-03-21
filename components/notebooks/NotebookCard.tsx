import { View } from 'react-native';
import { Card } from '../ui/Card';
import { KText } from '../ui/Text';
import { colors } from '../../theme/colors';
import type { Notebook } from '../../types';

type Props = {
  notebook: Notebook;
  pageCount: number;
  subjectName?: string;
  onPress: () => void;
};

export function NotebookCard({ notebook, pageCount, subjectName, onPress }: Props) {
  return (
    <Card onPress={onPress} className="mb-md flex-1">
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: notebook.cover_color,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        }}
      />
      {subjectName && (
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 8,
          }}
        >
          <KText preset="badgePill" color={colors.inkSoft}>
            {subjectName}
          </KText>
        </View>
      )}
      <KText
        preset="sectionTitle"
        color={colors.ink}
        style={{ marginBottom: 4 }}
      >
        {notebook.title}
      </KText>
      <KText preset="notePreview" color={colors.inkMuted}>
        {pageCount} {pageCount === 1 ? 'page' : 'pages'}
      </KText>
    </Card>
  );
}
