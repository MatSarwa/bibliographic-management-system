import {
  Box,
  Stack,
  Text,
  Group,
  Badge,
  ActionIcon,
  Button,
  Collapse,
  ColorSwatch,
  TextInput,
  Loader,
  Center
} from '@mantine/core';
import { IconTag, IconPlus, IconEdit, IconTrash, IconChevronDown, IconChevronRight, IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useLabels } from '../hooks/useLabels';

const LABEL_COLORS = [
  '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#f43f5e', '#64748b'
];

export default function LabelsPanel() {
  const { labels, loading, handleCreate, handleUpdate, handleDelete } = useLabels();
  const [isExpanded, setIsExpanded] = useState(false);
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
      <Center py="xs">
        <Loader size="xs" />
      </Center>
    );
  }

  return (
    <Box>
      <Group
        justify="space-between"
        mb={4}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <Group gap="xs">
          {isExpanded ? (
            <IconChevronDown size={12} color="#6b7280" />
          ) : (
            <IconChevronRight size={12} color="#6b7280" />
          )}
          <Text size="10px" fw={600} c="#9ca3af" tt="uppercase" lts="0.8px">
            Etykiety
          </Text>
          <Badge size="xs" variant="light" color="gray">
            {labels.length}
          </Badge>
        </Group>

        {isExpanded && (
          <ActionIcon
            size="xs"
            variant="subtle"
            c="#9ca3af"
            onClick={(e) => {
              e.stopPropagation();
              setIsAdding(true);
            }}
            style={{ width: '20px', height: '20px' }}
          >
            <IconPlus size={11} />
          </ActionIcon>
        )}
      </Group>

      <Collapse in={isExpanded}>
        <Stack gap="xs" mt="xs">
          {isAdding && (
            <Box p="xs" style={{ backgroundColor: '#f9fafb', borderRadius: '4px' }}>
              <Stack gap="xs">
                <TextInput
                  placeholder="Nazwa etykiety"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  size="xs"
                  autoFocus
                />
                <Group gap="xs">
                  {LABEL_COLORS.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      size={20}
                      onClick={() => setNewColor(color)}
                      style={{
                        cursor: 'pointer',
                        border: newColor === color ? '2px solid #3b82f6' : '2px solid transparent'
                      }}
                    />
                  ))}
                </Group>
                <Group justify="flex-end" gap="xs">
                  <Button
                    size="xs"
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
                    size="xs"
                    onClick={handleSubmitNew}
                    disabled={!newName.trim()}
                  >
                    Dodaj
                  </Button>
                </Group>
              </Stack>
            </Box>
          )}

          {labels.length === 0 ? (
            <Text size="xs" c="dimmed" ta="center" py="md" fs="italic">
              Brak etykiet. Dodaj pierwszą!
            </Text>
          ) : (
            labels.map((label) => (
              <Box
                key={label.id}
                p="xs"
                style={{
                  backgroundColor: editingId === label.id ? '#f9fafb' : 'transparent',
                  borderRadius: '4px'
                }}
              >
                {editingId === label.id ? (
                  <Stack gap="xs">
                    <TextInput
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      size="xs"
                    />
                    <Group gap="xs">
                      {LABEL_COLORS.map((color) => (
                        <ColorSwatch
                          key={color}
                          color={color}
                          size={20}
                          onClick={() => setEditColor(color)}
                          style={{
                            cursor: 'pointer',
                            border: editColor === color ? '2px solid #3b82f6' : '2px solid transparent'
                          }}
                        />
                      ))}
                    </Group>
                    <Group justify="flex-end" gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => setEditingId(null)}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="green"
                        onClick={() => handleSubmitEdit(label.id)}
                      >
                        <IconCheck size={14} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                ) : (
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                      <ColorSwatch color={label.color} size={16} />
                      <Text
                        size="xs"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {label.name}
                      </Text>
                    </Group>
                    <Group gap={4}>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        onClick={() => handleStartEdit(label)}
                      >
                        <IconEdit size={12} />
                      </ActionIcon>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(label.id)}
                      >
                        <IconTrash size={12} />
                      </ActionIcon>
                    </Group>
                  </Group>
                )}
              </Box>
            ))
          )}
        </Stack>
      </Collapse>
    </Box>
  );
}