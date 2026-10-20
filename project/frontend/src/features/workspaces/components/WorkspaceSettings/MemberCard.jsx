import { Card, Group, Avatar, Text, Badge, ActionIcon, Select } from '@mantine/core';
import { IconCrown, IconArrowsExchange, IconTrash } from '@tabler/icons-react';

export default function MemberCard({
  member,
  isOwner,
  isCreator,
  isSelf,
  canEdit,
  canRemove,
  onChangeRole,
  onRemove,
  onTransferOwnership
}) {
  const roleColors = {
    admin: 'orange',
    editor: 'blue',
    viewer: 'gray'
  };

  if (isCreator) {
    return (
      <Card p="sm" withBorder style={{ borderColor: 'var(--mantine-color-grape-6)', borderWidth: 2 }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar color="violet" size="sm" radius="xl">
              {member.user?.username?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <div>
              <Group gap={4}>
                <Text size="sm" fw={500}>{member.user?.username}</Text>
                {isSelf && <Badge size="xs" variant="light" color="gray">Ty</Badge>}
              </Group>
              <Text size="xs" c="dimmed">{member.user?.email}</Text>
            </div>
          </Group>
          <Badge color="violet" variant="filled" leftSection={<IconCrown size={10} />}>
            Właściciel
          </Badge>
        </Group>
      </Card>
    );
  }

  return (
    <Card p="sm" withBorder>
      <Group justify="space-between">
        <Group gap="sm">
          <Avatar color="cyan" size="sm" radius="xl">
            {member.user?.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <div>
            <Group gap={4}>
              <Text size="sm" fw={500}>{member.user?.username || 'Unknown'}</Text>
              {isSelf && <Badge size="xs" variant="light" color="gray">Ty</Badge>}
            </Group>
            <Text size="xs" c="dimmed">{member.user?.email || ''}</Text>
          </div>
        </Group>
        
        <Group gap="xs">
          {canEdit ? (
            <Select
              value={member.role}
              onChange={onChangeRole}
              data={[
                { value: 'viewer', label: 'Viewer' },
                { value: 'editor', label: 'Editor' },
                ...(isOwner ? [{ value: 'admin', label: 'Admin' }] : [])
              ]}
              size="xs"
              w={110}
            />
          ) : (
            <Badge color={roleColors[member.role] || 'gray'}>{member.role}</Badge>
          )}
          
          {isOwner && !isSelf && (
            <ActionIcon color="violet" variant="subtle" onClick={onTransferOwnership} title="Przekaż właścicielstwo">
              <IconArrowsExchange size={16} />
            </ActionIcon>
          )}
          
          {canRemove && !isSelf && (
            <ActionIcon color="red" variant="subtle" onClick={onRemove} title="Usuń członka">
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Card>
  );
}