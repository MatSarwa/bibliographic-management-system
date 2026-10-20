import { Group, Text, Button } from '@mantine/core';

export default function SwitchModeButton({ isRegister, onToggle }) {
  return (
    <Group justify="center" gap="xs" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
      <Text size="sm" c="dimmed">
        {isRegister ? 'Masz juz konto?' : 'Nie masz konta?'}
      </Text>
      <Button variant="subtle" size="xs" onClick={onToggle} c="var(--mantine-primary-color-filled)">
        {isRegister ? 'Zaloguj sie' : 'Zaloz konto'}
      </Button>
    </Group>
  );
}