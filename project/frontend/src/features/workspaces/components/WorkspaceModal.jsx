import { 
  Modal, 
  TextInput, 
  Textarea, 
  Button, 
  Stack, 
  Group,
  Text
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { IconBriefcase } from '@tabler/icons-react';
import ColorPicker from '../../../shared/components/ColorPicker';

export default function WorkspaceModal({ 
  opened, 
  onClose, 
  onSuccess, 
  editWorkspace 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  const isEditMode = !!editWorkspace;

  useEffect(() => {
    if (opened) {
      if (editWorkspace) {
        setName(editWorkspace.name || '');
        setDescription(editWorkspace.description || '');
        setColor(editWorkspace.settings?.color || 'var(--mantine-primary-color-filled)');
      } else {
        resetForm();
      }
    }
  }, [opened, editWorkspace]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('var(--mantine-primary-color-filled)');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Podaj nazwę workspace');
      return;
    }

    setLoading(true);

    const data = {
      name: name.trim(),
      description: description.trim(),
      settings: { color }
    };


    const success = await onSuccess(data, editWorkspace?.id);
    
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
          <IconBriefcase size={20} style={{ color: 'var(--mantine-primary-color-filled)' }} />
          <Text fw={600}>
            {isEditMode ? 'Edytuj Workspace' : 'Nowy Workspace'}
          </Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Nazwa workspace"
          placeholder="np. Zespół Redakcyjny 2024"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <Textarea
          label="Opis (opcjonalnie)"
          placeholder="Krótki opis workspace..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
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