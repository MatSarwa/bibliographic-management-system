import {
  Box,
  Stack,
  Text,
  Group,
  Button,
  Card,
  ColorSwatch,
  Badge,
  ActionIcon,
  TextInput,
  Loader,
  Center,
  Grid
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconTag, IconX, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { useLabels } from '../hooks/useLabels';

const LABEL_COLORS = [
  '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#f43f5e', '#64748b'
];

export default function LabelsView() {
  const { labels, loading, handleCreate, handleUpdate, handleDelete } = useLabels();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleSubmitNew = async () => {
    if (!newName.trim()) return;

    const success = await handleCreate({
      name: newName.trim(),
      color: newColor
    });

    if (success) {
      setNewName('');
      setNewColor('#3b82f6');
      setIsAdding(false);
    }
  };

  const handleSubmitEdit = async (id) => {
    if (!editName.trim()) return;

    const success = await handleUpdate(id, {
      name: editName.trim(),
      color: editColor
    });

    if (success) {
      setEditingId(null);
    }
  };

  const handleStartEdit = (label) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
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
      <Group justify="space-between" mb="xl">
        <div>
          <Group gap="xs">
            <IconTag size={28} color="#6366f1" />
            <Text size="xl" fw={700}>
              Etykiety
            </Text>
            <Badge size="lg" variant="light">
              {labels.length}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mt={4}>
            Zarządzaj etykietami dla swoich publikacji
          </Text>
        </div>

        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsAdding(true)}
        >
          Nowa etykieta
        </Button>
      </Group>

      {isAdding && (
        <Card p="md" mb="md" withBorder style={{ backgroundColor: '#f9fafb' }}>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Nowa etykieta
            </Text>
            
            <TextInput
              placeholder="Nazwa etykiety"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />

            <div>
              <Text size="sm" fw={500} mb="xs">
                Kolor
              </Text>
              <Group gap="xs">
                {LABEL_COLORS.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    size={32}
                    onClick={() => setNewColor(color)}
                    style={{
                      cursor: 'pointer',
                      border: newColor === color ? '3px solid #3b82f6' : '2px solid #e5e7eb'
                    }}
                  />
                ))}
              </Group>
            </div>

            <Group justify="flex-end" gap="xs">
              <Button
                variant="subtle"
                onClick={() => {
                  setIsAdding(false);
                  setNewName('');
                  setNewColor('#3b82f6');
                }}
              >
                Anuluj
              </Button>
              <Button
                onClick={handleSubmitNew}
                disabled={!newName.trim()}
              >
                Dodaj
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {labels.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconTag size={48} color="#9ca3af" />
            <Text size="lg" c="dimmed">
              Brak etykiet
            </Text>
            <Text size="sm" c="dimmed">
              Utwórz pierwszą etykietę aby organizować swoje publikacje
            </Text>
          </Stack>
        </Center>
      ) : (
        <Grid>
          {labels.map((label) => (
            <Grid.Col key={label.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              {editingId === label.id ? (
                <Card p="md" withBorder style={{ backgroundColor: '#f9fafb' }}>
                  <Stack gap="md">
                    <TextInput
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />

                    <div>
                      <Text size="xs" fw={500} mb="xs">
                        Kolor
                      </Text>
                      <Group gap="xs">
                        {LABEL_COLORS.map((color) => (
                          <ColorSwatch
                            key={color}
                            color={color}
                            size={24}
                            onClick={() => setEditColor(color)}
                            style={{
                              cursor: 'pointer',
                              border: editColor === color ? '2px solid #3b82f6' : '2px solid transparent'
                            }}
                          />
                        ))}
                      </Group>
                    </div>

                    <Group justify="flex-end" gap="xs">
                      <ActionIcon
                        variant="subtle"
                        onClick={() => setEditingId(null)}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        onClick={() => handleSubmitEdit(label.id)}
                      >
                        <IconCheck size={16} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Card>
              ) : (
                <Card p="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <ColorSwatch color={label.color} size={24} />
                    <Group gap={4}>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => handleStartEdit(label)}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(label.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Text size="sm" fw={500} mb="xs">
                    {label.name}
                  </Text>

                  <Text size="xs" c="dimmed">
                    Utworzono: {new Date(label.createdAt).toLocaleDateString('pl-PL')}
                  </Text>
                </Card>
              )}
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Box>
  );
}