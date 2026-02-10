import React, { useState, useEffect } from 'react';
import {
  Stack,
  Text,
  Box,
  ActionIcon,
  Group,
  Badge,
  Menu,
  Collapse,
  UnstyledButton,
  Tooltip,
  TextInput
} from '@mantine/core';
import {
  IconFolder,
  IconFolderOpen,
  IconEdit,
  IconTrash,
  IconUsers,
  IconDots,
  IconDownload,
  IconGripVertical,
  IconLock,
  IconChevronDown,
  IconChevronRight,
  IconFolderPlus,
  IconSortAscending,
  IconSearch,
  IconX
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

function CollectionNode({
  collection,
  level = 0,
  selectedCollection,
  onSelectCollection,
  onEdit,
  onUpdate,
  onDelete,
  onShare,
  itemCount = 0,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const hasChildren = collection.children && collection.children.length > 0;
  const isSelected = selectedCollection?.id === collection.id;
  const isNested = !!collection.parentId;
  const hasSubfolders = hasChildren;
  const canShare = !isNested && !hasSubfolders;

  const sharedWith = collection.sharedWith || collection.memberships || [];
  const isShared = sharedWith.length > 0;
  const memberCount = sharedWith.length;

  console.log(`${collection.name} - isShared:`, isShared, 'memberCount:', memberCount, 'sharedWith:', sharedWith);

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
        link.download = `kolekcja_${collection.name}_${Date.now()}.${format}`;
        link.click();
        window.URL.revokeObjectURL(link.href);
      })
      .catch(err => {
        console.error('EKSPORT BŁĄD:', err);
        alert('Błąd eksportu');
      });
  };

  const handleDragStart = (e, collection) => {
    if (isShared) {
      e.preventDefault();
      notifications.show({
        title: 'Nie można przenieść',
        message: 'Nie można zagnieżdżać kolekcji udostępnionych innym użytkownikom',
        color: 'red',
        icon: <IconLock size={16} />
      });
      return;
    }
    onDragStart(e, collection);
  };

  const handleDrop = async (e, targetCollection) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.border = '';

    onDrop(e, collection);
  };

  return (
    <Box>
      <Box
        draggable={!isShared}
        onDragStart={(e) => handleDragStart(e, collection)}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => !menuOpened && setIsHovered(false)}
        onClick={() => onSelectCollection(collection)}
        style={{
          paddingLeft: `${level * 20 + 4}px`,
          paddingRight: '4px',
          paddingTop: '2px',
          paddingBottom: '2px',
          cursor: 'pointer',
          backgroundColor: isSelected ? '#f3f4f6' : (isHovered ? '#f9fafb' : 'transparent'),
          borderRadius: '4px',
          transition: 'background-color 0.15s ease',
          marginBottom: '1px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '26px',
          border: isSelected ? '1px solid #e5e7eb' : '1px solid transparent'
        }}
      >
        {!isShared && (
          <ActionIcon
            size="xs"
            variant="transparent"
            c="#9ca3af"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.15s ease',
              cursor: 'grab',
              marginRight: '4px',
              flexShrink: 0,
              width: '20px'
            }}
          >
            <IconGripVertical size={12} />
          </ActionIcon>
        )}

        {isShared && (
          <Box style={{ width: '20px', marginRight: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isHovered && (
              <Tooltip label="Kolekcja udostępniona - nie można zagnieżdżać" withArrow>
                <IconLock size={11} color="#06b6d4" />
              </Tooltip>
            )}
          </Box>
        )}

        {hasChildren ? (
          <UnstyledButton
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              marginRight: '4px',
              flexShrink: 0
            }}
          >
            {isExpanded ? (
              <IconChevronDown size={12} color="#6b7280" />
            ) : (
              <IconChevronRight size={12} color="#6b7280" />
            )}
          </UnstyledButton>
        ) : (
          <Box style={{ width: '16px', marginRight: '4px', flexShrink: 0 }} />
        )}

        <Box mr={6} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {hasChildren ? (
            isExpanded ? (
              <IconFolderOpen size={14} color="#6b7280" />
            ) : (
              <IconFolder size={14} color="#6b7280" />
            )
          ) : (
            <IconFolder size={14} color="#9ca3af" />
          )}
        </Box>

        <Group gap={4} style={{ flex: 1, minWidth: 0 }}>

          <Text
            size="13px"
            c={isSelected ? '#111827' : '#6b7280'}
            fw={isSelected ? 500 : 400}
            style={{
              lineHeight: '1.2',
              userSelect: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexShrink: 1
            }}
          >
            {collection.name}
          </Text>

          {isShared && (
            <Tooltip 
              label={`Udostępniona dla ${memberCount} ${memberCount === 1 ? 'osoby' : 'osób'}`} 
              withArrow
              position="top"
            >
              <Box 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <IconUsers size={12} color="#06b6d4" />
              </Box>
            </Tooltip>
          )}

          {itemCount > 0 && (
            <Text size="11px" c="#9ca3af" fw={400} style={{ flexShrink: 0 }}>
              {itemCount}
            </Text>
          )}
        </Group>

        {isHovered && (
          <Menu shadow="md" width={200} position="right-start" opened={menuOpened} onChange={setMenuOpened}>
            <Menu.Target>
              <ActionIcon
                size="xs"
                variant="transparent"
                c="#9ca3af"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpened(!menuOpened);
                }}
                style={{ flexShrink: 0 }}
              >
                <IconDots size={12} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
              <Menu.Label c="#6b7280" fz="10px">Udostępnianie</Menu.Label>

              <Menu.Item 
                leftSection={<IconUsers size={14} color={canShare ? '#06b6d4' : '#9ca3af'} />} 
                onClick={(e) => {
                  e.stopPropagation();
                  if (canShare && onShare) {
                    onShare(collection);
                  }
                  setMenuOpened(false);
                }} 
                fz="12px"
                disabled={!canShare}
                c={canShare ? '#111827' : '#9ca3af'}
              >
                {isShared ? `Zarządzaj (${memberCount})` : 'Udostępnij...'}
              </Menu.Item>
              
              {!canShare && (
                <Menu.Item 
                  leftSection={<IconLock size={14} />} 
                  disabled
                  fz="11px"
                  c="#9ca3af"
                  style={{ whiteSpace: 'normal', height: 'auto', padding: '6px 8px' }}
                >
                  {isNested 
                    ? 'Zagnieżdżone kolekcje nie mogą być udostępniane' 
                    : 'Kolekcje z subfolderami nie mogą być udostępniane'}
                </Menu.Item>
              )}
              
              <Menu.Divider />
              <Menu.Label c="#6b7280" fz="10px">Eksport</Menu.Label>
              <Menu.Item 
                leftSection={<IconDownload size={14} />} 
                onClick={(e) => { 
                  handleExportCollection(collection.id, 'bibtex', e); 
                  setMenuOpened(false); 
                }} 
                fz="12px"
              >
                BibTeX (.bib)
              </Menu.Item>
              <Menu.Item 
                leftSection={<IconDownload size={14} />} 
                onClick={(e) => { 
                  handleExportCollection(collection.id, 'ris', e); 
                  setMenuOpened(false); 
                }} 
                fz="12px"
              >
                RIS (.ris)
              </Menu.Item>
              
              <Menu.Divider />
              <Menu.Label c="#6b7280" fz="10px">Zarządzanie</Menu.Label>
              <Menu.Item 
                leftSection={<IconEdit size={14} />} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onEdit(collection); 
                  setMenuOpened(false); 
                }} 
                fz="12px"
              >
                Edytuj
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Czy na pewno usunąć kolekcję "${collection.name}"?`)) {
                    onDelete(collection.id);
                  }
                  setMenuOpened(false);
                }}
                fz="12px"
              >
                Usuń
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Box>

      {hasChildren && (
        <Collapse in={isExpanded}>
          <Box>
            {collection.children.map((child) => (
              <CollectionNode
                key={child.id}
                collection={child}
                level={level + 1}
                selectedCollection={selectedCollection}
                onSelectCollection={onSelectCollection}
                onEdit={onEdit}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onShare={onShare}
                itemCount={child.itemCount || 0}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

export default function CollectionsList({
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

    if (draggedCollection && draggedCollection.id !== targetCollection.id) {
      console.log(' DROP:', {
        dragged: draggedCollection.name,
        draggedId: draggedCollection.id,
        target: targetCollection.name,
        targetId: targetCollection.id
      });

      const draggedSharedWith = draggedCollection.sharedWith || draggedCollection.memberships || [];
      const targetSharedWith = targetCollection.sharedWith || targetCollection.memberships || [];
      
      const draggedIsShared = draggedSharedWith.length > 0;
      const targetIsShared = targetSharedWith.length > 0;

      if (draggedIsShared) {
        notifications.show({
          title: 'Nie można przenieść',
          message: 'Nie można zagnieżdżać kolekcji udostępnionych innym użytkownikom',
          color: 'red',
          icon: <IconLock size={16} />
        });
        return;
      }

      if (targetIsShared) {
        notifications.show({
          title: 'Nie można przenieść',
          message: 'Nie można tworzyć podkolekcji w kolekcji udostępnionej',
          color: 'red',
          icon: <IconLock size={16} />
        });
        return;
      }

      if (onUpdate) {
        await onUpdate(draggedCollection.id, { 
          parentId: targetCollection.id 
        });
      }
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
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  c="#9ca3af"
                  style={{ width: '20px', height: '20px' }}
                >
                  <IconSortAscending size={11} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
              <Menu.Label c="#6b7280" fz="10px">Sortuj</Menu.Label>
              <Menu.Item
                onClick={() => setSortBy('name')}
                c={sortBy === 'name' ? '#3b82f6' : '#111827'}
                fz="11px"
                style={{ padding: '4px 8px' }}
              >
                A-Z
              </Menu.Item>
              <Menu.Item
                onClick={() => setSortBy('date')}
                c={sortBy === 'date' ? '#3b82f6' : '#111827'}
                fz="11px"
                style={{ padding: '4px 8px' }}
              >
                Data
              </Menu.Item>
              <Menu.Item
                onClick={() => setSortBy('items')}
                c={sortBy === 'items' ? '#3b82f6' : '#111827'}
                fz="11px"
                style={{ padding: '4px 8px' }}
              >
                Liczba
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

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

          <Tooltip label="Szukaj" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="subtle"
              c="#9ca3af"
              onClick={() => setSearchVisible(!searchVisible)}
              style={{
                backgroundColor: searchVisible ? '#f3f4f6' : 'transparent',
                width: '20px',
                height: '20px'
              }}
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
            input: {
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              color: '#111827',
              fontSize: '12px',
              height: '26px',
              minHeight: '26px',
              '&:focus': {
                borderColor: '#3b82f6',
                backgroundColor: '#ffffff'
              }
            }
          }}
          rightSection={
            searchQuery && (
              <ActionIcon
                size="xs"
                variant="transparent"
                onClick={() => setSearchQuery('')}
                c="#6b7280"
              >
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
              onUpdate={onUpdate}
              onDelete={onDelete}
              onShare={onShare}
              itemCount={getCollectionItemCount ? getCollectionItemCount(collection.id) : 0}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}