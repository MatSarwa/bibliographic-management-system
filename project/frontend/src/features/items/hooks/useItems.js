import { useState, useEffect, useMemo } from 'react';
import { useItemsStore } from '../store/itemsStore';
import itemsService from '../services/itemsService';
import { notifications } from '@mantine/notifications';

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

  useEffect(() => {
    fetchItems();
  }, [collectionId, viewType]);

  const fetchItems = async () => {
    
    setLoading(true);
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
        message: 'Nie udało się pobrać items',
        color: 'red',
      });
      setItems([]);
    } finally {
      setLoading(false);
      console.log('useItems.fetchItems - END');
      console.log('========================================');
    }
  };

  const handleCreate = async (itemData) => {
    
    try {
      const result = await itemsService.create(itemData);
      
      
      if (result.success) {
        addItem(result.data);
        console.log('Item added to store:', result.data);
        notifications.show({
          title: 'Sukces!',
          message: 'Item dodany',
          color: 'green',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating item:', err);
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się dodać item',
        color: 'red',
      });
      return false;
    } finally {
      console.log('========================================');
    }
  };

  const handleUpdate = async (id, itemData) => {
    
    try {
      const result = await itemsService.update(id, itemData);
      
      console.log('Update result:', result);
      
      if (result.success) {
        updateItem(id, result.data);
        console.log('Item updated in store');
        notifications.show({
          title: 'Sukces!',
          message: 'Item zaktualizowany',
          color: 'green',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się zaktualizować item',
        color: 'red',
      });
      return false;
    } finally {
      console.log('========================================');
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await itemsService.delete(id);
      
      if (result.success) {
        removeItem(id);
        notifications.show({
          title: 'Sukces!',
          message: 'Item przeniesiony do kosza',
          color: 'green',
        });
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się usunąć item',
        color: 'red',
      });
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const result = await itemsService.toggleFavorite(id);
      
      if (result.success) {
        updateItem(id, { favorite: result.data.favorite });
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
        message: 'Nie udało się zmienić favorite',
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
          message: 'Item przywrócony z kosza',
          color: 'green',
        });
        fetchItems();
      }
    } catch (err) {
      console.error('Error restoring item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się przywrócić item',
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
        notifications.show({
          title: 'Usunięto!',
          message: 'Item usunięty na zawsze',
          color: 'green',
        });
      }
    } catch (err) {
      console.error('Error permanent deleting item:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się usunąć item',
        color: 'red',
      });
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('OPRÓŻNIĆ KOSZ? Wszystkie items zostaną usunięte NA ZAWSZE!')) {
      return;
    }

    try {
      const result = await itemsService.emptyTrash();
      
      if (result.success) {
        setItems([]);
        notifications.show({
          title: 'Kosz opróżniony!',
          message: 'Wszystkie items usunięte',
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
    console.log('useItems - FILTERING AND SORTING');
    console.log('Items in store:', items.length);
    
    let result = [...items];

    if (viewType === 'trash' || collectionId === 'trash') {
      console.log('View: TRASH');
    } else {
      if (viewType === 'favorites' || collectionId === 'favorites') {
        console.log('View: FAVORITES');
        result = result.filter(item => item.favorite === true);
      }

      if (collectionId && collectionId !== 'all' && collectionId !== 'favorites') {
        console.log('Filtering by collectionId:', collectionId);
        result = result.filter(item => item.collectionId === collectionId);
      }
    }

    if (search) {
      console.log('Searching for:', search);
      const searchLower = search.toLowerCase();
      result = result.filter((item) => {
        const authorText = Array.isArray(item.authors)
          ? item.authors.join(', ')
          : item.author || '';
        
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
          const aAuthor = Array.isArray(a.authors) ? a.authors[0] : a.author || '';
          const bAuthor = Array.isArray(b.authors) ? b.authors[0] : b.author || '';
          return aAuthor.localeCompare(bAuthor);
        }
        default:
          return 0;
      }
    });

    console.log('Filtered items count:', result.length);
    
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