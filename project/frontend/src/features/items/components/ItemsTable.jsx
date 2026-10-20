import {
  Table,
  Checkbox,
  ActionIcon,
  Menu,
  Text,
  Badge,
  Group,
  Tooltip,
  Box
} from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconHistory,
  IconTag
} from '@tabler/icons-react';
import { useState } from 'react';
import CommentsModal from '../../comments/components/CommentsModal';
import HistoryModal from '../../history/components/HistoryModal';
import AssignLabelsModal from '../../labels/components/AssignLabelsModal';

export default function ItemsTable({
  filteredItems,
  selectedItemIds,
  onToggleSelectAll,
  onItemSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleSelect,
  onColumnStateChange,
  onRefresh,
  isWorkspace = false
}) {
  const [commentsModalOpened, setCommentsModalOpened] = useState(false);
  const [historyModalOpened, setHistoryModalOpened] = useState(false);
  const [labelsModalOpened, setLabelsModalOpened] = useState(false);
  const [selectedItemForComments, setSelectedItemForComments] = useState(null);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);
  const [selectedItemForLabels, setSelectedItemForLabels] = useState(null);

  const handleOpenComments = (item, e) => {
    e.stopPropagation();
    setSelectedItemForComments(item);
    setCommentsModalOpened(true);
  };

  const handleOpenHistory = (item, e) => {
    e.stopPropagation();
    setSelectedItemForHistory(item);
    setHistoryModalOpened(true);
  };

  const handleOpenLabels = (item, e) => {
    e.stopPropagation();
    setSelectedItemForLabels(item);
    setLabelsModalOpened(true);
  };

  const handleVersionRestored = () => {
    onRefresh?.();
  };

  const handleLabelsAssigned = () => {
    onRefresh?.();
  };

  return (
    <>
      <Table highlightOnHover verticalSpacing="xs" fontSize="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '40px' }}>
              <Checkbox
                checked={selectedItemIds.length === filteredItems.length && filteredItems.length > 0}
                indeterminate={selectedItemIds.length > 0 && selectedItemIds.length < filteredItems.length}
                onChange={onToggleSelectAll}
              />
            </Table.Th>
            <Table.Th>Tytuł</Table.Th>
            <Table.Th>Autorzy</Table.Th>
            <Table.Th style={{ width: '80px' }}>Rok</Table.Th>
            <Table.Th style={{ width: '120px' }}>Typ</Table.Th>

            {!isWorkspace && (
              <Table.Th style={{ width: '150px' }}>Etykiety</Table.Th>
            )}

            <Table.Th style={{ width: isWorkspace ? '120px' : '60px' }}>Akcje</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredItems.map((item) => (
            <Table.Tr
              key={item.id}
              onClick={() => onItemSelect(item)}
              style={{ cursor: 'pointer' }}
            >
              <Table.Td onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedItemIds.includes(item.id)}
                  onChange={() => onToggleSelect(item.id)}
                />
              </Table.Td>

              <Table.Td>
                <Text size="sm" fw={500}>
                  {item.title}
                </Text>
              </Table.Td>

              <Table.Td>
                <Text size="sm" c="dimmed">
                  {item.metadata?.authors?.map(a => {
                    if (typeof a === 'string') return a;
                    if (a.fullName) return a.fullName;
                    if (a.firstName || a.lastName) {
                      return `${a.firstName || ''} ${a.lastName || ''}`.trim();
                    }
                    return '';
                  }).filter(Boolean).join(', ') || '-'}
                </Text>
              </Table.Td>

              <Table.Td>
                <Text size="sm">{item.year || '-'}</Text>
              </Table.Td>

              <Table.Td>
                <Badge size="sm" variant="light">
                  {item.itemType}
                </Badge>
              </Table.Td>

              {!isWorkspace && (
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <Group gap={6} wrap="nowrap">
                    {item.labels?.slice(0, 3).map((label) => (
                      <Tooltip key={label.id} label={label.name} withArrow>
                        <Box
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: label.color,
                            border: '2px solid white',
                            boxShadow: '0 0 0 1px var(--mantine-color-default-border)',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLabels(item, e);
                          }}
                        />
                      </Tooltip>
                    ))}

                    {item.labels?.length > 3 && (
                      <Tooltip
                        label={item.labels.slice(3).map(l => l.name).join(', ')}
                        withArrow
                      >
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ cursor: 'pointer', flexShrink: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLabels(item, e);
                          }}
                        >
                          +{item.labels.length - 3}
                        </Text>
                      </Tooltip>
                    )}

                    <Tooltip label="Zarządzaj etykietami" withArrow>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="violet"
                        onClick={(e) => handleOpenLabels(item, e)}
                        style={{ flexShrink: 0 }}
                      >
                        <IconTag size={12} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              )}

              <Table.Td onClick={(e) => e.stopPropagation()}>
                <Group gap={4} wrap="nowrap">

                  {isWorkspace && (
                    <>
                      <Tooltip label="Komentarze" withArrow>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={(e) => handleOpenComments(item, e)}
                        >
                          <IconMessageCircle size={16} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Historia zmian" withArrow>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="violet"
                          onClick={(e) => handleOpenHistory(item, e)}
                        >
                          <IconHistory size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  )}

                  {!isWorkspace && (
                    <Tooltip label={item.favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'} withArrow>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color={item.favorite ? 'red' : 'gray'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id, item.favorite);
                        }}
                      >
                        {item.favorite ? (
                          <IconHeartFilled size={16} />
                        ) : (
                          <IconHeart size={16} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}

                  <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon size="sm" variant="subtle">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                      >
                        Edytuj
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                      >
                        Usuń
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {isWorkspace && (
        <>
          <CommentsModal
            opened={commentsModalOpened}
            onClose={() => {
              setCommentsModalOpened(false);
              setSelectedItemForComments(null);
            }}
            item={selectedItemForComments}
          />

          <HistoryModal
            opened={historyModalOpened}
            onClose={() => {
              setHistoryModalOpened(false);
              setSelectedItemForHistory(null);
            }}
            item={selectedItemForHistory}
            onVersionRestored={handleVersionRestored}
          />
        </>
      )}

      {!isWorkspace && (
        <AssignLabelsModal
          opened={labelsModalOpened}
          onClose={() => {
            setLabelsModalOpened(false);
            setSelectedItemForLabels(null);
          }}
          item={selectedItemForLabels}
          onSuccess={handleLabelsAssigned}
        />
      )}
    </>
  );
}