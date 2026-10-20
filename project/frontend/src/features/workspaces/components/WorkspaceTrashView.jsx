import { useEffect, useState } from 'react';
import { ActionIcon, Box, Center, Group, Loader, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconRestore, IconTrash, IconTrashX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../../shared/utils/api';
import { useRefresh, useRefreshVersion } from '../../../shared/store/refreshStore';
import { confirmAction } from '../../../shared/utils/confirm';
import { formatAuthors } from '../../../shared/utils/authors';

// Items deleted by any member of the workspace. Editors and admins can restore them;
// only admins can delete them permanently (the server enforces both).
export default function WorkspaceTrashView({ workspace }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsVersion = useRefreshVersion('items');
  const refresh = useRefresh();

  // The parent remounts this view per workspace (key), so loading only starts as true once.
  const fetchTrash = async () => {
    try {
      const { data } = await api.get(`/workspaces/${workspace.id}/trash`);
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      notifications.show({
        title: 'Nie udało się pobrać kosza',
        message: err.response?.data?.message || 'Spróbuj ponownie.',
        color: 'red',
      });
      setItems([]);
    }
    setLoading(false);
  };

  // Initial load and background refetch after any item change.
  useEffect(() => {
    fetchTrash();
  }, [itemsVersion]);

  const afterChange = () => refresh('items', 'collections', 'workspaces');

  const handleRestore = async (item) => {
    try {
      await api.post(`/items/${item.id}/restore`);
      notifications.show({ title: 'Przywrócono', message: `„${item.title}” wróciło do kolekcji ${item.collection?.name || ''}`, color: 'green' });
      afterChange();
    } catch (err) {
      notifications.show({ title: 'Nie udało się przywrócić', message: err.response?.data?.message || 'Spróbuj ponownie.', color: 'red' });
    }
  };

  const handlePermanentDelete = async (item) => {
    const confirmed = await confirmAction({
      title: 'Usunąć na zawsze?',
      message: `„${item.title}” zostanie trwale usunięte z workspace’u. Tej operacji nie można cofnąć.`,
      confirmLabel: 'Usuń na zawsze',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/items/${item.id}/permanent`);
      notifications.show({ title: 'Usunięto na zawsze', message: item.title, color: 'green' });
      afterChange();
    } catch (err) {
      notifications.show({ title: 'Nie udało się usunąć', message: err.response?.data?.message || 'Spróbuj ponownie.', color: 'red' });
    }
  };

  if (loading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size="lg" color="violet" />
      </Center>
    );
  }

  return (
    <Box p="md">
      <Box mb="md" p="sm" style={{
        backgroundColor: 'var(--mantine-color-body)',
        borderRadius: 8,
        border: '1px solid var(--mantine-color-default-border)',
      }}>
        <Text size="xl" fw={700}>Kosz – {workspace.name}</Text>
        <Text size="sm" c="dimmed">
          Pozycje usunięte przez członków workspace’u. Edytor lub admin może je przywrócić, a admin – usunąć na zawsze.
        </Text>
      </Box>

      {items.length === 0 ? (
        <Center style={{ height: '40vh' }}>
          <Stack align="center" gap="xs">
            <IconTrash size={56} style={{ color: 'var(--mantine-color-placeholder)', opacity: 0.4 }} />
            <Text fw={600} c="dimmed">Kosz jest pusty</Text>
          </Stack>
        </Center>
      ) : (
        <Table.ScrollContainer minWidth={720} type="native">
          <Table highlightOnHover withTableBorder verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tytuł</Table.Th>
                <Table.Th>Kolekcja</Table.Th>
                <Table.Th>Usunął(a)</Table.Th>
                <Table.Th style={{ width: 140 }}>Kiedy</Table.Th>
                <Table.Th style={{ width: 100, textAlign: 'center' }}>Akcje</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>{item.title}</Text>
                    <Text size="xs" c="dimmed">{formatAuthors(item, '')}</Text>
                  </Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{item.collection?.name || '—'}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{item.deleter?.username || '—'}</Text></Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {item.deletedAt ? new Date(item.deletedAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="center" wrap="nowrap">
                      <Tooltip label="Przywróć" withArrow>
                        <ActionIcon variant="subtle" color="green" onClick={() => handleRestore(item)}>
                          <IconRestore size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Usuń na zawsze" withArrow>
                        <ActionIcon variant="subtle" color="red" onClick={() => handlePermanentDelete(item)}>
                          <IconTrashX size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Box>
  );
}
