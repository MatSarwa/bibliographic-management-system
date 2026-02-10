import React, { useState, useEffect } from 'react';
import { Stack, Text, Box, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import workspaceService from '../../services/workspaceService';
import WorkspaceSettings from '../WorkspaceSettings';
import WorkspaceCollectionModal from '../WorkspaceCollectionModal';
import WorkspaceNode from './WorkspaceNode';

export default function WorkspaceList({
  onSelectCollection,
  workspaces: propsWorkspaces
}) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsWorkspace, setSettingsWorkspace] = useState(null);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [collectionModalOpened, setCollectionModalOpened] = useState(false);
  const [selectedWorkspaceForCollection, setSelectedWorkspaceForCollection] = useState(null);
  const [editCollection, setEditCollection] = useState(null);

  useEffect(() => {
    if (propsWorkspaces) {
      setWorkspaces(propsWorkspaces);
      setLoading(false);
    } else {
      fetchWorkspaces();
    }

    const handleRefresh = () => {
      if (!propsWorkspaces) fetchWorkspaces();
    };

    window.addEventListener('refreshWorkspaces', handleRefresh);
    return () => window.removeEventListener('refreshWorkspaces', handleRefresh);
  }, [propsWorkspaces]);

  const fetchWorkspaces = async () => {
    setLoading(true);
    const result = await workspaceService.getAll();
    if (result.success) {
      setWorkspaces(result.data);
    }
    setLoading(false);
  };

  const handleOpenSettings = (workspace) => {
    setSettingsWorkspace(workspace);
    setSettingsOpened(true);
  };

  const handleOpenCollectionModal = (workspace) => {
    setSelectedWorkspaceForCollection(workspace);
    setEditCollection(null);
    setCollectionModalOpened(true);
  };

  const handleEditCollection = (workspace, collection) => {
    setSelectedWorkspaceForCollection(workspace);
    setEditCollection(collection);
    setCollectionModalOpened(true);
  };

  const handleCollectionSubmit = async (collectionData, collectionId) => {
    if (!selectedWorkspaceForCollection) return false;

    const result = collectionId
      ? await workspaceService.updateCollection(selectedWorkspaceForCollection.id, collectionId, collectionData)
      : await workspaceService.createCollection(selectedWorkspaceForCollection.id, collectionData);

    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: collectionId ? 'Kolekcja zaktualizowana' : 'Kolekcja utworzona',
        color: 'green',
      });
      setCollectionModalOpened(false);
      setSelectedWorkspaceForCollection(null);
      setEditCollection(null);
      await fetchWorkspaces();
      return true;
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
      return false;
    }
  };

  if (loading) {
    return <Center p="xl"><Loader size="sm" color="gray" /></Center>;
  }

  if (workspaces.length === 0) {
    return (
      <Text size="xs" c="#9ca3af" ta="center" py="md" fs="italic">
        Brak workspaces. Kliknij + aby dodać.
      </Text>
    );
  }

  return (
    <Box>
      <Stack gap={2}>
        {workspaces.map((workspace) => (
          <WorkspaceNode
            key={workspace.id}
            workspace={workspace}
            onSelectCollection={onSelectCollection}
            onOpenSettings={handleOpenSettings}
            onOpenCollectionModal={handleOpenCollectionModal}
            onEditCollection={handleEditCollection}
            onRefresh={fetchWorkspaces}
          />
        ))}
      </Stack>

      <WorkspaceSettings
        workspace={settingsWorkspace}
        opened={settingsOpened}
        onClose={() => { setSettingsOpened(false); setSettingsWorkspace(null); }}
        onUpdate={fetchWorkspaces}
      />

      <WorkspaceCollectionModal
        opened={collectionModalOpened}
        onClose={() => { setCollectionModalOpened(false); setSelectedWorkspaceForCollection(null); setEditCollection(null); }}
        onSuccess={handleCollectionSubmit}
        workspace={selectedWorkspaceForCollection}
        editCollection={editCollection}
      />
    </Box>
  );
}