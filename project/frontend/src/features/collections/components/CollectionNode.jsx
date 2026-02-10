import React, { useState } from 'react';
import {
  Box,
  Text,
  ActionIcon,
  Group,
  Menu,
  Collapse,
  UnstyledButton,
  Tooltip
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
  IconChevronRight
} from '@tabler/icons-react';

export default function CollectionNode({
  collection,
  level = 0,
  selectedCollection,
  onSelectCollection,
  onEdit,
  onDelete,
  onShare,
  itemCount = 0,
  draggable = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  showShareOption = true,
  showExportOption = true,
  showDragHandle = true,
  renderChildren = true,
  userRole = null,
  workspaceId = null
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const hasChildren = collection.children && collection.children.length > 0;
  const isSelected = selectedCollection?.id === collection.id;
  const isNested = !!collection.parentId;
  const hasSubfolders = hasChildren;
  
  const sharedWith = collection.sharedWith || collection.memberships || [];
  const isShared = sharedWith.length > 0;
  const memberCount = sharedWith.length;
  const canShare = showShareOption && !isNested && !hasSubfolders;

  const canEdit = userRole ? ['admin', 'editor'].includes(userRole) : true;
  const canDelete = userRole ? userRole === 'admin' : true;
  const isSystemDefault = collection.isSystemDefault;

  const canDrag = draggable && !isShared && !isSystemDefault;

  const handleExportCollection = (format, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    
    const baseUrl = workspaceId 
      ? `http://localhost:5000/api/workspaces/${workspaceId}/collections/${collection.id}/export/${format}`
      : `http://localhost:5000/api/items/export/${format}?collectionId=${collection.id}`;
    
    fetch(baseUrl, {
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
      });
  };

  const handleDragStartInternal = (e) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    onDragStart?.(e, collection);
  };

  return (
    <Box>
      <Box
        draggable={canDrag}
        onDragStart={handleDragStartInternal}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop?.(e, collection)}
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
        {showDragHandle && canDrag && (
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

        {showDragHandle && (isShared || isSystemDefault) && (
          <Box style={{ width: '20px', marginRight: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isHovered && (
              <Tooltip label={isSystemDefault ? "Domyślna kolekcja" : "Kolekcja udostępniona"} withArrow>
                <IconLock size={11} color={isSystemDefault ? "#9ca3af" : "#06b6d4"} />
              </Tooltip>
            )}
          </Box>
        )}

        {showDragHandle && !canDrag && !isShared && !isSystemDefault && (
          <Box style={{ width: '24px', marginRight: '4px', flexShrink: 0 }} />
        )}

        {!showDragHandle && <Box style={{ width: '4px' }} />}

        {hasChildren && renderChildren ? (
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

        <Box mr={6} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {hasChildren && isExpanded ? (
            <IconFolderOpen size={14} color="#6b7280" />
          ) : (
            <IconFolder size={14} color={hasChildren ? "#6b7280" : "#9ca3af"} />
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

          {isSystemDefault && (
            <Text size="9px" c="#9ca3af" fs="italic">
              (domyślna)
            </Text>
          )}

          {isShared && (
            <Tooltip label={`Udostępniona dla ${memberCount} osób`} withArrow position="top">
              <Box style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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

        {isHovered && (canEdit || canDelete || showExportOption) && (
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

              {showShareOption && (
                <>
                  <Menu.Label c="#6b7280" fz="10px">Udostępnianie</Menu.Label>
                  <Menu.Item 
                    leftSection={<IconUsers size={14} color={canShare ? '#06b6d4' : '#9ca3af'} />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canShare && onShare) onShare(collection);
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
                </>
              )}

              {showExportOption && (
                <>
                  <Menu.Label c="#6b7280" fz="10px">Eksport</Menu.Label>
                  <Menu.Item 
                    leftSection={<IconDownload size={14} />} 
                    onClick={(e) => { handleExportCollection('bibtex', e); setMenuOpened(false); }} 
                    fz="12px"
                  >
                    BibTeX (.bib)
                  </Menu.Item>
                  <Menu.Item 
                    leftSection={<IconDownload size={14} />} 
                    onClick={(e) => { handleExportCollection('ris', e); setMenuOpened(false); }} 
                    fz="12px"
                  >
                    RIS (.ris)
                  </Menu.Item>
                  <Menu.Divider />
                </>
              )}

              {(canEdit || canDelete) && (
                <>
                  <Menu.Label c="#6b7280" fz="10px">Zarządzanie</Menu.Label>
                  
                  {canEdit && !isSystemDefault && (
                    <Menu.Item 
                      leftSection={<IconEdit size={14} />} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onEdit?.(collection); 
                        setMenuOpened(false); 
                      }} 
                      fz="12px"
                    >
                      Edytuj
                    </Menu.Item>
                  )}
                  
                  {canDelete && !isSystemDefault && (
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Czy na pewno usunąć kolekcję "${collection.name}"?`)) {
                          onDelete?.(collection.id);
                        }
                        setMenuOpened(false);
                      }}
                      fz="12px"
                    >
                      Usuń
                    </Menu.Item>
                  )}
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Box>

      {hasChildren && renderChildren && (
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
                onDelete={onDelete}
                onShare={onShare}
                itemCount={child.itemCount || 0}
                draggable={draggable}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                showShareOption={showShareOption}
                showExportOption={showExportOption}
                showDragHandle={showDragHandle}
                renderChildren={renderChildren}
                userRole={userRole}
                workspaceId={workspaceId}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}