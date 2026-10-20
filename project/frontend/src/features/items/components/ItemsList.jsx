import { useState, useEffect } from 'react';
import { Box, Button, Center, Loader, Stack, Text } from '@mantine/core';
import { IconFolderOpen, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../../shared/utils/api';
import ItemsToolbar from './ItemsToolbar';
import ItemsTable from './ItemsTable';
import ItemModal from './ItemModal';
import ActionPanel from './ActionPanel';
import { useRefresh, useRefreshVersion } from '../../../shared/store/refreshStore';
import { itemAuthorNames } from '../../../shared/utils/authors';
import { confirmAction } from '../../../shared/utils/confirm';

export default function ItemsList({ 
  collectionId, 
  viewType, 
  workspaceId = null,
  onItemSelect 
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [columnState, setColumnState] = useState(null);

  const itemsVersion = useRefreshVersion('items');
  const refresh = useRefresh();
  // Item changes also change item counts shown next to collections and workspaces.
  const refreshItems = () => refresh('items', 'collections', 'workspaces');

  useEffect(() => {
    fetchItems();
  }, [collectionId, viewType, workspaceId]);

  // Refetch in the background after changes made anywhere in the app (no loader flash).
  useEffect(() => {
    if (itemsVersion > 0) fetchItems({ silent: true });
  }, [itemsVersion]);

  const fetchItems = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      let response;
      
      if (workspaceId && collectionId) {
        response = await api.get(`/workspaces/${workspaceId}/collections/${collectionId}/items`);
      } 
      else if (viewType === 'all') {
        response = await api.get('/items');
      } else if (viewType === 'favorites') {
        response = await api.get('/items?favorite=true');
      } else if (viewType === 'collection' && collectionId) {
        response = await api.get(`/collections/${collectionId}/items`);
      } else {
        response = await api.get('/items');
      }

      const data = response?.data?.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
      // Show the server's reason (e.g. no access, collection deleted) instead of a generic message.
      notifications.show({
        title: 'Nie udało się pobrać pozycji',
        message: err.response?.data?.message || 'Sprawdź połączenie i spróbuj ponownie.',
        color: 'red',
      });
      setItems([]);
    }
    setLoading(false);
  };

  const handleCreate = async (itemData) => {
    try {
      let response;

      if (workspaceId && collectionId) {
        response = await api.post(`/workspaces/${workspaceId}/collections/${collectionId}/items`, itemData);
      } else {
        response = await api.post('/items', itemData);
      }

      if (response.data) {
        notifications.show({
          title: 'Sukces!',
          message: 'Dodano pozycję',
          color: 'green',
        });
        refreshItems();
        return true;
      }
    } catch (err) {
      console.error('Error creating item:', err);
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się dodać pozycji',
        color: 'red',
      });
      return false;
    }
  };

  const handleUpdate = async (itemId, itemData) => {
    try {
      const response = await api.put(`/items/${itemId}`, itemData);

      if (response.data) {
        notifications.show({
          title: 'Sukces!',
          message: 'Zapisano zmiany',
          color: 'green',
        });
        refreshItems();
        return true;
      }
    } catch (err) {
      console.error('Error updating item:', err);
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się zapisać zmian',
        color: 'red',
      });
      return false;
    }
  };

  const handleDelete = async (itemId) => {
    if (!(await confirmAction({ title: 'Przenieść do kosza?', message: 'Pozycję możesz później przywrócić z kosza.', confirmLabel: 'Przenieś do kosza' }))) {
      return;
    }

    try {
      await api.delete(`/items/${itemId}`);
      notifications.show({
        title: 'Sukces!',
        message: 'Przeniesiono do kosza',
        color: 'green',
      });
      refreshItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się usunąć pozycji',
        color: 'red',
      });
    }
  };

  const handleToggleFavorite = async (itemId, currentFavorite) => {
    try {
      await api.put(`/items/${itemId}`, {
        favorite: !currentFavorite
      });
      
      notifications.show({
        title: 'Sukces!',
        message: currentFavorite ? 'Usunięto z ulubionych' : 'Dodano do ulubionych',
        color: 'green',
      });
      
      refreshItems();
    } catch (err) {
      console.error('Error toggling favorite:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się zaktualizować',
        color: 'red',
      });
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedItemIds.length === items.length && items.length > 0) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map(i => i.id));
    }
  };

  const handleToggleSelect = (itemId) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (itemData) => {
    if (editItem) {
      const success = await handleUpdate(editItem.id, itemData);
      if (success) {
        setModalOpened(false);
        setEditItem(null);
      }
    } else {
      const success = await handleCreate(itemData);
      if (success) {
        setModalOpened(false);
        setEditItem(null);
      }
    }
  };

  const filteredItems = items.filter(item => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = (
        item.title?.toLowerCase().includes(searchLower) ||
        itemAuthorNames(item).some(name => name.toLowerCase().includes(searchLower)) ||
        item.year?.toString().includes(searchLower) ||
        item.itemType?.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    if (selectedLabels.length > 0) {
      const itemLabelIds = item.labels?.map(l => l.id) || [];
      const hasSelectedLabel = selectedLabels.some(labelId => 
        itemLabelIds.includes(labelId)
      );
      if (!hasSelectedLabel) return false;
    }

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'dateAdded':
        return new Date(b.dateAdded || b.createdAt) - new Date(a.dateAdded || a.createdAt);
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'year':
        return (b.year || 0) - (a.year || 0);
      case 'author':
        return (itemAuthorNames(a)[0] || '').localeCompare(itemAuthorNames(b)[0] || '');
      default:
        return 0;
    }
  });

  const currentCollectionId = (viewType === 'collection' && collectionId) 
    ? collectionId 
    : (workspaceId && collectionId) 
      ? collectionId 
      : null;

  if (loading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size="lg" color="violet" />
      </Center>
    );
  }

  return (
    <Box p="md" style={{ paddingBottom: selectedItemIds.length > 0 ? '100px' : '16px' }}>
      <ItemsToolbar
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedLabels={selectedLabels}
        onLabelsChange={setSelectedLabels}
        columnState={columnState}
      />

      {items.length === 0 ? (
        // An empty view is a normal state, not an error – say why it is empty and what to do.
        <Stack align="center" gap="xs" py={60} ta="center">
          <IconFolderOpen size={48} stroke={1.3} style={{ color: 'var(--mantine-color-placeholder)' }} />
          <Text fw={600}>
            {viewType === 'favorites' ? 'Brak ulubionych pozycji' : viewType === 'all' ? 'Nie masz jeszcze żadnych pozycji' : 'Ta kolekcja jest pusta'}
          </Text>
          <Text size="sm" c="dimmed" maw={420}>
            {viewType === 'favorites'
              ? 'Kliknij serduszko przy pozycji, żeby dodać ją do ulubionych.'
              : viewType === 'all'
                ? 'Dodaj pierwszą publikację – wystarczy DOI, ISBN albo identyfikator arXiv.'
                : 'Wszystkie Twoje pozycje znajdziesz w zakładce „Wszystkie”. Możesz je tu przenieść albo dodać nową.'}
          </Text>
          {viewType !== 'favorites' && (
            <Button mt="xs" variant="light" color="violet" leftSection={<IconPlus size={16} />}
              onClick={() => { setEditItem(null); setModalOpened(true); }}>
              Dodaj publikację
            </Button>
          )}
        </Stack>
      ) : (
      <ItemsTable
        filteredItems={sortedItems}
        selectedItemIds={selectedItemIds}
        onToggleSelectAll={handleToggleSelectAll}
        onItemSelect={onItemSelect}
        onEdit={(item) => {
          setEditItem(item);
          setModalOpened(true);
        }}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onToggleSelect={handleToggleSelect}
        onColumnStateChange={setColumnState}
        onRefresh={refreshItems}
        isWorkspace={!!workspaceId}
      />
      )}

      <ItemModal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditItem(null);
        }}
        onSubmit={handleSubmit}
        editItem={editItem}
        defaultCollectionId={
          collectionId !== 'all' && 
          collectionId !== 'favorites' && 
          collectionId !== 'trash' &&
          collectionId !== 'labels'
            ? collectionId 
            : null
        }
        workspaceId={workspaceId}
      />

      {selectedItemIds.length > 0 && (
        <ActionPanel
          selectedItemIds={selectedItemIds}
          onClose={() => setSelectedItemIds([])}
          onRefresh={refreshItems}
          currentWorkspaceId={workspaceId}
          currentCollectionId={currentCollectionId}
        />
      )}
    </Box>
  );
}