import { Group, Text, Button } from '@mantine/core';

export default function SwitchModeButton({ isRegister, onToggle }) {
  return (
    <Group justify="center" gap="xs" mt="md" pt="md" style={{ borderTop: '1px solid #e5e7eb' }}>
      <Text size="sm" c="#6b7280">
        {isRegister ? 'Masz juz konto?' : 'Nie masz konta?'}
      </Text>
      <Button variant="subtle" size="xs" onClick={onToggle} c="#6366f1">
        {isRegister ? 'Zaloguj sie' : 'Zaloz konto'}
      </Button>
    </Group>
  );
}