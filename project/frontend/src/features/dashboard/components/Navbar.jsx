import { Box, Group, Text, ActionIcon, Button } from '@mantine/core';
import { IconLogout, IconPlus } from '@tabler/icons-react';
import { useAuthStore } from '../../auth/store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onOpenAddModal }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      style={{
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 200
      }}
    >
      <Button
        leftSection={<IconPlus size={18} />}
        variant="light"
        color="violet"
        size="sm"
        onClick={onOpenAddModal}
      >
        Dodaj
      </Button>

      <Group gap="md">
        <Text size="sm" c="#6b7280">
          Witaj, <Text span fw={500} c="#111827">{user?.username || 'User'}</Text>!
        </Text>

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