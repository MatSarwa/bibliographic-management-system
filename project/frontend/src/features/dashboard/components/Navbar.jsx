import { Box, Burger, Group, Text, ActionIcon, Button } from '@mantine/core';
import { IconLogout, IconPlus } from '@tabler/icons-react';
import { useAuthStore } from '../../auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import ColorSchemeToggle from '../../../shared/components/ColorSchemeToggle';

export default function Navbar({ onOpenAddModal, isMobile = false, menuOpened = false, onToggleMenu }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box
      style={{
        height: '60px',
        flexShrink: 0,
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-default-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 200
      }}
    >
      <Group gap="sm" wrap="nowrap">
        {isMobile && (
          <Burger opened={menuOpened} onClick={onToggleMenu} size="sm" aria-label="Menu" />
        )}

        {isMobile ? (
          <ActionIcon variant="light" color="violet" size="lg" onClick={onOpenAddModal} aria-label="Dodaj publikację">
            <IconPlus size={20} />
          </ActionIcon>
        ) : (
          <Button
            leftSection={<IconPlus size={18} />}
            variant="light"
            color="violet"
            size="sm"
            onClick={onOpenAddModal}
          >
            Dodaj publikację
          </Button>
        )}
      </Group>

      <Group gap={isMobile ? 'xs' : 'md'} wrap="nowrap">
        {!isMobile && (
          <Text size="sm" c="dimmed">
            Witaj, <Text span fw={500} c="var(--mantine-color-text)">{user?.username || 'User'}</Text>!
          </Text>
        )}

        <ColorSchemeToggle />

        <ActionIcon
          variant="subtle"
          color="red"
          size="lg"
          onClick={handleLogout}
          title="Wyloguj"
        >
          <IconLogout size={20} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
