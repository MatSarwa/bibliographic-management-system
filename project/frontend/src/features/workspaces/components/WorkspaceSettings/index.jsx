import { Modal, Tabs, Group, Text, Badge } from '@mantine/core';
import { IconSettings, IconUsers, IconCrown } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import workspaceService from '../../services/workspaceService';
import WorkspaceModal from '../WorkspaceModal';
import MembersTab from './MembersTab';
import SettingsTab from './SettingsTab';
import { useAuthStore } from '../../../auth/store/authStore'; 

export default function WorkspaceSettings({ workspace, opened, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('members');
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const { user } = useAuthStore();
  const currentUserId = user?.id;
const isOwner = !!(currentUserId && workspace?.createdBy && 
  String(workspace.createdBy) === String(currentUserId));
const myMembership = members?.members?.find(m => String(m.user?.id) === String(currentUserId));
const myRole = isOwner ? 'owner' : myMembership?.role;
const canManageMembers = isOwner || myRole === 'admin';


  console.log('PERMISSIONS:', { isOwner, myRole, canManageMembers, currentUserId, createdBy: workspace?.createdBy });

  console.log('WorkspaceSettings:', { 
    isOwner, 
    myRole, 
    canManageMembers, 
    createdBy: workspace?.createdBy, 
    currentUserId 
  });

   console.log('AUTH STORE USER:', user);
  console.log('WORKSPACE:', workspace);
  
  useEffect(() => {
    if (workspace && opened) fetchMembers();
  }, [workspace, opened]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    const result = await workspaceService.getMembers(workspace.id);
    if (result.success) {
      setMembers(result.data);
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
    }
    setLoadingMembers(false);
  };

  const handleUpdateWorkspace = async (data, id) => {
    const result = await workspaceService.update(id, data);
    if (result.success) {
      notifications.show({ title: 'Sukces!', message: 'Workspace zaktualizowany', color: 'green' });
      onUpdate?.();
      return true;
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
      return false;
    }
  };

  if (!workspace) return null;

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group gap="xs">
            <Text fw={600}>{workspace.name}</Text>
            {isOwner && (
              <Badge color="violet" size="sm" leftSection={<IconCrown size={12} />}>
                Właściciel
              </Badge>
            )}
          </Group>
        }
        size="lg"
      >
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="members" leftSection={<IconUsers size={16} />}>Członkowie</Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>Ustawienia</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="members" pt="md">
            <MembersTab
              workspace={workspace}
              members={members}
              loadingMembers={loadingMembers}
              currentUserId={currentUserId}
              isOwner={isOwner}
              myRole={myRole}
              canManageMembers={canManageMembers}
              onRefresh={fetchMembers}
              onUpdate={onUpdate}
            />
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="md">
            <SettingsTab
              workspace={workspace}
              members={members}
              isOwner={isOwner}
              canManageMembers={canManageMembers}
              loading={loading}
              setLoading={setLoading}
              onClose={onClose}
              onUpdate={onUpdate}
              onOpenEditModal={() => setEditModalOpened(true)}
            />
          </Tabs.Panel>
        </Tabs>
      </Modal>

      <WorkspaceModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        editWorkspace={workspace}
        onSuccess={handleUpdateWorkspace}
      />
    </>
  );
}