import {
  Modal,
  Stack,
  Text,
  Group,
  Checkbox,
  Button,
  ColorSwatch,
  Badge
} from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useLabels } from '../../labels/hooks/useLabels';

export default function FilterModal({ opened, onClose, selectedLabels = [], onApply }) {
  const { labels } = useLabels();
  const [tempSelectedLabels, setTempSelectedLabels] = useState([]);

  useEffect(() => {
    if (opened) {
      setTempSelectedLabels(selectedLabels);
    }
  }, [opened, selectedLabels]);

  const handleToggleLabel = (labelId) => {
    setTempSelectedLabels(prev => {
      if (prev.includes(labelId)) {
        return prev.filter(id => id !== labelId);
      } else {
        return [...prev, labelId];
      }
    });
  };

  const handleApply = () => {
    onApply(tempSelectedLabels);
    onClose();
  };

  const handleClear = () => {
    setTempSelectedLabels([]);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconFilter size={20} />
          <Text fw={600}>Filtruj pozycje</Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Etykiety
            </Text>
            {tempSelectedLabels.length > 0 && (
              <Button size="xs" variant="subtle" onClick={handleClear}>
                Wyczyść
              </Button>
            )}
          </Group>

          {labels.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              Brak etykiet do filtrowania
            </Text>
          ) : (
            <Stack gap="xs">
              {labels.map((label) => {
                const isSelected = tempSelectedLabels.includes(label.id);
                
                return (
                  <Group
                    key={label.id}
                    p="xs"
                    onClick={() => handleToggleLabel(label.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
                      borderRadius: '4px',
                      border: isSelected ? '2px solid #6366f1' : '2px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleLabel(label.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <ColorSwatch color={label.color} size={20} />
                    
                    <Text size="sm" style={{ flex: 1 }}>
                      {label.name}
                    </Text>
                  </Group>
                );
              })}
            </Stack>
          )}
        </div>

        {tempSelectedLabels.length > 0 && (
          <Badge size="sm" variant="light">
            Wybrano: {tempSelectedLabels.length}
          </Badge>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={handleApply}>
            Zastosuj
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}