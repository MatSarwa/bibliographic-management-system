import { 
  Modal, 
  TextInput, 
  Button, 
  Stack, 
  Group,
  Text
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { IconFolder, IconEdit } from '@tabler/icons-react';
import ColorPicker from '../../../shared/components/ColorPicker';

export default function WorkspaceCollectionModal({ 
  opened, 
  onClose, 
  onSuccess,
  workspace,
  editCollection
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  const isEditMode = !!editCollection;

  useEffect(() => {
    if (opened) {
      if (editCollection) {
        setName(editCollection.name || '');
        setColor(editCollection.settings?.color || 'var(--mantine-primary-color-filled)');
      } else {
        resetForm();
      }
    }
  }, [opened, editCollection]);

  const resetForm = () => {
    setName('');
    setColor('var(--mantine-primary-color-filled)');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Podaj nazwę kolekcji');
      return;
    }

    setLoading(true);

    const data = {
      name: name.trim(),
      settings: { color }
    };


    const success = await onSuccess(data, editCollection?.id);
    
    setLoading(false);

    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          {isEditMode ? (
            <IconEdit size={20} style={{ color: 'var(--mantine-primary-color-filled)' }} />
          ) : (
            <IconFolder size={20} style={{ color: 'var(--mantine-primary-color-filled)' }} />
          )}
          <Text fw={600}>
            {isEditMode 
              ? `Edytuj kolekcję "${editCollection?.name}"`
              : `Nowa kolekcja w "${workspace?.name}"`
            }
          </Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Nazwa kolekcji"
          placeholder="np. Artykuły 2024"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <ColorPicker value={color} onChange={setColor} />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose}>
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            loading={loading}
            color="violet"
          >
            {isEditMode ? 'Zapisz' : 'Utwórz'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}