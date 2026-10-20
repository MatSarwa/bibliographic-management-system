import React, { useState, useEffect } from 'react';
import {
  Text, Box, ActionIcon, Collapse, Group, Badge,
  Loader, Center, UnstyledButton, Menu, Tooltip, Stack
} from '@mantine/core';
import {
  IconUsers, IconSettings, IconChevronDown, IconChevronRight,
  IconBriefcase, IconPlus, IconDots, IconTrash
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import workspaceService from '../../services/workspaceService';
import CollectionItem from './CollectionItem';
import { useRefreshVersion } from '../../../../shared/store/refreshStore';
import { downloadCollectionExport } from '../../../../shared/utils/download';
import classes from '../../../../shared/styles/interactive.module.css';
import { confirmAction } from '../../../../shared/utils/confirm';

export default function WorkspaceNode({
  workspace,
  level = 0,
  onSelectCollection,
  onOpenSettings,
  onOpenCollectionModal,
  onEditCollection,
  onRefresh
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  const memberCount = workspace.members?.length || 0;

  const workspacesVersion = useRefreshVersion('workspaces');

  const fetchCollections = async ({ silent = false } = {}) => {
    if (!silent) setLoadingCollections(true);
    const result = await workspaceService.getCollections(workspace.id);
    if (result.success) {
      setCollections(result.data);
    }
    setLoadingCollections(false);
  };

  // Collections are cached after the first expand; refetch them when something changed.
  useEffect(() => {
    if (isExpanded && workspacesVersion > 0) fetchCollections({ silent: true });
  }, [workspacesVersion]);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (newExpanded) {
      // Show cached collections at once and refresh them quietly; loader only on the first expand.
      fetchCollections({ silent: collections.length > 0 });
    }
  };

  const handleDeleteCollection = async (collectionId, collectionName) => {
    if (!(await confirmAction({ title: 'Usunąć kolekcję?', message: `Kolekcja „${collectionName}” zostanie usunięta z workspace’u.`, confirmLabel: 'Usuń' }))) return;

    const result = await workspaceService.deleteCollection(workspace.id, collectionId);
    if (result.success) {
      notifications.show({ title: 'Sukces!', message: 'Kolekcja usunięta', color: 'green' });
      onRefresh?.();
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
    }
  };

  const handleExportCollection = (collectionId, format, e) => {
    e.stopPropagation();
    downloadCollectionExport(collectionId, format, 'workspace_kolekcja');
  };

  const buildCollectionTree = (collections) => {
    const map = {};
    const roots = [];
    collections.forEach(col => { map[col.id] = { ...col, children: [] }; });
    collections.forEach(col => {
      if (col.parentId && map[col.parentId]) {
        map[col.parentId].children.push(map[col.id]);
      } else {
        roots.push(map[col.id]);
      }
    });
    return roots;
  };

  const renderCollectionTree = (collections, currentLevel) => {
    return collections.map(collection => (
      <React.Fragment key={collection.id}>
        <CollectionItem
          collection={collection}
          workspace={workspace}
          level={currentLevel}
          onSelectCollection={onSelectCollection}
          onEdit={(col) => onEditCollection(workspace, col)}
          onDelete={handleDeleteCollection}
          onExport={handleExportCollection}
        />
        {collection.children?.length > 0 && (
          <Box>{renderCollectionTree(collection.children, currentLevel + 1)}</Box>
        )}
      </React.Fragment>
    ));
  };

  const collectionTree = buildCollectionTree(collections);

  return (
    <Box>
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => !menuOpened && setIsHovered(false)}
        style={{
          paddingLeft: `${level * 16 + 4}px`,
          paddingRight: '4px',
          paddingTop: '3px',
          paddingBottom: '3px',
          cursor: 'pointer',
          backgroundColor: isHovered ? 'var(--app-hover)' : 'transparent',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '28px'
        }}
      >
        <UnstyledButton onClick={handleToggle} style={{ padding: '2px', marginRight: '4px' }}>
          {isExpanded 
            ? <IconChevronDown size={12} style={{ color: 'var(--mantine-color-dimmed)' }} /> 
            : <IconChevronRight size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
          }
        </UnstyledButton>

        <Box mr={6}><IconBriefcase size={14} style={{ color: 'var(--mantine-color-dimmed)' }} /></Box>

        <Group gap={6} style={{ flex: 1, minWidth: 0 }} onClick={handleToggle}>
          <Text size="13px" c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {workspace.name}
          </Text>
          {memberCount > 0 && (
            <Tooltip label={`${memberCount} członków`} withArrow>
              <Badge size="xs" variant="light" color="cyan">
                <Group gap={3}><IconUsers size={9} />{memberCount}</Group>
              </Badge>
            </Tooltip>
          )}
        </Group>

        {isHovered && (
          <Menu shadow="md" width={200} opened={menuOpened} onChange={setMenuOpened}>
            <Menu.Target>
              <ActionIcon size="xs" variant="transparent" c="var(--mantine-color-placeholder)" onClick={(e) => { e.stopPropagation(); setMenuOpened(!menuOpened); }}>
                <IconDots size={12} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPlus size={14} />} onClick={(e) => { e.stopPropagation(); onOpenCollectionModal(workspace); setMenuOpened(false); }} fz="12px">
                Dodaj kolekcję
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={14} />} onClick={(e) => { e.stopPropagation(); onOpenSettings(workspace); setMenuOpened(false); }} fz="12px">
                Ustawienia
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Box>

      <Collapse in={isExpanded}>
        <Box ml="xs" mt={2}>
          {loadingCollections ? (
            <Center p="xs"><Loader size="xs" color="gray" /></Center>
          ) : collectionTree.length === 0 ? (
            <Text size="11px" c="var(--mantine-color-placeholder)" ta="center" py="xs" fs="italic">Brak kolekcji. Dodaj pierwszą!</Text>
          ) : (
            <Stack gap={1}>{renderCollectionTree(collectionTree, level + 1)}</Stack>
          )}

          {/* Shared trash: items any member deleted, so admins/editors can bring them back. */}
          <UnstyledButton
            onClick={() => onSelectCollection({ id: `trash-${workspace.id}`, name: 'Kosz', isTrash: true }, workspace)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
              padding: '4px 8px',
              paddingLeft: `${8 + (level + 1) * 12}px`,
              borderRadius: 4,
              marginTop: 2,
            }}
            className={classes.collectionOption}
          >
            <IconTrash size={13} style={{ color: 'var(--mantine-color-placeholder)' }} />
            <Text size="12px" c="dimmed">Kosz</Text>
          </UnstyledButton>
        </Box>
      </Collapse>
    </Box>
  );
}