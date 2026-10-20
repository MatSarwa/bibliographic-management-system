import { Table, Text, Badge, ActionIcon, Group, Checkbox, Tooltip } from '@mantine/core';
import { IconStar, IconEdit, IconTrash } from '@tabler/icons-react';
import { formatAuthors } from '../../../shared/utils/authors';

export default function ItemRow({ 
  item, 
  onSelect, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  isSelected, 
  onToggleSelect,
  showYear = true,
  showType = true,
  showTags = true
}) {
  const itemId = item.id;
  
  const displayAuthors = formatAuthors(item, 'Nieznany autor');

  return (
    <Table.Tr
      style={{
        backgroundColor: isSelected ? 'var(--mantine-primary-color-light)' : 'transparent',
        borderBottom: '1px solid var(--mantine-color-default-border)',
        cursor: 'pointer'
      }}
      onClick={() => onSelect(item)}
    >
      <Table.Td 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '45px', 
          padding: '12px 8px',
          textAlign: 'center',
          verticalAlign: 'middle'
        }}
      >
        <Checkbox
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect(itemId);
          }}
          onClick={(e) => e.stopPropagation()}
          size="xs"
          color="blue"
          radius="sm"
          styles={{ input: { cursor: 'pointer', borderWidth: '1.5px' } }}
        />
      </Table.Td>
      
      <Table.Td style={{ verticalAlign: 'middle' }}>
        <Tooltip 
          label={item.title} 
          multiline 
          width={300}
          position="top-start"
          withArrow
          openDelay={500}
          styles={{
            tooltip: {
              backgroundColor: 'var(--mantine-color-body)',
              border: '1px solid var(--mantine-color-default-border)',
              color: 'var(--mantine-color-text)',
              fontSize: '13px'
            }
          }}
        >
          <Text 
            size="sm" 
            fw={500} 
            lineClamp={1} 
            c="var(--mantine-color-text)"
            style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {item.title}
          </Text>
        </Tooltip>
      </Table.Td>
      
      <Table.Td style={{ verticalAlign: 'middle' }}>
        <Tooltip 
          label={displayAuthors} 
          multiline 
          width={250}
          position="top-start"
          withArrow
          openDelay={500}
          styles={{
            tooltip: {
              backgroundColor: 'var(--mantine-color-body)',
              border: '1px solid var(--mantine-color-default-border)',
              color: 'var(--mantine-color-dimmed)',
              fontSize: '13px'
            }
          }}
        >
          <Text 
            size="sm" 
            c="dimmed"
            lineClamp={1} 
            style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {displayAuthors}
          </Text>
        </Tooltip>
      </Table.Td>
      
      {showYear && (
        <Table.Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          <Text size="sm" c="dimmed">{item.year || '—'}</Text>
        </Table.Td>
      )}
      
      {showType && (
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Tooltip label={item.itemType || 'article'} withArrow openDelay={500}>
            <Badge 
              variant="light" 
              size="sm" 
              color="violet" 
              style={{ 
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {item.itemType || 'article'}
            </Badge>
          </Tooltip>
        </Table.Td>
      )}
      
      {showTags && (
        <Table.Td style={{ verticalAlign: 'middle' }}>
          {item.tags && item.tags.length > 0 ? (
            <Tooltip 
              label={item.tags.join(', ')} 
              multiline 
              width={250}
              position="top-start"
              withArrow
              openDelay={500}
              styles={{
                tooltip: {
                  backgroundColor: 'var(--mantine-color-body)',
                  border: '1px solid var(--mantine-color-default-border)',
                  color: 'var(--mantine-color-text)',
                  fontSize: '12px'
                }
              }}
            >
              <Group gap={4} wrap="nowrap">
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <Badge 
                    key={idx} 
                    variant="dot" 
                    size="xs" 
                    color="cyan"
                    style={{ 
                      maxWidth: '60px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 2 && (
                  <Text size="xs" c="dimmed" fw={500}>+{item.tags.length - 2}</Text>
                )}
              </Group>
            </Tooltip>
          ) : (
            <Text size="xs" c="var(--mantine-color-placeholder)">—</Text>
          )}
        </Table.Td>
      )}
      
      <Table.Td onClick={(e) => e.stopPropagation()} style={{ padding: '8px', verticalAlign: 'middle' }}>
        <Group gap={4} justify="center" wrap="nowrap">
          <Tooltip label={item.favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"} withArrow openDelay={300}>
            <ActionIcon
              variant="subtle"
              color={item.favorite ? 'yellow' : 'gray'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
            >
              <IconStar size={15} fill={item.favorite ? 'currentColor' : 'none'} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Edytuj" withArrow openDelay={300}>
            <ActionIcon
              variant="subtle"
              color="violet"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              <IconEdit size={15} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Przenieś do kosza" withArrow openDelay={300}>
            <ActionIcon
              color="red"
              variant="subtle"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // onDelete asks for confirmation itself
                onDelete(itemId);
              }}
            >
              <IconTrash size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}