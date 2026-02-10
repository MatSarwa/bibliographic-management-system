import { useEffect } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import workspaceService from '../services/workspaceService';
import { notifications } from '@mantine/notifications';

export function useWorkspaces() {
  const {
    workspaces,
    setWorkspaces,
    addWorkspace,
    updateWorkspace,
    removeWorkspace,
    selectedWorkspace,
    setSelectedWorkspace,
    loading,
    setLoading,
  } = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const result = await workspaceService.getAll();

      if (result.success) {
        console.log('Pobrane workspaces:', result.data);
        
        const workspacesWithCollections = await Promise.all(
          result.data.map(async (ws) => {
            const collectionsResult = await workspaceService.getCollections(ws.id);
            return {
              ...ws,
              collections: collectionsResult.success ? collectionsResult.data : []
            };
          })
        );
        
        setWorkspaces(workspacesWithCollections);
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się pobrać workspaces',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (workspaceData) => {
    try {
      console.log('Creating workspace:', workspaceData);
      const result = await workspaceService.create(workspaceData);

      if (result.success) {
        addWorkspace(result.data);
        notifications.show({
          title: 'Sukces!',
          message: 'Workspace utworzony',
          color: 'green',
        });
        
        await fetchWorkspaces();
        
        return true;
      }
    } catch (err) {
      console.error('Error creating workspace:', err);
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się utworzyć workspace',
        color: 'red',
      });
      return false;
    }
  };

  const handleUpdate = async (id, workspaceData) => {
    try {
      console.log('Updating workspace:', { id, data: workspaceData });
      const result = await workspaceService.update(id, workspaceData);

      if (result.success) {
        updateWorkspace(id, result.data);
        await fetchWorkspaces();
        
        notifications.show({
          title: 'Sukces!',
          message: 'Workspace zaktualizowany',
          color: 'green',
        });
        return true;
      }
    } catch (err) {
      console.error('Error updating workspace:', err);
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się zaktualizować workspace',
        color: 'red',
      });
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Czy na pewno usunąć workspace? Wszystkie kolekcje zostaną usunięte!')) {
      return;
    }

    try {
      const result = await workspaceService.delete(id);

      if (result.success) {
        removeWorkspace(id);
        await fetchWorkspaces();
        
        notifications.show({
          title: 'Sukces!',
          message: 'Workspace usunięty',
          color: 'green',
        });
      }
    } catch (err) {
      console.error('Error deleting workspace:', err);
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się usunąć workspace',
        color: 'red',
      });
    }
  };

  return {
    workspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    loading,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchWorkspaces,
  };
}