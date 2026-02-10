import {
  Modal,
  Stack,
  Text,
  Group,
  Checkbox,
  Button,
  Badge,
  ColorSwatch,
  Loader,
  Center
} from '@mantine/core';
import { IconTag } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useLabels } from '../hooks/useLabels';
import labelsService from '../services/labelsService';
import { notifications } from '@mantine/notifications';

export default function AssignLabelsModal({ opened, onClose, item, onSuccess }) {
  const { labels, loading } = useLabels();
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (opened && item) {
      const currentLabelIds = item.labels?.map(l => l.id) || [];
      setSelectedLabelIds(currentLabelIds);
    }
  }, [opened, item]);

  const handleToggleLabel = (labelId) => {
    setSelectedLabelIds(prev => {
      if (prev.includes(labelId)) {
        return prev.filter(id => id !== labelId);
      } else {
        return [...prev, labelId];
      }
    });
  };

  const handleSubmit = async () => {
    if (!item) return;

    setSubmitting(true);
    const result = await labelsService.assignToItem(item.id, selectedLabelIds);
    setSubmitting(false);

    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: 'Etykiety zaktualizowane',
        color: 'green',
      });
      onSuccess?.();
      onClose();
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconTag size={20} />
          <Text fw={600}>Zarządzaj etykietami</Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {item?.title}
        </Text>

        {loading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : labels.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Brak etykiet. Utwórz pierwszą w panelu po lewej stronie.
          </Text>
        ) : (
          <Stack gap="xs">
            {labels.map((label) => {
              const isSelected = selectedLabelIds.includes(label.id);
              
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

        {selectedLabelIds.length > 0 && (
          <Badge size="sm" variant="light">
            Wybrano: {selectedLabelIds.length}
          </Badge>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={labels.length === 0}
          >
            Zapisz
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}