import { useEffect } from 'react';
import { useCollectionsStore } from '../store/collectionsStore';
import collectionsService from '../services/collectionsService';
import { notifications } from '@mantine/notifications';
import { useRefresh, useRefreshVersion } from '../../../shared/store/refreshStore';

export function useCollections() {
  const {
    collections,
    setCollections,
    addCollection,
    updateCollection,
    removeCollection,
    selectedCollection,
    setSelectedCollection,
    loading,
    setLoading,
  } = useCollectionsStore();

  const collectionsVersion = useRefreshVersion('collections');
  const refresh = useRefresh();

  useEffect(() => {
    fetchCollections();
  }, []);

  // Refetch in the background when collections (or their item counts) change elsewhere.
  useEffect(() => {
    if (collectionsVersion > 0) fetchCollections({ silent: true });
  }, [collectionsVersion]);

  const fetchCollections = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const result = await collectionsService.getAll();

      if (result.success) {
        
        const collectionsWithMembers = await Promise.all(
          result.data.map(async (col) => {
            try {
              const membersResult = await collectionsService.getSharedUsers(col.id);
              
              if (membersResult.success && membersResult.data.sharedWith) {
                return {
                  ...col,
                  itemCount: col.itemCount || 0,
                  sharedWith: membersResult.data.sharedWith 
                };
              }
            } catch {
              // Members are optional extra info; show the collection without them.
            }

            return {
              ...col,
              itemCount: col.itemCount || 0,
              sharedWith: []
            };
          })
        );
        
        setCollections(collectionsWithMembers);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się pobrać kolekcji',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (collectionData) => {
    try {
      const result = await collectionsService.create(collectionData);

      if (result.success) {
        addCollection(result.data);
        notifications.show({
          title: 'Sukces!',
          message: 'Kolekcja utworzona',
          color: 'green',
        });
        
        await fetchCollections();
        
        return true;
      }
    } catch (err) {
      console.error('Error creating collection:', err);
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się utworzyć kolekcji',
        color: 'red',
      });
      return false;
    }
  };

  const handleUpdate = async (id, collectionData) => {
    try {
      const result = await collectionsService.update(id, collectionData);

      if (result.success) {
        updateCollection(id, result.data);
        
        if (collectionData.parentId !== undefined) {
          await fetchCollections();
        }
        
        notifications.show({
          title: 'Sukces!',
          message: 'Kolekcja zaktualizowana',
          color: 'green',
        });
        return true;
      }
    } catch (err) {
      console.error('Error updating collection:', err);
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się zaktualizować kolekcji',
        color: 'red',
      });
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Czy na pewno usunąć kolekcję?')) {
      return;
    }

    try {
      const result = await collectionsService.delete(id);

      if (result.success) {
        removeCollection(id);
        if (selectedCollection?.id === id) {
          setSelectedCollection(null);
        }

        await fetchCollections();
        // Items from a deleted collection move or disappear, so item lists must refetch too.
        refresh('items');
        
        notifications.show({
          title: 'Sukces!',
          message: 'Kolekcja usunięta',
          color: 'green',
        });
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się usunąć kolekcji',
        color: 'red',
      });
    }
  };

  const getCollectionItemCount = (collectionId) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection?.itemCount || 0;
  };

  return {
    collections,
    selectedCollection,
    setSelectedCollection,
    loading,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchCollections,
    getCollectionItemCount
  };
}