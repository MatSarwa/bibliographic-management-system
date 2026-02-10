import {
  Card,
  Group,
  Avatar,
  Text,
  Badge,
  ActionIcon,
  Textarea,
  Button
} from '@mantine/core';
import { IconEdit, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';

export default function CommentCard({ 
  comment, 
  onUpdate, 
  onDelete, 
  onResolve 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    const success = await onUpdate(comment.id, editContent.trim());
    setSubmitting(false);

    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <Card p="sm" withBorder>
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Avatar size="sm" radius="xl" color="violet">
            {comment.user?.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {comment.user?.username || 'Unknown'}
            </Text>
            <Text size="xs" c="dimmed">
              {new Date(comment.createdAt).toLocaleString('pl-PL')}
            </Text>
          </div>
        </Group>

        <Group gap="xs">
          {comment.isResolved && (
            <Badge size="sm" color="green" variant="light">
              Rozwiązane
            </Badge>
          )}
          <ActionIcon
            size="sm"
            variant="subtle"
            color={comment.isResolved ? 'gray' : 'green'}
            onClick={() => onResolve(comment.id)}
            title={comment.isResolved ? 'Oznacz jako nierozwiązane' : 'Rozwiązane'}
          >
            <IconCheck size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={() => setIsEditing(true)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="red"
            onClick={() => onDelete(comment.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {isEditing ? (
        <>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            minRows={2}
            mb="xs"
          />
          <Group justify="flex-end" gap="xs">
            <Button
              size="xs"
              variant="subtle"
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
            >
              Anuluj
            </Button>
            <Button
              size="xs"
              onClick={handleSave}
              loading={submitting}
            >
              Zapisz
            </Button>
          </Group>
        </>
      ) : (
        <Text size="sm">{comment.content}</Text>
      )}
    </Card>
  );
}