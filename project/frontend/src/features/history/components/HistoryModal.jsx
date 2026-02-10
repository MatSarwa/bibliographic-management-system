import {
  Modal,
  Stack,
  Text,
  Loader,
  Center,
  Badge,
  Group
} from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import HistoryTimeline from './HistoryTimeline';

export default function HistoryModal({ opened, onClose, item, onVersionRestored }) {
  const { history, loading, handleRestoreVersion } = useHistory(item?.id);
  const [restoring, setRestoring] = useState(null);

  const handleRestore = async (version) => {
    setRestoring(version);
    const success = await handleRestoreVersion(version);
    setRestoring(null);

    if (success) {
      onVersionRestored?.();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconHistory size={20} />
          <Text fw={600}>
            Historia zmian
          </Text>
          {!loading && (
            <Badge size="sm" variant="light">
              {history.length}
            </Badge>
          )}
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {item?.title}
        </Text>
        {loading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : history.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Brak historii zmian
          </Text>
        ) : (
          <HistoryTimeline 
            history={history} 
            onRestore={handleRestore}
            restoring={restoring}
          />
        )}
      </Stack>
    </Modal>
  );
}