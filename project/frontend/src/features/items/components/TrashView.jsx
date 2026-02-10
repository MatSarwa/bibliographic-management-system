import { Box, Center, Loader, Button, Group, Text, Table, ActionIcon, Tooltip, Stack } from '@mantine/core';
import { IconTrash, IconRestore, IconTrashX } from '@tabler/icons-react';
import { useItems } from '../hooks/useItems';

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
          <IconTrash size={64} color="#9ca3af" style={{ opacity: 0.3 }} />
          <Text size="lg" fw={600} c="#6b7280" mt="md">
            Kosz jest pusty
          </Text>
          <Text size="sm" c="#9ca3af">
            Usunięte pozycje pojawią się tutaj
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box p="md">
      <Group justify="space-between" mb="md" p="sm" style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div>
          <Text size="xl" fw={700} c="#111827">
            Kosz
          </Text>
          <Text size="sm" c="#6b7280">
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
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}>
        <Table
          highlightOnHover
          styles={{
            th: { 
              backgroundColor: '#ffffff', 
              color: '#111827', 
              borderColor: '#e5e7eb',
              borderBottom: '2px solid #e5e7eb',
              padding: '12px 8px',
              fontSize: '13px',
              fontWeight: 600,
            },
            td: { 
              color: '#111827', 
              padding: '12px 8px',
              fontSize: '14px',
            },
            tr: { 
              transition: 'background-color 0.15s ease',
              '&:hover': { backgroundColor: '#f9fafb' },
              borderBottom: '1px solid #e5e7eb'
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
                  <Text size="sm" fw={500} c="#111827">
                    {item.title}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="#6b7280">
                    {Array.isArray(item.authors) 
                      ? item.authors.join(', ') 
                      : item.author || 'Nieznany'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="#6b7280">
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