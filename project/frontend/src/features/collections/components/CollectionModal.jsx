import { 
  Modal, 
  TextInput, 
  Textarea, 
  Button, 
  Stack, 
  Group,
  Select,
  Text
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { IconFolder } from '@tabler/icons-react';

export default function CollectionModal({ 
  opened, 
  onClose, 
  onSuccess, 
  editCollection,
  collections = []
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      if (editCollection) {
        setName(editCollection.name || '');
        setDescription(editCollection.description || '');
        setParentId(editCollection.parentId ? String(editCollection.parentId) : null);
      } else {
        setName('');
        setDescription('');
        setParentId(null);
      }
    }
  }, [opened, editCollection]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Podaj nazwę kolekcji');
      return;
    }

    setLoading(true);

    const data = {
      name: name.trim(),
      description: description.trim(),
      parentId: parentId && parentId !== 'null' ? parentId : null
    };


    const success = await onSuccess(data, editCollection?.id);
    
    setLoading(false);

    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setParentId(null);
    onClose();
  };

  const parentOptions = collections
    .filter(col => col.id !== editCollection?.id)
    .map(col => ({
      value: String(col.id),
      label: col.name
    }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconFolder size={20} style={{ color: 'var(--mantine-primary-color-filled)' }} />
          <Text fw={600}>
            {editCollection ? 'Edytuj kolekcję' : 'Nowa kolekcja'}
          </Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Nazwa kolekcji"
          placeholder="np. Artykuły naukowe 2024"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <Textarea
          label="Opis (opcjonalnie)"
          placeholder="Krótki opis kolekcji..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
        />

        <Select
          label="Kolekcja nadrzędna (opcjonalnie)"
          placeholder="Wybierz..."
          description="Kolekcje zagnieżdżone nie mogą być udostępniane innym użytkownikom"
          data={[
            { value: 'null', label: '(Brak - główna kolekcja)' },
            ...parentOptions
          ]}
          value={parentId || 'null'}
          onChange={(value) => setParentId(value === 'null' ? null : value)}
          clearable
        />

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
            {editCollection ? 'Zapisz' : 'Utwórz'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}