import { useState, useEffect, useMemo } from 'react';
import { useItemsStore } from '../store/itemsStore';
import itemsService from '../services/itemsService';
import { notifications } from '@mantine/notifications';
import { useRefresh, useRefreshVersion } from '../../../shared/store/refreshStore';
import { formatAuthors, itemAuthorNames } from '../../../shared/utils/authors';

export function useItems(collectionId, viewType) {
  const {
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,
    selectedItemIds,
    setSelectedItemIds,
    loading,
    setLoading,
  } = useItemsStore();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const itemsVersion = useRefreshVersion('items');
  const refresh = useRefresh();
  // Item changes also change item counts shown next to collections and workspaces.
  const refreshItems = () => refresh('items', 'collections', 'workspaces');

  useEffect(() => {
    fetchItems();
  }, [collectionId, viewType]);

  // Refetch in the background after changes made anywhere in the app.
  useEffect(() => {
    if (itemsVersion > 0) fetchItems({ silent: true });
  }, [itemsVersion]);

  const fetchItems = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      let result;

      if (viewType === 'trash' || collectionId === 'trash') {
        result = await itemsService.getTrash();
      } else {
        const filters = {};
        
        if (collectionId && collectionId !== 'all' && collectionId !== 'favorites') {
          filters.collectionId = collectionId;
        }

        result = await itemsService.getAll(filters);
      }
      
            
      if (result.success) {
        setItems(result.data || []);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się pobrać pozycji',
        color: 'red',
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (itemData) => {
    
    try {
      const result = await itemsService.create(itemData);
      
      
      if (result.success) {
        addItem(result.data);
        refreshItems();
        notifications.show({
          title: 'Sukces!',
          message: 'Dodano pozycję',
          color: 'green',
        });
        return true;
      }
      return false;
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

  const handleUpdate = async (id, itemData) => {
    
    try {
      const result = await itemsService.update(id, itemData);
      
      
      if (result.success) {
        updateItem(id, result.data);
        refreshItems();
        notifications.show({
          title: 'Sukces!',
          message: 'Zapisano zmiany',
          color: 'green',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się zapisać zmian',
        color: 'red',
      });
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await itemsService.delete(id);
      
      if (result.success) {
        removeItem(id);
        refreshItems();
        notifications.show({
          title: 'Sukces!',
          message: 'Przeniesiono do kosza',
          color: 'green',
        });
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się usunąć pozycji',
        color: 'red',
      });
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const result = await itemsService.toggleFavorite(id);
      
      if (result.success) {
        updateItem(id, { favorite: result.data.favorite });
        refreshItems();
        notifications.show({
          title: result.data.favorite ? 'Dodano do ulubionych' : 'Usunięto z ulubionych',
          message: '',
          color: 'blue',
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się zmienić ulubionych',
        color: 'red',
      });
    }
  };

  const handleRestore = async (id) => {
    try {
      const result = await itemsService.restore(id);
      
      if (result.success) {
        removeItem(id);
        notifications.show({
          title: 'Przywrócono!',
          message: 'Przywrócono pozycję z kosza',
          color: 'green',
        });
        refreshItems();
      }
    } catch (err) {
      console.error('Error restoring item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się przywrócić pozycji',
        color: 'red',
      });
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Na pewno USUNĄĆ NA ZAWSZE? Tej operacji nie można cofnąć!')) {
      return;
    }

    try {
      const result = await itemsService.permanentDelete(id);
      
      if (result.success) {
        removeItem(id);
        refreshItems();
        notifications.show({
          title: 'Usunięto!',
          message: 'Pozycja usunięta na zawsze',
          color: 'green',
        });
      }
    } catch (err) {
      console.error('Error permanent deleting item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się usunąć pozycji',
        color: 'red',
      });
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Opróżnić kosz? Wszystkie pozycje zostaną usunięte na zawsze.')) {
      return;
    }

    try {
      const result = await itemsService.emptyTrash();
      
      if (result.success) {
        setItems([]);
        refreshItems();
        notifications.show({
          title: 'Kosz opróżniony!',
          message: 'Wszystkie pozycje zostały usunięte',
          color: 'green',
        });
      }
    } catch (err) {
      console.error('Error emptying trash:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się opróżnić kosza',
        color: 'red',
      });
    }
  };

  const filteredItems = useMemo(() => {
    
    let result = [...items];

    const isTrash = viewType === 'trash' || collectionId === 'trash';
    if (!isTrash) {
      if (viewType === 'favorites' || collectionId === 'favorites') {
        result = result.filter(item => item.favorite === true);
      }

      if (collectionId && collectionId !== 'all' && collectionId !== 'favorites') {
        result = result.filter(item => item.collectionId === collectionId);
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) => {
        const authorText = formatAuthors(item);

        return (
          item.title.toLowerCase().includes(searchLower) ||
          authorText.toLowerCase().includes(searchLower)
        );
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.year || 0) - (a.year || 0);
        case 'oldest':
          return (a.year || 0) - (b.year || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author': {
          return (itemAuthorNames(a)[0] || '').localeCompare(itemAuthorNames(b)[0] || '');
        }
        default:
          return 0;
      }
    });

    
    return result;
  }, [items, search, sortBy, viewType, collectionId]);

  return {
    items: filteredItems,
    loading,
    search,
    setSearch,
    sortBy,
    setSortBy,
    selectedItemIds,
    setSelectedItemIds,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleFavorite,
    handleRestore,
    handlePermanentDelete,
    handleEmptyTrash,
    fetchItems,
  };
}