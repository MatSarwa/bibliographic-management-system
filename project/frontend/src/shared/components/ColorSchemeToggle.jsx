import { ActionIcon, Tooltip, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export default function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computedColorScheme === 'dark';

  return (
    <Tooltip label={isDark ? 'Tryb jasny' : 'Tryb ciemny'}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="lg"
        onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
        aria-label="Przełącz motyw"
      >
        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Tooltip>
  );
}
