import { StyleSheet, useColorScheme, View } from 'react-native';

const BLOCK_COUNT = 5;
const BLOCK_GAP = 2;
const BLOCK_SIZE = 8;
const BAR_WIDTH = BLOCK_COUNT * BLOCK_SIZE + (BLOCK_COUNT - 1) * BLOCK_GAP;

interface MatchSpectrumProps {
  score?: number;
}

export function ContentMatchSpectrum({ score }: MatchSpectrumProps) {
  const colorScheme = useColorScheme();

  const hasScore = typeof score === 'number' && !Number.isNaN(score);
  const clampedScore = hasScore ? Math.max(0, Math.min(100, score ?? 0)) : 0;
  const baseBorderColor = colorScheme === 'dark' ? '#374151' : '#d1d5db';
  const activePalette =
    colorScheme === 'dark'
      ? [
          'rgba(229,231,235,0.35)',
          'rgba(229,231,235,0.5)',
          'rgba(229,231,235,0.65)',
          'rgba(229,231,235,0.8)',
          'rgba(229,231,235,0.95)',
        ]
      : [
          'rgba(17,24,39,0.3)',
          'rgba(17,24,39,0.45)',
          'rgba(17,24,39,0.6)',
          'rgba(17,24,39,0.75)',
          'rgba(17,24,39,0.9)',
        ];
  const activeBlocks = hasScore ? Math.ceil((clampedScore / 100) * BLOCK_COUNT) : 0;

  return (
    <View className="mb-2">
      <View style={styles.blockRow}>
        {Array.from({ length: BLOCK_COUNT }, (_, index) => {
          const isActive = index < activeBlocks;
          const paletteColor = activePalette[index] ?? activePalette[activePalette.length - 1];
          const backgroundColor = !hasScore
            ? 'transparent'
            : isActive
              ? paletteColor
              : 'transparent';
          const borderWidth = !hasScore || !isActive ? 1 : 0;
          return (
            <View
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              style={[
                styles.block,
                {
                  backgroundColor,
                  borderColor: baseBorderColor,
                  borderWidth,
                },
                index < BLOCK_COUNT - 1 ? styles.blockGap : null,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blockRow: {
    width: BAR_WIDTH,
    flexDirection: 'row',
  },
  block: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderRadius: 2,
  },
  blockGap: {
    marginRight: BLOCK_GAP,
  },
});
