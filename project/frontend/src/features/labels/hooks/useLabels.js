import { useState, useEffect } from 'react';
import labelsService from '../services/labelsService';
import { notifications } from '@mantine/notifications';
import { useRefresh, useRefreshVersion } from '../../../shared/store/refreshStore';
import { confirmAction } from '../../../shared/utils/confirm';

export function useLabels() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const labelsVersion = useRefreshVersion('labels');
  const refresh = useRefresh();

  useEffect(() => {
    fetchLabels();
  }, []);

  // Several components use this hook, each with its own copy; keep them all in sync.
  useEffect(() => {
    if (labelsVersion > 0) fetchLabels({ silent: true });
  }, [labelsVersion]);

  const fetchLabels = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    const result = await labelsService.getAll();
    
    if (result.success) {
      setLabels(result.data);
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
    }
    setLoading(false);
  };

  const handleCreate = async (labelData) => {
    const result = await labelsService.create(labelData);
    
    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: 'Label utworzony',
        color: 'green',
      });
      refresh('labels');
      return true;
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
      return false;
    }
  };

  const handleUpdate = async (id, labelData) => {
    const result = await labelsService.update(id, labelData);
    
    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: 'Label zaktualizowany',
        color: 'green',
      });
      // Items display label names and colors, so they refetch too.
      refresh('labels', 'items');
      return true;
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmAction({ title: 'Usunąć etykietę?', message: 'Etykieta zniknie ze wszystkich pozycji.', confirmLabel: 'Usuń' }))) {
      return;
    }

    const result = await labelsService.delete(id);
    
    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: 'Label usunięty',
        color: 'green',
      });
      refresh('labels', 'items');
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
    }
  };

  return {
    labels,
    loading,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchLabels,
  };
}