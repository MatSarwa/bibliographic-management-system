import { Stack, Card, Text, Button, Alert } from '@mantine/core';
import { IconEdit, IconDoorExit, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import workspaceService from '../../services/workspaceService';
import { confirmAction } from '../../../../shared/utils/confirm';

export default function SettingsTab({
  workspace,
  members,
  isOwner,
  canManageMembers,
  loading,
  setLoading,
  onClose,
  onUpdate,
  onOpenEditModal
}) {
  const handleDelete = async () => {
    if (!(await confirmAction({ title: 'Usunąć workspace?', message: 'Workspace i wszystkie jego kolekcje zostaną usunięte. Tej operacji nie można cofnąć.', confirmLabel: 'Usuń workspace' }))) return;

    const result = await workspaceService.delete(workspace.id);
    if (result.success) {
      notifications.show({ title: 'Sukces!', message: 'Workspace usunięty', color: 'green' });
      onClose();
      onUpdate?.();
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!(await confirmAction({ title: 'Opuścić workspace?', message: 'Stracisz dostęp do jego kolekcji, dopóki ktoś nie doda Cię ponownie.', confirmLabel: 'Opuść' }))) return;

    setLoading(true);
    const result = await workspaceService.leaveWorkspace(workspace.id);
    setLoading(false);

    if (result.success) {
      notifications.show({ title: 'Opuszczono workspace', message: 'Pomyślnie opuściłeś workspace', color: 'blue' });
      onClose();
      onUpdate?.();
    } else {
      notifications.show({ title: 'Błąd', message: result.error, color: 'red' });
    }
  };

  return (
    <Stack gap="md">
      {canManageMembers && (
        <Card p="md" withBorder>
          <Text size="sm" fw={600} mb="sm">Podstawowe</Text>
          <Button leftSection={<IconEdit size={16} />} variant="light" color="violet" fullWidth onClick={onOpenEditModal}>
            Edytuj workspace
          </Button>
        </Card>
      )}

      {!isOwner && (
        <Card p="md" withBorder style={{ borderColor: 'var(--mantine-color-orange-5)' }}>
          <Text size="sm" fw={600} c="orange" mb="xs">Członkostwo</Text>
          <Text size="xs" c="dimmed" mb="sm">
            Opuszczenie workspace spowoduje utratę dostępu do wszystkich jego zasobów.
          </Text>
          <Button leftSection={<IconDoorExit size={16} />} color="orange" variant="light" fullWidth onClick={handleLeaveWorkspace} loading={loading}>
            Opuść workspace
          </Button>
        </Card>
      )}

      {isOwner && (
        <Card p="md" withBorder style={{ borderColor: 'var(--mantine-color-red-6)' }}>
          <Text size="sm" fw={600} c="red" mb="xs">Strefa niebezpieczna</Text>
          
          {members?.members?.length <= 1 ? (
            <Text size="xs" c="dimmed" mb="sm">
              Jako jedyny członek workspace, możesz go usunąć.
            </Text>
          ) : (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="sm">
              <Text size="xs">
                Jako właściciel nie możesz opuścić workspace. Najpierw przekaż właścicielstwo lub usuń workspace.
              </Text>
            </Alert>
          )}
          
          <Button leftSection={<IconTrash size={16} />} color="red" variant="light" fullWidth onClick={handleDelete}>
            Usuń workspace
          </Button>
        </Card>
      )}
    </Stack>
  );
}