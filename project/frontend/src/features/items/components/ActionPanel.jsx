import { useState } from 'react';
import { 
  Box, 
  Group, 
  Button, 
  Text, 
  ActionIcon, 
  Modal,
  Stack,
  Divider,
  Loader,
  ScrollArea,
  UnstyledButton
} from '@mantine/core';
import { 
  IconX,
  IconTrash,
  IconFileExport, 
  IconDownload, 
  IconFolderShare,
  IconFolder,
  IconBriefcase,
  IconChevronRight,
  IconChevronDown
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../../shared/utils/api';
import { useCollectionsStore } from '../../collections/store/collectionsStore';
import { useWorkspaceStore } from '../../workspaces/store/workspaceStore';
import classes from '../../../shared/styles/interactive.module.css';
import { confirmAction } from '../../../shared/utils/confirm';

export default function ActionPanel({ 
  selectedItemIds, 
  onClose, 
  onRefresh, 
  currentWorkspaceId = null,
  currentCollectionId = null
}) {
  const [moveModalOpened, setMoveModalOpened] = useState(false);
  const [exportModalOpened, setExportModalOpened] = useState(false);
  const [moveLoading, setMoveLoading] = useState(false);
  const [workspaceCollections, setWorkspaceCollections] = useState({});
  const [expandedWorkspaces, setExpandedWorkspaces] = useState({});
  const [loadingWorkspace, setLoadingWorkspace] = useState(null);

  const { collections } = useCollectionsStore();
  const { workspaces } = useWorkspaceStore();

  const handleExportSelected = async (format) => {
    try {
      const response = await api.post(`/export/items?format=${format}`, 
        { itemIds: selectedItemIds },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `bibliography_${Date.now()}.${format === 'bibtex' ? 'bib' : 'ris'}`;
      link.click();
      window.URL.revokeObjectURL(link.href);

      notifications.show({
        title: 'Sukces!',
        message: `Wyeksportowano zaznaczone pozycje (${selectedItemIds.length})`,
        color: 'green'
      });
      
      setExportModalOpened(false);
    } catch (err) {
      notifications.show({
        title: 'Błąd eksportu',
        message: err.message,
        color: 'red'
      });
    }
  };

  const handleMoveToCollection = async (collectionId, collectionName) => {
    setMoveLoading(true);
    
    try {
      const promises = selectedItemIds.map(itemId =>
        api.put(`/items/${itemId}`, { collectionId: collectionId || null })
      );
      
      await Promise.all(promises);

      notifications.show({
        title: 'Sukces!',
        message: `Przeniesiono do "${collectionName || 'Wszystkie'}" (liczba pozycji: ${selectedItemIds.length})`,
        color: 'green'
      });

      setMoveModalOpened(false);
      onRefresh?.();
      onClose();
    } catch (err) {
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się przenieść pozycji',
        color: 'red'
      });
    } finally {
      setMoveLoading(false);
    }
  };

  const fetchWorkspaceCollections = async (workspaceId) => {
    if (workspaceCollections[workspaceId]) return;

    setLoadingWorkspace(workspaceId);
    try {
      const response = await api.get(`/workspaces/${workspaceId}/collections`);
      const data = response?.data?.data || response?.data || [];
      setWorkspaceCollections(prev => ({
        ...prev,
        [workspaceId]: data
      }));
    } catch (err) {
      console.error('Error fetching workspace collections:', err);
    } finally {
      setLoadingWorkspace(null);
    }
  };

  const toggleWorkspace = (workspaceId) => {
    if (!expandedWorkspaces[workspaceId]) {
      fetchWorkspaceCollections(workspaceId);
    }
    setExpandedWorkspaces(prev => ({
      ...prev,
      [workspaceId]: !prev[workspaceId]
    }));
  };

  const handleCopyToWorkspace = async (workspaceId, collectionId, collectionName, workspaceName) => {
    setMoveLoading(true);
    
    try {
      const itemsData = await Promise.all(
        selectedItemIds.map(async (itemId) => {
          const response = await api.get(`/items/${itemId}`);
          return response.data.data || response.data;
        })
      );

      const promises = itemsData.map(item => 
        api.post(`/workspaces/${workspaceId}/collections/${collectionId}/items`, {
          title: item.title,
          itemType: item.itemType,
          year: item.year,
          metadata: item.metadata,
          doi: item.doi,
          isbn: item.isbn,
          abstract: item.abstract,
          notes: item.notes ? `[Skopiowane]\n\n${item.notes}` : '[Skopiowane]'
        })
      );
      
      await Promise.all(promises);

      notifications.show({
        title: 'Sukces!',
        message: `Skopiowano do "${workspaceName} / ${collectionName}" (liczba pozycji: ${selectedItemIds.length})`,
        color: 'green'
      });

      setMoveModalOpened(false);
      onRefresh?.();
      onClose();
    } catch (err) {
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się skopiować',
        color: 'red'
      });
    } finally {
      setMoveLoading(false);
    }
  };

  const handleCopyToPersonal = async (collectionId, collectionName) => {
    setMoveLoading(true);
    
    try {
      const itemsData = await Promise.all(
        selectedItemIds.map(async (itemId) => {
          const response = await api.get(`/items/${itemId}`);
          return response.data.data || response.data;
        })
      );

      const promises = itemsData.map(item => 
        api.post('/items', {
          title: item.title,
          itemType: item.itemType,
          year: item.year,
          metadata: item.metadata,
          doi: item.doi,
          isbn: item.isbn,
          abstract: item.abstract,
          // Mark the origin only for copies taken out of a team workspace.
          notes: isInWorkspace
            ? (item.notes ? `[Skopiowane z workspace]\n\n${item.notes}` : '[Skopiowane z workspace]')
            : item.notes,
          collectionId: collectionId || null
        })
      );
      
      await Promise.all(promises);

      notifications.show({
        title: 'Sukces!',
        message: `Skopiowano do "${collectionName || 'Wszystkie'}" (liczba pozycji: ${selectedItemIds.length})`,
        color: 'green'
      });

      setMoveModalOpened(false);
      onRefresh?.();
      onClose();
    } catch (err) {
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się skopiować',
        color: 'red'
      });
    } finally {
      setMoveLoading(false);
    }
  };

  const handleMoveWithinWorkspace = async (targetCollectionId, collectionName) => {
    setMoveLoading(true);
    
    try {
      const promises = selectedItemIds.map(itemId =>
        api.put(`/items/${itemId}`, { collectionId: targetCollectionId })
      );
      
      await Promise.all(promises);

      notifications.show({
        title: 'Sukces!',
        message: `Przeniesiono do "${collectionName}" (liczba pozycji: ${selectedItemIds.length})`,
        color: 'green'
      });

      setMoveModalOpened(false);
      onRefresh?.();
      onClose();
    } catch (err) {
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się przenieść',
        color: 'red'
      });
    } finally {
      setMoveLoading(false);
    }
  };

  const buildCollectionTree = (flatList) => {
    const map = {};
    const roots = [];

    flatList.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });

    flatList.forEach(item => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else if (!item.workspaceId) {
        roots.push(map[item.id]);
      }
    });

    return roots;
  };

  const personalCollections = collections.filter(c => !c.workspaceId);
  const collectionTree = buildCollectionTree(personalCollections);
  const isInWorkspace = !!currentWorkspaceId;

  const handleDeleteSelected = async () => {
    const count = selectedItemIds.length;
    const confirmed = await confirmAction({
      title: count === 1 ? 'Przenieść pozycję do kosza?' : 'Przenieść zaznaczone pozycje do kosza?',
      message: `Wybrane pozycje: ${count}. Możesz je później przywrócić z kosza.`,
      confirmLabel: 'Przenieś do kosza',
    });
    if (!confirmed) return;

    setMoveLoading(true);
    // allSettled: one failure (e.g. no rights to a colleague's item) must not hide the others' result
    const results = await Promise.allSettled(selectedItemIds.map((itemId) => api.delete(`/items/${itemId}`)));
    const failed = results.filter((r) => r.status === 'rejected').length;
    setMoveLoading(false);

    notifications.show(failed
      ? { title: 'Częściowo usunięto', message: `Nie udało się usunąć ${failed} z ${count} pozycji`, color: 'orange' }
      : { title: 'Przeniesiono do kosza', message: `Liczba pozycji: ${count}`, color: 'green' });

    onRefresh?.();
    onClose();
  };

  // Moves (not copies) items into a workspace collection, e.g. from a private collection.
  const handleMoveToWorkspace = async (collectionId, collectionName, workspaceName) => {
    setMoveLoading(true);
    try {
      await Promise.all(selectedItemIds.map((itemId) => api.put(`/items/${itemId}`, { collectionId })));
      notifications.show({
        title: 'Sukces!',
        message: `Przeniesiono do "${workspaceName} / ${collectionName}" (liczba pozycji: ${selectedItemIds.length})`,
        color: 'green',
      });
      setMoveModalOpened(false);
      onRefresh?.();
      onClose();
    } catch (err) {
      notifications.show({
        title: 'Błąd',
        message: err.response?.data?.message || 'Nie udało się przenieść',
        color: 'red',
      });
    } finally {
      setMoveLoading(false);
    }
  };

  const handleOpenMoveModal = () => {
    setMoveModalOpened(true);
    if (isInWorkspace && !workspaceCollections[currentWorkspaceId]) {
      fetchWorkspaceCollections(currentWorkspaceId);
    }
  };

  const CollectionItem = ({ collection, level = 0, onClick, onMove, onCopy, disabled }) => (
    <>
      {onMove ? (
        // Personal collections: move or copy (copy keeps the item where it is and adds a duplicate).
        <Group
          gap={8}
          wrap="nowrap"
          style={{ padding: '6px 12px', paddingLeft: `${12 + level * 20}px`, borderRadius: 6 }}
        >
          <IconFolder size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
          <Text size="sm" style={{ flex: 1, minWidth: 0 }} truncate>{collection.name}</Text>
          {disabled ? (
            <Text size="xs" c="var(--mantine-color-placeholder)">(obecna)</Text>
          ) : (
            <>
              <Button size="compact-xs" variant="light" color="violet" disabled={moveLoading} onClick={() => onMove(collection)}>
                Przenieś
              </Button>
              <Button size="compact-xs" variant="default" disabled={moveLoading} onClick={() => onCopy(collection)}>
                Kopiuj
              </Button>
            </>
          )}
        </Group>
      ) : (
      <UnstyledButton
        onClick={() => !disabled && onClick(collection)}
        disabled={disabled}
        className={classes.collectionOption}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          paddingLeft: `${12 + level * 20}px`,
          borderRadius: 6,
          width: '100%',
          backgroundColor: disabled ? 'var(--app-active)' : undefined,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s'
        }}
      >
        <IconFolder size={16} style={{ color: disabled ? 'var(--mantine-color-placeholder)' : 'var(--mantine-color-dimmed)' }} />
        <Text size="sm" c={disabled ? 'var(--mantine-color-placeholder)' : 'var(--mantine-color-text)'}>
          {collection.name}
        </Text>
        {disabled && (
          <Text size="xs" c="var(--mantine-color-placeholder)" ml="auto">(obecna)</Text>
        )}
      </UnstyledButton>
      )}
      {collection.children?.map(child => (
        <CollectionItem
          key={child.id}
          collection={child}
          level={level + 1}
          onClick={onClick}
          onMove={onMove}
          onCopy={onCopy}
          disabled={child.id === currentCollectionId}
        />
      ))}
    </>
  );

  return (
    <>
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--mantine-color-body)',
          borderTop: '2px solid var(--mantine-primary-color-filled)',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '12px 16px',
          zIndex: 100
        }}
      >
        <Group justify="space-between" gap="sm">
          <Group gap="md">

            <Box
              style={{
                backgroundColor: 'var(--mantine-color-blue-light)',
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid var(--mantine-color-blue-light)'
              }}
            >
              <Text size="sm" fw={600} c="var(--mantine-color-blue-light-color)">
                Wybrane pozycje: {selectedItemIds.length}
              </Text>
            </Box>

            <Button
              variant="light"
              color="violet"
              leftSection={moveLoading ? <Loader size={14} /> : <IconFolderShare size={16} />}
              size="sm"
              onClick={handleOpenMoveModal}
              disabled={moveLoading}
            >
              Przenieś / Kopiuj
            </Button>

            <Button
              variant="light"
              color="blue"
              leftSection={<IconFileExport size={16} />}
              size="sm"
              onClick={() => setExportModalOpened(true)}
            >
              Eksportuj
            </Button>

            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              size="sm"
              onClick={handleDeleteSelected}
              disabled={moveLoading}
            >
              Usuń
            </Button>

            <Button variant="subtle" size="sm" onClick={onClose} c="dimmed">
              Odznacz
            </Button>
          </Group>

          <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose}>
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Box>

      <Modal
        opened={moveModalOpened}
        onClose={() => setMoveModalOpened(false)}
        title={
          <Group gap="xs">
            <IconFolderShare size={20} style={{ color: 'var(--mantine-primary-color-filled)' }} />
            <Text fw={600}>Przenieś / Kopiuj (wybrane pozycje: {selectedItemIds.length})</Text>
          </Group>
        }
        size="md"
        centered
      >
        <ScrollArea.Autosize mah={400}>
          <Stack gap={4}>
            
            {isInWorkspace && (
              <>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={4}>
                  Przenieś do innej kolekcji w workspace
                </Text>
                
                {workspaceCollections[currentWorkspaceId]?.filter(c => c.id !== currentCollectionId).length > 0 ? (
                  workspaceCollections[currentWorkspaceId]
                    .filter(c => c.id !== currentCollectionId)
                    .map(col => (
                      <UnstyledButton
                        key={col.id}
                        onClick={() => handleMoveWithinWorkspace(col.id, col.name)}
                        disabled={moveLoading}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        <IconFolder size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                        <Text size="sm">{col.name}</Text>
                      </UnstyledButton>
                    ))
                ) : (
                  <Text size="sm" c="dimmed" py="xs" pl="sm">
                    {loadingWorkspace === currentWorkspaceId ? 'Ładowanie...' : 'Brak innych kolekcji'}
                  </Text>
                )}

                <Divider my="sm" />

                <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={4}>
                  Kopiuj do prywatnej biblioteki
                </Text>

                <UnstyledButton
                  onClick={() => handleCopyToPersonal(null, 'Wszystkie')}
                  disabled={moveLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 6,
                    backgroundColor: 'var(--mantine-color-green-light)',
                    cursor: 'pointer'
                  }}
                >
                  <IconFolder size={16} style={{ color: 'var(--mantine-color-green-7)' }} />
                  <Text size="sm" c="var(--mantine-color-green-7)" fw={500}>Wszystkie (bez kolekcji)</Text>
                </UnstyledButton>

                {collectionTree.map(col => (
                  <CollectionItem 
                    key={col.id} 
                    collection={col} 
                    onClick={(c) => handleCopyToPersonal(c.id, c.name)}
                  />
                ))}
              </>
            )}

            {!isInWorkspace && (
              <>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={4}>
                  Przenieś lub kopiuj do kolekcji
                </Text>

                <UnstyledButton
                  onClick={() => handleMoveToCollection(null, 'Wszystkie')}
                  disabled={moveLoading || !currentCollectionId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 6,
                    backgroundColor: !currentCollectionId ? 'var(--app-active)' : 'var(--mantine-color-green-light)',
                    opacity: !currentCollectionId ? 0.5 : 1,
                    cursor: !currentCollectionId ? 'not-allowed' : 'pointer'
                  }}
                >
                  <IconFolder size={16} style={{ color: 'var(--mantine-color-green-7)' }} />
                  <Text size="sm" c="var(--mantine-color-green-7)" fw={500}> Wszystkie (bez kolekcji)</Text>
                  {!currentCollectionId && <Text size="xs" c="var(--mantine-color-placeholder)" ml="auto">(obecna)</Text>}
                </UnstyledButton>

                {collectionTree.map(col => (
                  <CollectionItem 
                    key={col.id} 
                    collection={col} 
                    onMove={(c) => handleMoveToCollection(c.id, c.name)}
                    onCopy={(c) => handleCopyToPersonal(c.id, c.name)}
                    disabled={col.id === currentCollectionId}
                  />
                ))}

                {workspaces.length > 0 && (
                  <>
                    <Divider my="sm" />
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={4}>
                      Przenieś lub kopiuj do workspace
                    </Text>

                    {workspaces.map(ws => (
                      <Box key={ws.id}>
                        <UnstyledButton
                          onClick={() => toggleWorkspace(ws.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 12px',
                            borderRadius: 6,
                            width: '100%',
                            backgroundColor: expandedWorkspaces[ws.id] ? 'var(--mantine-color-violet-light)' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          {expandedWorkspaces[ws.id] ? (
                            <IconChevronDown size={14} style={{ color: 'var(--mantine-primary-color-filled)' }} />
                          ) : (
                            <IconChevronRight size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
                          )}
                          <IconBriefcase size={16} style={{ color: 'var(--mantine-primary-color-filled)' }} />
                          <Text size="sm" fw={500}>{ws.name}</Text>
                          {loadingWorkspace === ws.id && <Loader size={12} ml="auto" />}
                        </UnstyledButton>

                        {expandedWorkspaces[ws.id] && (
                          <Box>
                            {workspaceCollections[ws.id]?.length > 0 ? (
                              workspaceCollections[ws.id].map(col => (
                                <Group
                                  key={col.id}
                                  gap={8}
                                  wrap="nowrap"
                                  style={{ padding: '6px 12px', paddingLeft: 40, borderRadius: 6 }}
                                >
                                  <IconFolder size={14} style={{ color: 'var(--mantine-color-placeholder)' }} />
                                  <Text size="sm" c="dimmed" style={{ flex: 1, minWidth: 0 }} truncate>{col.name}</Text>
                                  <Button
                                    size="compact-xs"
                                    variant="light"
                                    color="violet"
                                    disabled={moveLoading}
                                    onClick={() => handleMoveToWorkspace(col.id, col.name, ws.name)}
                                  >
                                    Przenieś
                                  </Button>
                                  <Button
                                    size="compact-xs"
                                    variant="default"
                                    disabled={moveLoading}
                                    onClick={() => handleCopyToWorkspace(ws.id, col.id, col.name, ws.name)}
                                  >
                                    Kopiuj
                                  </Button>
                                </Group>
                              ))
                            ) : (
                              <Text size="xs" c="dimmed" pl={40} py="xs">
                                Brak kolekcji
                              </Text>
                            )}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </>
                )}
              </>
            )}
          </Stack>
        </ScrollArea.Autosize>
      </Modal>

      <Modal
        opened={exportModalOpened}
        onClose={() => setExportModalOpened(false)}
        title={
          <Group gap="xs">
            <IconFileExport size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
            <Text fw={600}>Eksportuj (wybrane pozycje: {selectedItemIds.length})</Text>
          </Group>
        }
        size="sm"
        centered
      >
        <Stack gap="sm">
          <Button
            variant="light"
            color="blue"
            leftSection={<IconDownload size={16} />}
            onClick={() => handleExportSelected('bibtex')}
            fullWidth
            size="md"
          >
            BibTeX (.bib)
          </Button>
          
          <Button
            variant="light"
            color="blue"
            leftSection={<IconDownload size={16} />}
            onClick={() => handleExportSelected('ris')}
            fullWidth
            size="md"
          >
            RIS (.ris)
          </Button>
        </Stack>
      </Modal>
    </>
  );
}