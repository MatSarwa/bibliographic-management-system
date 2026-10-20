import { Group, Text, Button, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { REGISTRATION_ENABLED } from '../../../shared/config/features';

export default function SwitchModeButton({ isRegister, onToggle }) {
  return (
    <Group justify="center" gap="xs" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
      {REGISTRATION_ENABLED ? (
        <>
          <Text size="sm" c="dimmed">
            {isRegister ? 'Masz juz konto?' : 'Nie masz konta?'}
          </Text>
          <Button variant="subtle" size="xs" onClick={onToggle} c="var(--mantine-primary-color-filled)">
            {isRegister ? 'Zaloguj sie' : 'Zaloz konto'}
          </Button>
        </>
      ) : (
        <Text size="sm" c="dimmed" ta="center">
          Wersja demonstracyjna – rejestracja jest wyłączona.{' '}
          <Anchor component={Link} to="/" size="sm">Użyj konta demo</Anchor>
        </Text>
      )}
    </Group>
  );
}
