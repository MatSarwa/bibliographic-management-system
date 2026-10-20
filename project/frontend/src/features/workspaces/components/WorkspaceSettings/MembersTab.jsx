import { Stack, Card, Text, Group, TextInput, Select, Button, Divider, Loader, Center } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import workspaceService from '../../services/workspaceService';
import MemberCard from './MemberCard';
import { confirmAction } from '../../../../shared/utils/confirm';

export default function MembersTab({
  workspace,
  members,
  loadingMembers,
  currentUserId,
  isOwner,
  myRole,
  canManageMembers,
  onRefresh,
  onUpdate
}) {
  const [newMemberIdentifier, setNewMemberIdentifier] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('viewer');
  const [loading, setLoading] = useState(false);

  const handleAddMember = async () => {
    if (!newMemberIdentifier.trim()) {
      notifications.show({ title: 'Błąd', message: 'Wpisz email lub username', color: 'red' });
      return;
    }

    setLoading(true);
    const isEmail = newMemberIdentifier.includes('@');
    const result = await workspaceService.addMember(workspace.id, {
      [isEmail ? 'email' : 'username']: newMemberIdentifier.trim(),
      role: newMemberRole
    });
    setLoading(false);

    if (result.success) {
      setNewMemberIdentifier('');
      setNewMemberRole('viewer');
      notifications.show({ title: 'Sukces!', message: 'Członek dodany pomyślnie!', color: 'green' });
      onRefresh();
      onUpdate?.();
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!(await confirmAction({ title: 'Usunąć członka?', message: 'Ta osoba straci dostęp do workspace’u.', confirmLabel: 'Usuń' }))) return;
    const result = await workspaceService.removeMember(workspace.id, userId);
    if (result.success) {
      notifications.show({ title: 'Sukces!', message: 'Członek usunięty', color: 'green' });
      onRefresh();
      onUpdate?.();
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const result = await workspaceService.updateMemberRole(workspace.id, userId, newRole);
    if (result.success) {
      notifications.show({ title: 'Sukces!', message: 'Rola zaktualizowana', color: 'green' });
      onRefresh();
      onUpdate?.();
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
    }
  };

  const handleTransferOwnership = async (newOwnerId) => {
    const member = members?.members?.find(m => m.user?.id === newOwnerId);
    const memberName = member?.user?.username || 'tego użytkownika';

    if (!(await confirmAction({ title: 'Przekazać własność?', message: `${memberName} zostanie nowym właścicielem workspace’u.`, confirmLabel: 'Przekaż' }))) return;

    const result = await workspaceService.transferOwnership(workspace.id, newOwnerId);
    if (result.success) {
      notifications.show({ title: 'Sukces!', message: 'Właścicielstwo przekazane', color: 'green' });
      onRefresh();
      onUpdate?.();
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
    }
  };

  return (
    <Stack gap="md">
      {canManageMembers && (
        <Card p="md" withBorder>
          <Text size="sm" fw={600} mb="md">Dodaj członka</Text>
          <Stack gap="sm">
            <Group align="flex-start">
              <TextInput
                placeholder="Email lub username"
                value={newMemberIdentifier}
                onChange={(e) => setNewMemberIdentifier(e.target.value)}
                style={{ flex: 1 }}
              />
              <Select
                value={newMemberRole}
                onChange={setNewMemberRole}
                data={[
                  { value: 'viewer', label: 'Viewer' },
                  { value: 'editor', label: 'Editor' },
                  ...(isOwner ? [{ value: 'admin', label: 'Admin' }] : [])
                ]}
                w={120}
              />
            </Group>
            <Button leftSection={<IconUserPlus size={16} />} onClick={handleAddMember} loading={loading} fullWidth color="violet">
              Dodaj członka
            </Button>
          </Stack>
        </Card>
      )}

      <Divider label="Członkowie workspace" labelPosition="center" />

      {loadingMembers ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : (
        <Stack gap="xs">
          {members?.creator && (
            <MemberCard
              member={{ user: members.creator, role: 'owner' }}
              isOwner={true}
              isCreator={true}
              isSelf={String(members.creator.id) === String(currentUserId)}
              canEdit={false}
              canRemove={false}
              onChangeRole={() => { }}
              onRemove={() => { }}
              onTransferOwnership={() => { }}
            />
          )}

          {members?.members
            ?.filter(member => String(member.user?.id) !== String(members.creator?.id))
            .map((member) => {
              const isSelf = String(member.user?.id) === String(currentUserId);
              const canEdit = isOwner || (myRole === 'admin' && member.role !== 'admin');
              const canRemove = isOwner || (myRole === 'admin' && member.role !== 'admin');

              return (
                <MemberCard
                  key={member.id}
                  member={member}
                  isOwner={isOwner}
                  isCreator={false}
                  isSelf={isSelf}
                  canEdit={canEdit}
                  canRemove={canRemove}
                  onChangeRole={(newRole) => handleChangeRole(member.user.id, newRole)}
                  onRemove={() => handleRemoveMember(member.user.id)}
                  onTransferOwnership={() => handleTransferOwnership(member.user.id)}
                />
              );
            })}

          {(!members?.members || members.members.filter(m => m.user?.id !== members.creator?.id).length === 0) && (
            <Text size="sm" c="dimmed" ta="center" py="md" fs="italic">
              Brak innych członków. Zaproś kogoś!
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}