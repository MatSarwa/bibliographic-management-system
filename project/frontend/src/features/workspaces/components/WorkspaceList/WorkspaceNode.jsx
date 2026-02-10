import React, { useState } from 'react';
import {
  Text, Box, ActionIcon, Collapse, Group, Badge,
  Loader, Center, UnstyledButton, Menu, Tooltip, Stack
} from '@mantine/core';
import {
  IconUsers, IconSettings, IconChevronDown, IconChevronRight,
  IconBriefcase, IconPlus, IconDots
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import workspaceService from '../../services/workspaceService';
import CollectionItem from './CollectionItem';

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

  const fetchCollections = async () => {
    setLoadingCollections(true);
    const result = await workspaceService.getCollections(workspace.id);
    if (result.success) {
      setCollections(result.data);
    }
    setLoadingCollections(false);
  };

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (newExpanded && collections.length === 0) {
      fetchCollections();
    }
  };

  const handleDeleteCollection = async (collectionId, collectionName) => {
    if (!window.confirm(`Czy na pewno usunąć kolekcję "${collectionName}"?`)) return;

    const result = await workspaceService.deleteCollection(workspace.id, collectionId);
    if (result.success) {
      notifications.show({ title: 'Sukces!', message: 'Kolekcja usunięta', color: 'green' });
      fetchCollections();
      onRefresh?.();
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
    }
  };

  const handleExportCollection = (collectionId, format, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:5000/api/items/export/${format}?collectionId=${collectionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `workspace_collection_${Date.now()}.${format}`;
        link.click();
      })
      .catch(() => alert('Błąd eksportu'));
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
          backgroundColor: isHovered ? '#f9fafb' : 'transparent',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '28px'
        }}
      >
        <UnstyledButton onClick={handleToggle} style={{ padding: '2px', marginRight: '4px' }}>
          {isExpanded 
            ? <IconChevronDown size={12} color="#6b7280" /> 
            : <IconChevronRight size={12} color="#6b7280" />
          }
        </UnstyledButton>

        <Box mr={6}><IconBriefcase size={14} color="#6b7280" /></Box>

        <Group gap={6} style={{ flex: 1, minWidth: 0 }} onClick={handleToggle}>
          <Text size="13px" c="#6b7280" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              <ActionIcon size="xs" variant="transparent" c="#9ca3af" onClick={(e) => { e.stopPropagation(); setMenuOpened(!menuOpened); }}>
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
            <Text size="11px" c="#9ca3af" ta="center" py="xs" fs="italic">Brak kolekcji. Dodaj pierwszą!</Text>
          ) : (
            <Stack gap={1}>{renderCollectionTree(collectionTree, level + 1)}</Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}