import { 
  Modal, 
  TextInput, 
  Button, 
  Stack, 
  Group, 
  Text,
  Avatar,
  Badge,
  ActionIcon,
  Paper,
  Divider,
  Alert,
  Loader,
  Center
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { 
  IconUsers, 
  IconMail, 
  IconTrash, 
  IconAlertCircle
} from '@tabler/icons-react';
import collectionsService from '../services/collectionsService';

export default function ShareCollectionModal({ 
  opened, 
  onClose, 
  collection 
}) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (opened && collection) {
      fetchSharedUsers();
    }
  }, [opened, collection]);

  const fetchSharedUsers = async () => {
    setFetchLoading(true);
    try {
      const result = await collectionsService.getSharedUsers(collection.id);
      if (result.success) {
        setSharedUsers(result.data.sharedWith || []);
        setOwner(result.data.owner);
      }
    } catch (err) {
      console.error('Error fetching shared users:', err);
    }
    setFetchLoading(false);
  };

  const handleShare = async () => {
    if (!emailOrUsername.trim()) {
      setError('Podaj email lub username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isEmail = emailOrUsername.includes('@');
      const result = await collectionsService.shareCollection(collection.id, {
        email: isEmail ? emailOrUsername : undefined,
        username: !isEmail ? emailOrUsername : undefined
      });

      if (result.success) {
        setEmailOrUsername('');
        await fetchSharedUsers();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd udostępniania');
    }

    setLoading(false);
  };

  const handleUnshare = async (userId) => {
    if (!window.confirm('Czy na pewno usunąć dostęp dla tego użytkownika?')) {
      return;
    }

    try {
      const result = await collectionsService.unshareCollection(collection.id, userId);
      if (result.success) {
        await fetchSharedUsers();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Błąd usuwania dostępu');
    }
  };

  if (!collection) return null;

  const isNested = !!collection.parentId;
  const hasSubfolders = collection.children && collection.children.length > 0;
  const canShare = !isNested && !hasSubfolders;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconUsers size={20} color="#06b6d4" />
          <Text fw={600}>Udostępnij: {collection.name}</Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        {!canShare && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {isNested 
              ? 'Nie można udostępniać zagnieżdżonych kolekcji. Udostępnij kolekcję główną.' 
              : 'Nie można udostępniać kolekcji z subfolderami. Usuń subfoldery lub udostępnij je osobno.'}
          </Alert>
        )}

        <div>
          <Text size="sm" fw={500} mb="xs">
            Dodaj osobę
          </Text>
          <Group align="flex-start">
            <TextInput
              placeholder="Email lub username"
              leftSection={<IconMail size={16} />}
              value={emailOrUsername}
              onChange={(e) => {
                setEmailOrUsername(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && canShare && handleShare()}
              style={{ flex: 1 }}
              error={error}
              disabled={!canShare}
            />
            <Button 
              onClick={handleShare} 
              loading={loading}
              color="cyan"
              disabled={!canShare}
            >
              Udostępnij
            </Button>
          </Group>
        </div>

        <Divider />

        {fetchLoading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : (
          <>
            {owner && (
              <div>
                <Text size="sm" fw={500} mb="xs" c="#6b7280">
                  Właściciel
                </Text>
                <Paper p="sm" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <Avatar size="sm" color="violet" radius="xl">
                        {owner.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>{owner.username}</Text>
                        <Text size="xs" c="dimmed">{owner.email}</Text>
                      </div>
                    </Group>
                    <Badge color="violet" variant="light">Właściciel</Badge>
                  </Group>
                </Paper>
              </div>
            )}

            {sharedUsers.length > 0 && (
              <div>
                <Text size="sm" fw={500} mb="xs" c="#6b7280">
                  Udostępniono dla ({sharedUsers.length})
                </Text>
                <Stack gap="xs">
                  {sharedUsers.map((member) => (
                    <Paper key={member.id} p="sm" withBorder>
                      <Group justify="space-between">
                        <Group>
                          <Avatar size="sm" color="cyan" radius="xl">
                            {member.user?.username?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={500}>{member.user?.username || 'Unknown'}</Text>
                            <Text size="xs" c="dimmed">{member.user?.email || ''}</Text>
                          </div>
                        </Group>
                        <Group gap="xs">
                          <Badge size="sm" color="cyan" variant="light">
                            Dostęp
                          </Badge>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => handleUnshare(member.userId)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </div>
            )}

            {sharedUsers.length === 0 && owner && (
              <Text size="sm" c="dimmed" fs="italic" ta="center" py="md">
                Kolekcja nie jest z nikim udostępniona
              </Text>
            )}
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Zamknij
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}