import {
  Group,
  TextInput,
  ActionIcon,
  Tooltip,
  Menu,
  Badge
} from '@mantine/core';
import { IconSearch, IconFilter, IconX, IconSortAscending } from '@tabler/icons-react';
import { useState } from 'react';
import FilterModal from './FilterModal';

export default function ItemsToolbar({
  search,
  setSearch,
  sortBy,
  setSortBy,
  selectedLabels = [],
  onLabelsChange,
  columnState
}) {
  const [filterModalOpened, setFilterModalOpened] = useState(false);

  const handleApplyFilters = (newSelectedLabels) => {
    onLabelsChange(newSelectedLabels);
  };

  return (
    <>
      <Group mb="md" gap="sm">
        <TextInput
          placeholder="Szukaj po tytule, autorze, roku..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '250px' }}
          rightSection={
            search && (
              <ActionIcon
                size="sm"
                variant="transparent"
                onClick={() => setSearch('')}
                style={{ cursor: 'pointer' }}
              >
                <IconX size={14} />
              </ActionIcon>
            )
          }
        />

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Tooltip label="Sortuj" withArrow>
              <ActionIcon size={36} variant="light" color="violet">
                <IconSortAscending size={18} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Sortuj po</Menu.Label>
            <Menu.Item 
              onClick={() => setSortBy('dateAdded')}
              style={{ 
                backgroundColor: sortBy === 'dateAdded' ? '#f3f4f6' : 'transparent',
                fontWeight: sortBy === 'dateAdded' ? 500 : 400
              }}
            >
              Data dodania
            </Menu.Item>
            <Menu.Item 
              onClick={() => setSortBy('title')}
              style={{ 
                backgroundColor: sortBy === 'title' ? '#f3f4f6' : 'transparent',
                fontWeight: sortBy === 'title' ? 500 : 400
              }}
            >
              Tytuł
            </Menu.Item>
            <Menu.Item 
              onClick={() => setSortBy('year')}
              style={{ 
                backgroundColor: sortBy === 'year' ? '#f3f4f6' : 'transparent',
                fontWeight: sortBy === 'year' ? 500 : 400
              }}
            >
              Rok
            </Menu.Item>
            <Menu.Item 
              onClick={() => setSortBy('author')}
              style={{ 
                backgroundColor: sortBy === 'author' ? '#f3f4f6' : 'transparent',
                fontWeight: sortBy === 'author' ? 500 : 400
              }}
            >
              Autor
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Tooltip 
          label={selectedLabels.length > 0 ? `Filtruje po ${selectedLabels.length} etykietach` : 'Filtruj'} 
          withArrow
        >
          <ActionIcon
            size={36}
            variant={selectedLabels.length > 0 ? 'filled' : 'light'}
            color="violet"
            onClick={() => setFilterModalOpened(true)}
            style={{
              position: 'relative'
            }}
          >
            <IconFilter size={18} />
            {selectedLabels.length > 0 && (
              <Badge
                size="xs"
                variant="filled"
                color="violet"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 18,
                  height: 18,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}
              >
                {selectedLabels.length}
              </Badge>
            )}
          </ActionIcon>
        </Tooltip>
      </Group>

      <FilterModal
        opened={filterModalOpened}
        onClose={() => setFilterModalOpened(false)}
        selectedLabels={selectedLabels}
        onApply={handleApplyFilters}
      />
    </>
  );
}