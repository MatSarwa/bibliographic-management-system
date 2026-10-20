import { useState, useEffect } from 'react';
import historyService from '../services/historyService';
import { notifications } from '@mantine/notifications';
import { useRefresh } from '../../../shared/store/refreshStore';
import { confirmAction } from '../../../shared/utils/confirm';

export function useHistory(itemId) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = useRefresh();

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
    if (!(await confirmAction({ title: `Przywrócić wersję ${version}?`, message: 'Bieżąca treść pozycji zostanie zastąpiona treścią z tej wersji.', confirmLabel: 'Przywróć', danger: false }))) {
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
      // Restoring a version changes the item itself, so lists and the detail panel must refetch.
      refresh('items');
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