import { Text, Group, ActionIcon, Tooltip, TextInput } from '@mantine/core';
import { IconPlus, IconSearch, IconSortAscending, IconX } from '@tabler/icons-react';
import WorkspaceList from "../../../workspaces/components/WorkspaceList/index";

export default function WorkspacesSection({
  workspaces,
  workspaceSearch,
  setWorkspaceSearch,
  workspaceSort,
  showWorkspaceSearch,
  onToggleSearch,
  onToggleSort,
  onCreateNew,
  onSelectCollection
}) {
  return (
    <>
      <Group justify="space-between" mb={4} gap={2}>
        <Text size="10px" fw={600} c="var(--mantine-color-placeholder)" tt="uppercase" lts="0.8px">
          Workspaces
        </Text>

        <Group gap={2}>
          

          <Tooltip
            label={workspaceSort === 'name' ? 'Sortuj po dacie' : 'Sortuj alfabetycznie'}
            position="top"
            withArrow
          >
            <ActionIcon
              size="xs"
              variant="subtle"
              c="var(--mantine-color-placeholder)"
              onClick={onToggleSort}
              style={{ width: '20px', height: '20px' }}
            >
              <IconSortAscending size={11} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Dodaj workspace" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="subtle"
              c="var(--mantine-color-placeholder)"
              onClick={onCreateNew}
              style={{ width: '20px', height: '20px' }}
            >
              <IconPlus size={11} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Szukaj workspace" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="subtle"
              c={showWorkspaceSearch || workspaceSearch ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-placeholder)'}
              onClick={onToggleSearch}
              style={{ width: '20px', height: '20px' }}
            >
              <IconSearch size={11} />
            </ActionIcon>
          </Tooltip>

        </Group>
      </Group>

      {showWorkspaceSearch && (
        <TextInput
          placeholder="Szukaj workspace..."
          leftSection={<IconSearch size={12} />}
          value={workspaceSearch}
          onChange={(e) => setWorkspaceSearch(e.target.value)}
          size="xs"
          mb={4}
          autoFocus
          rightSection={
            workspaceSearch && (
              <ActionIcon
                size="xs"
                variant="transparent"
                onClick={() => setWorkspaceSearch('')}
              >
                <IconX size={12} />
              </ActionIcon>
            )
          }
          styles={{
            input: {
              fontSize: '12px',
              height: '28px',
              minHeight: '28px'
            }
          }}
        />
      )}

      <WorkspaceList
        workspaces={workspaces}
        onSelectCollection={onSelectCollection}
      />
    </>
  );
}