import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Stack
} from '@mantine/core';
import { IconFolderPlus, IconLock } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import CollectionNode from './CollectionNode';

export default function WorkspaceCollectionsList({
  collections,
  selectedCollection,
  onSelect,
  onCreateNew,
  onEdit,
  onUpdate,
  onDelete,
  getCollectionItemCount,
  userRole = 'viewer', 
  workspaceId
}) {
  const [collectionsTree, setCollectionsTree] = useState([]);
  const [draggedCollection, setDraggedCollection] = useState(null);

  const canCreate = ['admin', 'editor'].includes(userRole);
  const canDrag = ['admin', 'editor'].includes(userRole);

  useEffect(() => {
    const tree = buildTree(collections);
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

    const sortRecursive = (nodes) => {
      return nodes
        .sort((a, b) => {
          if (a.isSystemDefault && !b.isSystemDefault) return -1;
          if (!a.isSystemDefault && b.isSystemDefault) return 1;
          return a.name.localeCompare(b.name);
        })
        .map(node => ({
          ...node,
          children: sortRecursive(node.children)
        }));
    };

    return sortRecursive(roots);
  };

  const handleDragStart = (e, collection) => {
    if (!canDrag || collection.isSystemDefault) {
      e.preventDefault();
      return;
    }
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
    e.currentTarget.style.border = '2px dashed #6366f1';
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

    const isDescendant = (parent, childId) => {
      if (!parent.children) return false;
      for (const child of parent.children) {
        if (child.id === childId) return true;
        if (isDescendant(child, childId)) return true;
      }
      return false;
    };

    if (isDescendant(draggedCollection, targetCollection.id)) {
      notifications.show({
        title: 'Nie można przenieść',
        message: 'Nie można przenieść kolekcji do jej podkolekcji',
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

  return (
    <Box>
      <Group justify="space-between" mb={4} gap={2}>
        <Text size="10px" fw={600} c="#9ca3af" tt="uppercase" lts="0.8px">
          Kolekcje
        </Text>

        {canCreate && (
          <Tooltip label="Dodaj kolekcję" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="subtle"
              c="#9ca3af"
              onClick={onCreateNew}
              style={{ width: '20px', height: '20px' }}
            >
              <IconFolderPlus size={11} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      
      {collectionsTree.length === 0 ? (
        <Text size="xs" c="#9ca3af" fs="italic" ta="center" py="md">
          Brak kolekcji w workspace
        </Text>
      ) : (
        <Stack gap={1}>
          {collectionsTree.map((collection) => (
            <CollectionNode
              key={collection.id}
              collection={collection}
              level={0}
              selectedCollection={selectedCollection}
              onSelectCollection={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              itemCount={getCollectionItemCount?.(collection.id) || 0}
              draggable={canDrag}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              showShareOption={false}
              showExportOption={true}
              showDragHandle={canDrag}
              renderChildren={true}
              userRole={userRole}
              workspaceId={workspaceId}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}