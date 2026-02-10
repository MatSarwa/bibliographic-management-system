import { useState, useEffect } from 'react';
import { Box, Center, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import api from '../../../shared/utils/api';
import ItemsToolbar from './ItemsToolbar';
import ItemsTable from './ItemsTable';
import ItemModal from './ItemModal';
import ActionPanel from './ActionPanel';

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

  useEffect(() => {
    fetchItems();
  }, [collectionId, viewType, workspaceId]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let response;
      
      if (workspaceId && collectionId) {
        console.log('Fetching workspace items:', { workspaceId, collectionId });
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

      const data = response?.data?.data || response?.data || [];
      console.log('Items fetched:', data.length);
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się pobrać itemów',
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
          message: 'Item dodany',
          color: 'green',
        });
        fetchItems();
        return true;
      }
    } catch (err) {
      console.error('Error creating item:', err);
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się dodać itemu',
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
          message: 'Item zaktualizowany',
          color: 'green',
        });
        fetchItems();
        return true;
      }
    } catch (err) {
      console.error('Error updating item:', err);
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się zaktualizować itemu',
        color: 'red',
      });
      return false;
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Czy na pewno usunąć ten item?')) {
      return;
    }

    try {
      await api.delete(`/items/${itemId}`);
      notifications.show({
        title: 'Sukces!',
        message: 'Item usunięty',
        color: 'green',
      });
      fetchItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się usunąć itemu',
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
      
      fetchItems();
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
        item.metadata?.authors?.some(author => 
          author.toLowerCase().includes(searchLower)
        ) ||
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
        const authorA = a.metadata?.authors?.[0] || '';
        const authorB = b.metadata?.authors?.[0] || '';
        return authorA.localeCompare(authorB);
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
        onRefresh={fetchItems}
        isWorkspace={!!workspaceId}
      />

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
          onRefresh={fetchItems}
          currentWorkspaceId={workspaceId}
          currentCollectionId={currentCollectionId}
        />
      )}
    </Box>
  );
}