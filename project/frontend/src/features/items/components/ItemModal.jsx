import { useState, useEffect } from 'react';
import { Modal, Stack, Alert, TextInput, Select, Group, Button, Textarea, Text, Switch } from '@mantine/core';
import { IconWand } from '@tabler/icons-react';
import api from '../../../shared/utils/api';
import { useCollectionsStore } from '../../collections/store/collectionsStore';
import { useWorkspaceStore } from '../../workspaces/store/workspaceStore';
import { formatAuthors } from '../../../shared/utils/authors';

const TYPE_MAP = {
  'journal-article': 'article',
  'book-chapter': 'chapter',
  'proceedings-article': 'conference',
  'dissertation': 'thesis',
  'book': 'book',
  'article': 'article',
  'chapter': 'chapter',
  'conference': 'conference',
  'thesis': 'thesis'
};

// Which metadata key holds the publication venue shown in the "publisher" field.
const VENUE_KEYS = ['journal', 'publisher', 'booktitle', 'conference'];
const venueKeyOf = (item) => VENUE_KEYS.find((key) => item?.metadata?.[key]) || 'publisher';

export default function ItemModal({ opened, onClose, onSubmit, editItem, defaultCollectionId, workspaceId }) {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState('article');
  const [publisher, setPublisher] = useState('');
  const [pages, setPages] = useState('');
  const [isbn, setIsbn] = useState('');
  const [doi, setDoi] = useState('');
  const [abstract, setAbstract] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [error, setError] = useState('');
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [useWorkspace, setUseWorkspace] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [workspaceCollections, setWorkspaceCollections] = useState([]);
  
  const { collections } = useCollectionsStore();
  const { workspaces } = useWorkspaceStore();

  useEffect(() => {
    if (useWorkspace && selectedWorkspaceId) {
      fetchWorkspaceCollections(selectedWorkspaceId);
    } else {
      setWorkspaceCollections([]);
    }
  }, [useWorkspace, selectedWorkspaceId]);

  const fetchWorkspaceCollections = async (wsId) => {
    try {
      const response = await api.get(`/workspaces/${wsId}/collections`);
      const data = response?.data?.data || response?.data || [];
      setWorkspaceCollections(data);
    } catch (err) {
      setWorkspaceCollections([]);
    }
  };

  useEffect(() => {
    if (opened) {
      if (editItem) {
        setTitle(editItem.title || '');
        setAuthors(extractAuthors(editItem));
        setYear(editItem.year || new Date().getFullYear());
        setType(editItem.itemType || 'article');
        setPublisher(editItem.metadata?.[venueKeyOf(editItem)] || '');
        setPages(editItem.pages || editItem.metadata?.pages || '');
        setIsbn(editItem.isbn || editItem.metadata?.isbn || '');
        setDoi(editItem.doi || editItem.metadata?.doi || '');
        setAbstract(editItem.abstract || editItem.metadata?.abstract || '');
        setNotes(editItem.notes || '');
        setSelectedCollectionId(editItem.collectionId || defaultCollectionId || '');
        
      } else {
     
        resetForm();
        if (workspaceId) {
          setUseWorkspace(true);
          setSelectedWorkspaceId(workspaceId);
          setSelectedCollectionId(defaultCollectionId || '');
        } else {
          setUseWorkspace(false);
          setSelectedWorkspaceId('');
          setSelectedCollectionId(defaultCollectionId || '');
        }
      }
      setError('');
    }
  }, [editItem, opened, defaultCollectionId, workspaceId]);

  const extractAuthors = (item) => formatAuthors(item);

  const resetForm = () => {
    setTitle('');
    setAuthors('');
    setYear(new Date().getFullYear());
    setType('article');
    setPublisher('');
    setPages('');
    setIsbn('');
    setDoi('');
    setAbstract('');
    setNotes('');
  };

  const handleToggleWorkspace = (checked) => {
    setUseWorkspace(checked);
    setSelectedCollectionId('');
    setSelectedWorkspaceId('');
    setWorkspaceCollections([]);
  };

  const handleWorkspaceChange = (value) => {
    setSelectedWorkspaceId(value || '');
    setSelectedCollectionId(''); 
  };

  const handleAutoFill = async () => {
    if (!doi.trim()) {
      setError('Wpisz identyfikator najpierw');
      return;
    }

    setAutoFillLoading(true);
    setError('');

    try {
      const response = await api.post('/metadata/fetch', { identifier: doi.trim() });

      if (!response.data?.success) {
        setError(response.data?.message || 'Blad pobierania metadanych');
        setAutoFillLoading(false);
        return;
      }

      const data = response.data.data;
      if (!data) {
        setError('Brak metadanych w odpowiedzi');
        setAutoFillLoading(false);
        return;
      }

      if (data.title) setTitle(data.title);
      
      if (data.metadata?.authors?.length > 0) {
        setAuthors(data.metadata.authors.map(a => a.fullName || `${a.firstName} ${a.lastName}`.trim()).join(', '));
      } else if (data.authors?.length > 0) {
        setAuthors(data.authors.join(', '));
      } else if (data.author) {
        setAuthors(data.author);
      }

      if (data.year) setYear(data.year);
      if (data.itemType || data.type) setType(TYPE_MAP[data.itemType || data.type] || 'article');
      if (data.metadata?.publisher || data.metadata?.journal) setPublisher(data.metadata.publisher || data.metadata.journal);
      if (data.metadata?.pages) setPages(String(data.metadata.pages));
      if (data.metadata?.isbn) setIsbn(data.metadata.isbn);
      if (data.metadata?.abstract) setAbstract(data.metadata.abstract);

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Nie znaleziono metadanych');
    } finally {
      setAutoFillLoading(false);
    }
  };

const handleSubmit = () => {
  if (!title.trim()) {
    setError('Wypelnij tytul');
    return;
  }

  if (useWorkspace && !selectedWorkspaceId) {
    setError('Wybierz przestrzen robocza');
    return;
  }

  if (useWorkspace && !selectedCollectionId) {
    setError('Wybierz kolekcje w przestrzeni roboczej');
    return;
  }

  // The single "publisher / journal" field: when editing, write back to the key it was read from,
  // so a journal does not suddenly become a publisher (or the other way round).
  const venue = editItem
    ? { [venueKeyOf(editItem)]: publisher || null }
    : { publisher: publisher || null, journal: publisher || null };

  // Only the fields this form shows; the server merges them into the existing metadata,
  // so url, booktitle, volume etc. are kept.
  const itemData = {
    title: title.trim(),
    year: year ? parseInt(year) : null,
    itemType: type,
    collectionId: selectedCollectionId || null,
    metadata: {
      authors: authors
        ? authors.split(',').map(a => ({ fullName: a.trim() })).filter(a => a.fullName)
        : [],
      ...venue,
      pages: pages || null,
      isbn: isbn || null,
      doi: doi || null,
      abstract: abstract || null,
    }
  };

  if (!useWorkspace) {
    itemData.notes = notes.trim() || null;
  }

  if (useWorkspace && selectedWorkspaceId) {
    itemData.workspaceId = selectedWorkspaceId;
  }

  onSubmit(itemData);
  onClose();
};

  const workspaceOptions = workspaces.map(ws => ({
    value: ws.id,
    label: ws.name
  }));

  const collectionOptions = useWorkspace
    ? workspaceCollections.map(c => ({ value: c.id, label: c.name }))
    : [
        { value: '', label: 'Wszystkie (bez kolekcji)' },
        ...collections.map(c => ({ value: c.id, label: c.name }))
      ];

  const showToggle = !editItem;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editItem ? 'Edytuj pozycje' : 'Dodaj pozycje'}
      size="lg"
    >
      <Stack gap="sm">
        {error && (
          <Alert color="red" withCloseButton onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {showToggle && (
          <Switch
            label="Dodaj do przestrzeni roboczej"
            checked={useWorkspace}
            onChange={(e) => handleToggleWorkspace(e.currentTarget.checked)}
          />
        )}

        {showToggle && useWorkspace && (
          <Select
            label="Przestrzen robocza"
            placeholder="Wybierz przestrzen robocza"
            data={workspaceOptions}
            value={selectedWorkspaceId}
            onChange={handleWorkspaceChange}
            required
            clearable
          />
        )}

        <Select
          label={useWorkspace ? "Kolekcja (wymagana)" : "Kolekcja (opcjonalna)"}
          placeholder="Wybierz kolekcje"
          required={useWorkspace}
          value={selectedCollectionId}
          onChange={(value) => setSelectedCollectionId(value || '')}
          data={collectionOptions}
          searchable
          clearable={!useWorkspace}
          disabled={useWorkspace && !selectedWorkspaceId}
        />

        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>DOI / ISBN / PMID / arXiv</Text>
            <Button
              size="xs"
              variant="light"
              color="violet"
              leftSection={<IconWand size={14} />}
              onClick={handleAutoFill}
              loading={autoFillLoading}
              disabled={!doi.trim()}
            >
              Auto-uzupelnij
            </Button>
          </Group>
          <TextInput
            placeholder="np. 10.4236/as.2025.1612078"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
          />
          <Text size="xs" c="dimmed" fs="italic">
            Wklej identyfikator i kliknij "Auto-uzupelnij"
          </Text>
        </Stack>

        <TextInput
          label="Tytul"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextInput
          label="Autorzy (oddziel przecinkami)"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          placeholder="Jan Kowalski, Maria Nowak"
        />

        <Group grow>
          <Select
            label="Typ"
            data={[
              { value: 'article', label: 'Artykul' },
              { value: 'book', label: 'Ksiazka' },
              { value: 'chapter', label: 'Rozdzial' },
              { value: 'thesis', label: 'Praca dyplomowa' },
              { value: 'conference', label: 'Konferencja' },
            ]}
            value={type}
            onChange={setType}
          />
          <TextInput
            label="Rok"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </Group>

        <TextInput
          label="Wydawca / Dziennik / Konferencja"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
        />

        <TextInput
          label="ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />

        <Textarea
          label="Abstrakt"
          minRows={2}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
        />

        {!useWorkspace && (
          <Textarea
            label="Notatki prywatne"
            minRows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Twoje prywatne notatki do tej pozycji..."
          />
        )}

        <Group justify="flex-end" mt="sm">
          <Button variant="subtle" onClick={onClose}>Anuluj</Button>
          <Button onClick={handleSubmit} color="violet">
            {editItem ? 'Zapisz' : 'Dodaj'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}