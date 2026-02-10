import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Menu,
  Collapse,
  TextInput,
  Stack
} from '@mantine/core';
import {
  IconFolderPlus,
  IconSortAscending,
  IconSearch,
  IconX,
  IconLock
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import CollectionNode from './CollectionNode';

export default function PersonalCollectionsList({
  collections,
  selectedCollection,
  onSelect,
  onCreateNew,
  onEdit,
  onUpdate,
  onDelete,
  onShare,
  getCollectionItemCount
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [draggedCollection, setDraggedCollection] = useState(null);
  const [collectionsTree, setCollectionsTree] = useState([]);

  useEffect(() => {
    const personalCollections = collections.filter(col => !col.workspaceId);
    const tree = buildTree(personalCollections);
    setCollectionsTree(tree);
  }, [collections]);

  const buildTree = (flatList) => {
    const map = {};
    const roots = [];

    flatList.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });

    flatList.forEach(item => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  };

  const handleDragStart = (e, collection) => {
    setDraggedCollection(collection);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedCollection(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.style.backgroundColor = '#f0f9ff';
    e.currentTarget.style.border = '2px dashed #3b82f6';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.border = '';
  };

  const handleDrop = async (e, targetCollection) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.border = '';

    if (!draggedCollection || draggedCollection.id === targetCollection.id) {
      setDraggedCollection(null);
      return;
    }

    const draggedSharedWith = draggedCollection.sharedWith || draggedCollection.memberships || [];
    const targetSharedWith = targetCollection.sharedWith || targetCollection.memberships || [];

    if (draggedSharedWith.length > 0) {
      notifications.show({
        title: 'Nie można przenieść',
        message: 'Nie można zagnieżdżać kolekcji udostępnionych',
        color: 'red',
        icon: <IconLock size={16} />
      });
      setDraggedCollection(null);
      return;
    }

    if (targetSharedWith.length > 0) {
      notifications.show({
        title: 'Nie można przenieść',
        message: 'Nie można tworzyć podkolekcji w kolekcji udostępnionej',
        color: 'red',
        icon: <IconLock size={16} />
      });
      setDraggedCollection(null);
      return;
    }

    if (onUpdate) {
      await onUpdate(draggedCollection.id, { parentId: targetCollection.id });
    }

    setDraggedCollection(null);
  };

  const filterCollections = (colls, query) => {
    if (!query) return colls;
    return colls.filter(col => {
      const matchesName = col.name.toLowerCase().includes(query.toLowerCase());
      const hasMatchingChildren = col.children && filterCollections(col.children, query).length > 0;
      return matchesName || hasMatchingChildren;
    }).map(col => ({
      ...col,
      children: col.children ? filterCollections(col.children, query) : []
    }));
  };

  const sortCollections = (colls) => {
    const sorted = [...colls].sort((a, b) => {
      if (a.isSystemDefault && !b.isSystemDefault) return -1;
      if (!a.isSystemDefault && b.isSystemDefault) return 1;
      
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'items') return (b.itemCount || 0) - (a.itemCount || 0);
      return 0;
    });

    return sorted.map(col => ({
      ...col,
      children: col.children ? sortCollections(col.children) : []
    }));
  };

  const filteredCollections = sortCollections(filterCollections(collectionsTree, searchQuery));

  return (
    <Box>
      <Group justify="space-between" mb={4} gap={2}>
        <Text size="10px" fw={600} c="#9ca3af" tt="uppercase" lts="0.8px">
          Kolekcje
        </Text>

        <Group gap={2}>
          <Menu shadow="sm" width={160}>
            <Menu.Target>
              <Tooltip label="Sortuj" position="top" withArrow>
                <ActionIcon size="xs" variant="subtle" c="#9ca3af" style={{ width: '20px', height: '20px' }}>
                  <IconSortAscending size={11} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
              <Menu.Label c="#6b7280" fz="10px">Sortuj</Menu.Label>
              <Menu.Item onClick={() => setSortBy('name')} c={sortBy === 'name' ? '#3b82f6' : '#111827'} fz="11px">A-Z</Menu.Item>
              <Menu.Item onClick={() => setSortBy('date')} c={sortBy === 'date' ? '#3b82f6' : '#111827'} fz="11px">Data</Menu.Item>
              <Menu.Item onClick={() => setSortBy('items')} c={sortBy === 'items' ? '#3b82f6' : '#111827'} fz="11px">Liczba</Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Tooltip label="Dodaj kolekcję" position="top" withArrow>
            <ActionIcon size="xs" variant="subtle" c="#9ca3af" onClick={onCreateNew} style={{ width: '20px', height: '20px' }}>
              <IconFolderPlus size={11} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Szukaj" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="subtle"
              c="#9ca3af"
              onClick={() => setSearchVisible(!searchVisible)}
              style={{ backgroundColor: searchVisible ? '#f3f4f6' : 'transparent', width: '20px', height: '20px' }}
            >
              <IconSearch size={11} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Collapse in={searchVisible}>
        <TextInput
          placeholder="Szukaj kolekcji..."
          size="xs"
          leftSection={<IconSearch size={12} color="#6b7280" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          mb="xs"
          styles={{
            input: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', fontSize: '12px', height: '26px' }
          }}
          rightSection={
            searchQuery && (
              <ActionIcon size="xs" variant="transparent" onClick={() => setSearchQuery('')} c="#6b7280">
                <IconX size={10} />
              </ActionIcon>
            )
          }
        />
      </Collapse>

      {filteredCollections.length === 0 ? (
        <Text size="xs" c="#9ca3af" fs="italic" ta="center" py="md">
          {searchQuery ? 'Nie znaleziono kolekcji' : 'Brak kolekcji. Kliknij + aby dodać.'}
        </Text>
      ) : (
        <Stack gap={1}>
          {filteredCollections.map((collection) => (
            <CollectionNode
              key={collection.id}
              collection={collection}
              level={0}
              selectedCollection={selectedCollection}
              onSelectCollection={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onShare={onShare}
              itemCount={getCollectionItemCount?.(collection.id) || 0}
              draggable={true}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              showShareOption={true}
              showExportOption={true}
              showDragHandle={true}
              renderChildren={true}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}