import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';

// Styled replacement for window.confirm: `if (!(await confirmAction({...}))) return;`
// Resolves true on confirm, false on cancel or when the dialog is closed any other way.
export function confirmAction({ title, message, confirmLabel = 'Usuń', danger = true }) {
  return new Promise((resolve) => {
    modals.openConfirmModal({
      title,
      centered: true,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: confirmLabel, cancel: 'Anuluj' },
      confirmProps: { color: danger ? 'red' : 'violet' },
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
      onClose: () => resolve(false),
    });
  });
}
