import { Box, Group, Button, Text, ActionIcon } from '@mantine/core';
import { IconX, IconFileTypePdf, IconDownload } from '@tabler/icons-react';
import api from '../../../shared/utils/api';

export default function ExportPanel({ selectedItemIds, onClose }) {
  const handleExportSelected = async (format) => {
  if (selectedItemIds.length === 0) {
    alert('Zaznacz pozycje do eksportu');
    return;
  }
  
  try {
    const response = await api.post(`/export/items?format=${format}`, 
      { itemIds: selectedItemIds },
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `bibliography_${Date.now()}.${format === 'bibtex' ? 'bib' : 'ris'}`;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    alert('Błąd eksportu: ' + err.message);
  }
};

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--mantine-color-body)',
        borderTop: '2px solid var(--mantine-primary-color-filled)',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '16px 24px',
        zIndex: 1000,
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <Group justify="space-between" gap="sm">
        <Group gap="md">
          <Box
            style={{
              backgroundColor: 'var(--mantine-color-blue-light)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--mantine-color-blue-light)'
            }}
          >
            <Text size="sm" fw={600} c="var(--mantine-color-blue-light-color)">
              {selectedItemIds.length} {selectedItemIds.length === 1 ? 'pozycja' : 'pozycji'} zaznaczona
            </Text>
          </Box>

          <Button
            variant="light"
            color="blue"
            leftSection={<IconFileTypePdf size={16} />}
            onClick={() => handleExportSelected('bibtex')}
            size="sm"
          >
            Eksportuj BibTeX
          </Button>

          <Button
            variant="light"
            color="blue"
            leftSection={<IconDownload size={16} />}
            onClick={() => handleExportSelected('ris')}
            size="sm"
          >
            Eksportuj RIS
          </Button>

          <Button
            variant="subtle"
            size="sm"
            onClick={onClose}
            c="dimmed"
          >
            Odznacz wszystkie
          </Button>
        </Group>

        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={onClose}
          title="Zamknij"
        >
          <IconX size={18} />
        </ActionIcon>
      </Group>
    </Box>
  );
}