import {
  Timeline,
  Card,
  Group,
  Text,
  Badge,
  Button,
  Box,
  Stack,
  Collapse,
  ActionIcon
} from '@mantine/core';
import { IconHistory, IconRestore, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';

export default function HistoryTimeline({ 
  history, 
  onRestore, 
  restoring 
}) {
  const [expandedVersions, setExpandedVersions] = useState(new Set());

  const toggleExpand = (versionId) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  const getChangeTypeBadge = (type) => {
    const colors = {
      created: 'blue',
      updated: 'yellow',
      deleted: 'red',
      restored: 'green',
      moved: 'violet'
    };

    const labels = {
      created: 'Utworzono',
      updated: 'Zaktualizowano',
      deleted: 'Usunieto',
      restored: 'Przywrocono',
      moved: 'Przeniesiono'
    };

    return (
      <Badge size="sm" variant="light" color={colors[type] || 'gray'}>
        {labels[type] || type}
      </Badge>
    );
  };

  const renderDiffValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getChanges = (entry) => {
    if (!entry.diff) return {};

    if (entry.diff.changes && typeof entry.diff.changes === 'object') {
      return entry.diff.changes;
    }
    
    const ignoredKeys = ['restoredFrom'];
    const changes = {};
    
    Object.entries(entry.diff).forEach(([key, value]) => {
      if (!ignoredKeys.includes(key) && value && typeof value === 'object' && 'old' in value && 'new' in value) {
        changes[key] = value;
      }
    });
    
    return changes;
  };

  return (
    <Timeline active={history.length} bulletSize={24} lineWidth={2}>
      {history.map((entry, index) => {
        const isExpanded = expandedVersions.has(entry.id);
        const changes = getChanges(entry);
        const hasChanges = Object.keys(changes).length > 0;

        return (
          <Timeline.Item
            key={entry.id}
            bullet={<IconHistory size={12} />}
            title={
              <Group justify="space-between" wrap="nowrap">
                <Box style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      Wersja {entry.version}
                    </Text>
                    {getChangeTypeBadge(entry.changeType)}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {new Date(entry.changedAt).toLocaleString('pl-PL')}
                  </Text>
                </Box>
                
                {index !== 0 && (
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconRestore size={14} />}
                    onClick={() => onRestore(entry.version)}
                    loading={restoring === entry.version}
                  >
                    Przywroc
                  </Button>
                )}
              </Group>
            }
          >
            <Card p="xs" mt="xs" withBorder>
              <Stack gap="xs">
                <Group gap="xs">
                  <Text size="xs" fw={500}>Zmienil:</Text>
                  <Text size="xs">{entry.user?.username || 'System'}</Text>
                </Group>

                {hasChanges && (
                  <Box>
                    <Group
                      gap="xs"
                      onClick={() => toggleExpand(entry.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <ActionIcon size="xs" variant="subtle">
                        {isExpanded ? (
                          <IconChevronDown size={14} />
                        ) : (
                          <IconChevronRight size={14} />
                        )}
                      </ActionIcon>
                      <Text size="xs" fw={500}>
                        Zmiany ({Object.keys(changes).length})
                      </Text>
                    </Group>

                    <Collapse in={isExpanded}>
                      <Stack gap="xs" mt="xs">
                        {Object.entries(changes).map(([key, value]) => (
                          <Card key={key} p="xs" withBorder style={{ backgroundColor: 'var(--mantine-color-yellow-light)' }}>
                            <Text size="xs" fw={500} mb={4} c="violet" tt="uppercase">
                              {key}
                            </Text>
                            
                            <Box
                              p="xs"
                              mb={4}
                              style={{
                                backgroundColor: 'var(--mantine-color-red-light)',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px'
                              }}
                            >
                              <Text size="xs" fw={500} c="red" mb={2}>
                                Przed:
                              </Text>
                              <Text size="xs" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {renderDiffValue(value.old)}
                              </Text>
                            </Box>

                            <Box
                              p="xs"
                              style={{
                                backgroundColor: 'var(--mantine-color-green-light)',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '11px'
                              }}
                            >
                              <Text size="xs" fw={500} c="green" mb={2}>
                                Po:
                              </Text>
                              <Text size="xs" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {renderDiffValue(value.new)}
                              </Text>
                            </Box>
                          </Card>
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>
                )}

                {!hasChanges && entry.changeType === 'created' && (
                  <Text size="xs" c="dimmed" fs="italic">
                    Pierwsza wersja - brak poprzednich zmian
                  </Text>
                )}

                {entry.changeType === 'restored' && entry.diff?.restoredFrom && (
                  <Badge size="sm" variant="light" color="green">
                    Przywrocono z wersji {entry.diff.restoredFrom}
                  </Badge>
                )}
              </Stack>
            </Card>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}