import { useState } from 'react';
import { 
  ScrollArea, Box, Badge, Group, ActionIcon, Text, Divider, Paper, Stack,
  Select, Button, CopyButton, Collapse
} from '@mantine/core';
import { 
  IconEdit, IconTag, IconNotes, IconBook, IconUser, IconCalendar,
  IconQuote, IconCopy, IconCheck, IconChevronDown, IconChevronUp 
} from '@tabler/icons-react';
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

export default function DetailPanel({ item, onEdit, onToggleFavorite, isWorkspaceItem = false }) {
  const [citationOpen, setCitationOpen] = useState(false);
  const [citationStyle, setCitationStyle] = useState('apa');
  const [citation, setCitation] = useState('');
  const [citationLoading, setCitationLoading] = useState(false);

  const handleGenerateCitation = async () => {
    if (!item?.id) return;

    setCitationLoading(true);
    try {
      const { data } = await api.get(`/citations/item/${item.id}?style=${citationStyle}`);
      setCitation(data.data.citation);
    } catch (err) {
      notifications.show({
        title: 'Błąd',
        message: 'Nie udało się wygenerować cytatu',
        color: 'red'
      });
      setCitation('');
    } finally {
      setCitationLoading(false);
    }
  };

  if (!item) {
    return (
      <Box p="xl" style={{ textAlign: 'center', paddingTop: 100 }}>
        <IconBook size={48} style={{ color: 'var(--mantine-color-placeholder)', opacity: 0.3 }} />
        <Text size="sm" c="dimmed" mt="md">
          Wybierz pozycję aby zobaczyć szczegóły
        </Text>
      </Box>
    );
  }

  const displayAuthors = (() => {
  const metadata = item.metadata || {};
  
  if (metadata.authors && Array.isArray(metadata.authors) && metadata.authors.length > 0) {
    return metadata.authors.map(a => {
      if (typeof a === 'string') return a;
      if (a.fullName) return a.fullName;
      if (a.firstName || a.lastName) {
        return `${a.firstName || ''} ${a.lastName || ''}`.trim();
      }
      if (a.name) return a.name;
      return '';
    }).filter(Boolean).join(', ');
  }
  
  if (Array.isArray(item.authors) && item.authors.length > 0) {
    return item.authors.map(a => {
      if (typeof a === 'string') return a;
      if (a.fullName) return a.fullName;
      if (a.firstName || a.lastName) {
        return `${a.firstName || ''} ${a.lastName || ''}`.trim();
      }
      return '';
    }).filter(Boolean).join(', ');
  }
  
  if (item.author && typeof item.author === 'string') {
    return item.author;
  }
  
  return 'Nieznany autor';
})();

  const abstractText = item.abstract || item.metadata?.abstract;
  const journal = item.journal || item.metadata?.journal || item.metadata?.conference;
  const volume = item.volume || item.metadata?.volume;
  const issue = item.issue || item.metadata?.issue;
  const pages = item.pages || item.metadata?.pages;
  const url = item.url || item.metadata?.url;
  const keywords = item.keywords || item.metadata?.keywords || [];
  const location = item.metadata?.location;
  const date = item.metadata?.date;

  return (
    <ScrollArea h="calc(100vh - 60px)" type="auto">
      <Box p="md">
        <Group justify="space-between" mb="md">
          <Badge variant="light" color="violet" size="sm">
            {item.itemType || 'article'}
          </Badge>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="violet" onClick={() => onEdit(item)} size="sm">
              <IconEdit size={16} />
            </ActionIcon>
          </Group>
        </Group>

<Text size="md" fw={700} c="var(--mantine-color-text)" mb="xs" style={{ lineHeight: 1.3 }}>
  {item.title}
</Text>

{(item.doi || item.metadata?.doi || item.isbn || item.metadata?.isbn) && (
  <Group gap="xs" mb="xs">
    {(item.doi || item.metadata?.doi) && (
      <Badge 
        variant="light" 
        color="blue" 
        size="xs"
        style={{ cursor: 'pointer' }}
        onClick={() => window.open(`https://doi.org/${item.doi || item.metadata?.doi}`, '_blank')}
      >
        DOI: {item.doi || item.metadata?.doi}
      </Badge>
    )}
    {(item.isbn || item.metadata?.isbn) && (
      <Badge variant="light" color="gray" size="xs">
        ISBN: {item.isbn || item.metadata?.isbn}
      </Badge>
    )}
  </Group>
)}
        <Group gap="xs" mb="md">
          <IconUser size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
          <Text size="sm" c="dimmed">
            {displayAuthors}
          </Text>
          {item.year && (
            <>
              <Text c="var(--mantine-color-placeholder)">•</Text>
              <Group gap={4}>
                <IconCalendar size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="sm" c="dimmed">{item.year}</Text>
              </Group>
            </>
          )}
        </Group>

        {item.tags && item.tags.length > 0 && (
          <Box mb="md">
            <Group gap="xs" mb="xs">
              <IconTag size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" c="dimmed" fw={600}>
                TAGI
              </Text>
            </Group>
            <Group gap="xs">
              {item.tags.map((tag, idx) => (
                <Badge key={idx} variant="light" color="cyan" size="xs">
                  {tag}
                </Badge>
              ))}
            </Group>
          </Box>
        )}

        <Divider my="md" color="var(--mantine-color-default-border)" />

        <Box mb="md">
          <Group
            onClick={() => setCitationOpen(!citationOpen)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            mb="xs"
          >
            <IconQuote size={14} style={{ color: 'var(--mantine-primary-color-filled)' }} />
            <Text size="xs" c="dimmed" fw={600} style={{ flex: 1 }}>
              GENERUJ CYTAT
            </Text>
            {citationOpen ? (
              <IconChevronUp size={14} style={{ color: 'var(--mantine-color-placeholder)' }} />
            ) : (
              <IconChevronDown size={14} style={{ color: 'var(--mantine-color-placeholder)' }} />
            )}
          </Group>

          <Collapse in={citationOpen}>
            <Paper 
              p="sm" 
              radius="md" 
              style={{ 
                backgroundColor: 'var(--app-hover)', 
                border: '1px solid var(--mantine-color-default-border)' 
              }}
            >
              <Select
                placeholder="Wybierz styl"
                data={CITATION_STYLES}
                value={citationStyle}
                onChange={setCitationStyle}
                size="xs"
                mb="sm"
                styles={{
                  input: { fontSize: '11px' }
                }}
              />

              <Button
                onClick={handleGenerateCitation}
                loading={citationLoading}
                fullWidth
                size="xs"
                variant="light"
                color="indigo"
                leftSection={!citationLoading && <IconQuote size={12} />}
                mb={citation ? 'sm' : 0}
              >
                Generuj
              </Button>

              {citation && (
                <Box>
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
                        leftSection={copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                      >
                        {copied ? 'Skopiowano!' : 'Kopiuj'}
                      </Button>
                    )}
                  </CopyButton>
                </Box>
              )}
            </Paper>
          </Collapse>
        </Box>

        <Divider my="md" color="var(--mantine-color-default-border)" />

        <Stack gap="sm">
          {item.publisher && (
            <Box>
              <Text size="xs" c="dimmed" fw={600}>
                WYDAWCA
              </Text>
              <Text size="sm" c="var(--mantine-color-text)">
                {item.publisher}
              </Text>
            </Box>
          )}

          {journal && (
            <Box>
              <Text size="xs" c="dimmed" fw={600}>
                {item.metadata?.conference ? 'KONFERENCJA' : 'DZIENNIK'}
              </Text>
              <Text size="sm" c="var(--mantine-color-text)">
                {journal}
                {volume && `, Vol. ${volume}`}
                {issue && ` (${issue})`}
              </Text>
            </Box>
          )}

          {location && (
            <Box>
              <Text size="xs" c="dimmed" fw={600}>
                LOKALIZACJA
              </Text>
              <Text size="sm" c="var(--mantine-color-text)">
                {location}
              </Text>
            </Box>
          )}

          {date && (
            <Box>
              <Text size="xs" c="dimmed" fw={600}>
                DATA
              </Text>
              <Text size="sm" c="var(--mantine-color-text)">
                {date}
              </Text>
            </Box>
          )}

          {pages && (
            <Box>
              <Text size="xs" c="dimmed" fw={600}>
                STRONY
              </Text>
              <Text size="sm" c="var(--mantine-color-text)">
                {pages}
              </Text>
            </Box>
          )}

          {item.doi && (
            <Box>
              <Text size="xs" c="dimmed" fw={600}>
                DOI
              </Text>
              <Text
                size="sm"
                c="var(--mantine-primary-color-filled)"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => window.open(`https://doi.org/${item.doi}`, '_blank')}
              >
                {item.doi}
              </Text>
            </Box>
          )}

          {item.isbn && (
            <Box>
              <Text size="xs" c="dimmed" fw={600}>
                ISBN
              </Text>
              <Text size="sm" c="var(--mantine-color-text)">
                {item.isbn}
              </Text>
            </Box>
          )}

          {url && (
            <Box>
              <Text size="xs" c="dimmed" fw={600}>
                LINK
              </Text>
              <Text
                size="sm"
                c="var(--mantine-primary-color-filled)"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => window.open(url, '_blank')}
                lineClamp={1}
              >
                {url}
              </Text>
            </Box>
          )}

          {keywords.length > 0 && (
            <Box>
              <Text size="xs" c="dimmed" fw={600} mb="xs">
                SŁOWA KLUCZOWE
              </Text>
              <Text size="sm" c="var(--mantine-color-text)">
                {Array.isArray(keywords) ? keywords.join(', ') : keywords}
              </Text>
            </Box>
          )}
        </Stack>

        {abstractText && (
          <>
            <Divider my="md" color="var(--mantine-color-default-border)" />
            <Box mb="md">
              <Text size="xs" c="dimmed" fw={600} mb="xs">
                ABSTRAKT
              </Text>
              <Text size="sm" c="var(--mantine-color-text)" style={{ lineHeight: 1.5 }}>
                {abstractText}
              </Text>
            </Box>
          </>
        )}

        {item.notes && (
          <>
            <Divider my="md" color="var(--mantine-color-default-border)" />
            <Box mb="md">
              <Group gap="xs" mb="xs">
                <IconNotes size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="xs" c="dimmed" fw={600}>
                  NOTATKI OSOBISTE
                </Text>
              </Group>
              <Paper
                p="sm"
                style={{
                  backgroundColor: 'var(--app-hover)',
                  border: '1px solid var(--mantine-color-default-border)',
                  borderLeft: '3px solid var(--mantine-primary-color-filled)'
                }}
              >
                <Text size="sm" c="var(--mantine-color-text)" style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {item.notes}
                </Text>
              </Paper>
            </Box>
          </>
        )}

        {item.collection && (
          <>
            <Divider my="md" color="var(--mantine-color-default-border)" />
            <Box>
              <Text size="xs" c="dimmed" fw={600} mb="xs">
                KOLEKCJA
              </Text>
              <Badge variant="light" color={isWorkspaceItem ? 'blue' : 'violet'}>
                {item.collection.name}
              </Badge>
            </Box>
          </>
        )}

        {!isWorkspaceItem && item.labels && item.labels.length > 0 && (
          <>
            <Divider my="md" color="var(--mantine-color-default-border)" />
            <Box>
              <Text size="xs" c="dimmed" fw={600} mb="xs">
                ETYKIETY
              </Text>
              <Group gap="xs">
                {item.labels.map((label) => (
                  <Badge
                    key={label.id}
                    variant="filled"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </Badge>
                ))}
              </Group>
            </Box>
          </>
        )}
      </Box>
    </ScrollArea>
  );
}