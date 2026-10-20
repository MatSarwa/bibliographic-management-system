import React, { useState } from 'react';
import { Text, Box, ActionIcon, Menu } from '@mantine/core';
import { IconFolder, IconDots, IconEdit, IconDownload, IconTrash } from '@tabler/icons-react';

export default function CollectionItem({
  collection,
  workspace,
  level,
  onSelectCollection,
  onEdit,
  onDelete,
  onExport
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !menuOpened && setIsHovered(false)}
      onClick={() => onSelectCollection(collection, workspace)}
      style={{
        paddingLeft: `${level * 16}px`,
        paddingRight: '4px',
        paddingTop: '2px',
        paddingBottom: '2px',
        cursor: 'pointer',
        backgroundColor: isHovered ? 'var(--app-hover)' : 'transparent',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        minHeight: '24px'
      }}
    >
      <Box mr={6}>
        <IconFolder size={12} style={{ color: collection.settings?.color || 'var(--mantine-color-placeholder)' }} />
      </Box>

      <Text
        size="12px"
        c="dimmed"
        style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {collection.name}
      </Text>

      {isHovered && (
        <Menu shadow="md" width={200} opened={menuOpened} onChange={setMenuOpened}>
          <Menu.Target>
            <ActionIcon
              size="xs"
              variant="transparent"
              c="var(--mantine-color-placeholder)"
              onClick={(e) => { e.stopPropagation(); setMenuOpened(!menuOpened); }}
            >
              <IconDots size={12} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label fz="10px">Zarządzanie</Menu.Label>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={(e) => { e.stopPropagation(); onEdit(collection); setMenuOpened(false); }}
              fz="12px"
            >
              Edytuj
            </Menu.Item>

            <Menu.Divider />
            <Menu.Label fz="10px">Eksport</Menu.Label>
            <Menu.Item
              leftSection={<IconDownload size={14} />}
              onClick={(e) => { onExport(collection.id, 'bibtex', e); setMenuOpened(false); }}
              fz="12px"
            >
              BibTeX (.bib)
            </Menu.Item>
            <Menu.Item
              leftSection={<IconDownload size={14} />}
              onClick={(e) => { onExport(collection.id, 'ris', e); setMenuOpened(false); }}
              fz="12px"
            >
              RIS (.ris)
            </Menu.Item>

            <Menu.Divider />
            <Menu.Item
              leftSection={<IconTrash size={14} />}
              color="red"
              onClick={(e) => { e.stopPropagation(); onDelete(collection.id, collection.name); setMenuOpened(false); }}
              fz="12px"
            >
              Usuń kolekcję
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </Box>
  );
}