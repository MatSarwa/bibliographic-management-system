import { Box, Center, Loader, Button, Group, Text, Table, ActionIcon, Tooltip, Stack } from '@mantine/core';
import { IconTrash, IconRestore, IconTrashX } from '@tabler/icons-react';
import { useItems } from '../hooks/useItems';
import { formatAuthors } from '../../../shared/utils/authors';

export default function TrashView() {
  const {
    items,
    loading,
    handleRestore,
    handlePermanentDelete,
    handleEmptyTrash,
  } = useItems('trash', 'trash');

  if (loading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size="lg" color="violet" />
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <Center style={{ height: '60vh' }}>
        <Stack align="center">
          <IconTrash size={64} style={{ color: 'var(--mantine-color-placeholder)', opacity: 0.3 }} />
          <Text size="lg" fw={600} c="dimmed" mt="md">
            Kosz jest pusty
          </Text>
          <Text size="sm" c="var(--mantine-color-placeholder)">
            Usunięte pozycje pojawią się tutaj
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box p="md">
      <Group justify="space-between" mb="md" p="sm" style={{ 
        backgroundColor: 'var(--mantine-color-body)', 
        borderRadius: '8px',
        border: '1px solid var(--mantine-color-default-border)'
      }}>
        <div>
          <Text size="xl" fw={700} c="var(--mantine-color-text)">
            Kosz
          </Text>
          <Text size="sm" c="dimmed">
            {items.length} {items.length === 1 ? 'pozycja' : 'pozycji'}
          </Text>
        </div>

        <Button
          color="red"
          leftSection={<IconTrashX size={16} />}
          onClick={handleEmptyTrash}
          disabled={items.length === 0}
        >
          Opróżnij kosz
        </Button>
      </Group>

      <Box style={{ 
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: 'var(--mantine-color-body)'
      }}>
        <Table
          highlightOnHover
          styles={{
            th: { 
              backgroundColor: 'var(--mantine-color-body)', 
              color: 'var(--mantine-color-text)', 
              borderColor: 'var(--mantine-color-default-border)',
              borderBottom: '2px solid var(--mantine-color-default-border)',
              padding: '12px 8px',
              fontSize: '13px',
              fontWeight: 600,
            },
            td: { 
              color: 'var(--mantine-color-text)', 
              padding: '12px 8px',
              fontSize: '14px',
            },
            tr: { 
              transition: 'background-color 0.15s ease',
              borderBottom: '1px solid var(--mantine-color-default-border)'
            }
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tytuł</Table.Th>
              <Table.Th>Autor</Table.Th>
              <Table.Th style={{ width: '80px' }}>Rok</Table.Th>
              <Table.Th style={{ width: '150px', textAlign: 'center' }}>Akcje</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text size="sm" fw={500} c="var(--mantine-color-text)">
                    {item.title}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {formatAuthors(item, 'Nieznany')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {item.year || '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} justify="center">
                    <Tooltip label="Przywróć" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        onClick={() => handleRestore(item.id)}
                      >
                        <IconRestore size={18} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Usuń na zawsze" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handlePermanentDelete(item.id)}
                      >
                        <IconTrashX size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Box>
  );
}