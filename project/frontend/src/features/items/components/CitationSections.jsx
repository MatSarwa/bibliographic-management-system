import { useState } from 'react';
import { 
  Box, 
  Text, 
  Select, 
  Button, 
  CopyButton, 
  Paper, 
  Group,
  Loader,
  Collapse
} from '@mantine/core';
import { IconQuote, IconCopy, IconCheck, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../../shared/utils/api';

const CITATION_STYLES = [
  { value: 'apa', label: 'APA 7th - Psychologia, Nauki społeczne' },
  { value: 'mla', label: 'MLA 9th - Literatura, Humanistyka' },
  { value: 'chicago', label: 'Chicago - Historia, Sztuka' },
  { value: 'harvard', label: 'Harvard - Ogólny akademicki' },
  { value: 'ieee', label: 'IEEE - Inżynieria, IT' },
  { value: 'vancouver', label: 'Vancouver - Medycyna, Biologia' }
];

export default function CitationSection({ itemId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState('apa');
  const [citation, setCitation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!itemId) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/citations/item/${itemId}?style=${style}`);
      setCitation(data.data.citation);
    } catch (err) {
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się wygenerować cytatu',
        color: 'red'
      });
      setCitation('');
    } finally {
      setLoading(false);
    }
  };

  if (!itemId) return null;

  return (
    <Box mt="md">
      <Group
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        mb="xs"
      >
        <IconQuote size={16} style={{ color: 'var(--mantine-primary-color-filled)' }} />
        <Text size="sm" fw={600} c="var(--mantine-color-text)" style={{ flex: 1 }}>
          Generuj cytat
        </Text>
        {isOpen ? (
          <IconChevronUp size={16} style={{ color: 'var(--mantine-color-placeholder)' }} />
        ) : (
          <IconChevronDown size={16} style={{ color: 'var(--mantine-color-placeholder)' }} />
        )}
      </Group>

      <Collapse in={isOpen}>
        <Paper p="sm" radius="md" style={{ backgroundColor: 'var(--app-hover)', border: '1px solid var(--mantine-color-default-border)' }}>
          <Select
            label="Styl cytowania"
            placeholder="Wybierz styl"
            data={CITATION_STYLES}
            value={style}
            onChange={setStyle}
            size="xs"
            mb="sm"
            styles={{
              label: { fontSize: '11px', color: 'var(--mantine-color-dimmed)', marginBottom: '4px' },
              input: { fontSize: '12px' }
            }}
          />

          <Button
            onClick={handleGenerate}
            loading={loading}
            fullWidth
            size="xs"
            variant="light"
            color="indigo"
            leftSection={!loading && <IconQuote size={14} />}
            mb="sm"
          >
            Generuj cytat
          </Button>

          {citation && (
            <Box>
              <Text size="xs" c="dimmed" mb={4}>
                Wygenerowany cytat:
              </Text>
              <Paper
                p="xs"
                radius="sm"
                style={{
                  backgroundColor: 'var(--mantine-color-body)',
                  border: '1px solid var(--mantine-color-default-border)',
                  fontSize: '11px',
                  lineHeight: 1.5,
                  color: 'var(--mantine-color-text)'
                }}
              >
                {citation}
              </Paper>

              <CopyButton value={citation}>
                {({ copied, copy }) => (
                  <Button
                    onClick={copy}
                    fullWidth
                    size="xs"
                    variant={copied ? 'filled' : 'outline'}
                    color={copied ? 'teal' : 'gray'}
                    mt="xs"
                    leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  >
                    {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
                  </Button>
                )}
              </CopyButton>
            </Box>
          )}
        </Paper>
      </Collapse>
    </Box>
  );
}