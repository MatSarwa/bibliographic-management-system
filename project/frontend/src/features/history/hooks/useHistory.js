import { useState, useEffect } from 'react';
import historyService from '../services/historyService';
import { notifications } from '@mantine/notifications';

export function useHistory(itemId) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (itemId) {
      fetchHistory();
    }
  }, [itemId]);

  const fetchHistory = async () => {
    setLoading(true);
    const result = await historyService.getHistory(itemId);
    
    if (result.success) {
      setHistory(result.data);
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
    }
    setLoading(false);
  };

  const handleRestoreVersion = async (version) => {
    if (!window.confirm(`Czy na pewno przywrócić wersję ${version}?`)) {
      return false;
    }

    const result = await historyService.restoreVersion(itemId, version);
    
    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: `Wersja ${version} przywrócona`,
        color: 'green',
      });
      fetchHistory();
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

  return {
    history,
    loading,
    handleRestoreVersion,
    fetchHistory,
  };
}