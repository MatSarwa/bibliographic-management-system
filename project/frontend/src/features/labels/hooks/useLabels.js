import { useState, useEffect } from 'react';
import labelsService from '../services/labelsService';
import { notifications } from '@mantine/notifications';

export function useLabels() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    setLoading(true);
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
      fetchLabels();
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
      fetchLabels();
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
    if (!window.confirm('Czy na pewno usunąć label?')) {
      return;
    }

    const result = await labelsService.delete(id);
    
    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: 'Label usunięty',
        color: 'green',
      });
      fetchLabels();
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