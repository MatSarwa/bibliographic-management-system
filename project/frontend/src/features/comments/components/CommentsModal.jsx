import {
  Modal,
  Stack,
  Text,
  Textarea,
  Button,
  Group,
  Loader,
  Center,
  Badge,
  Box 
} from '@mantine/core';
import { IconSend, IconMessageCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { useComments } from '../hooks/useComments';
import CommentCard from './CommentCard';

export default function CommentsModal({ opened, onClose, item }) {
  const {
    comments,
    loading,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleResolveComment,
  } = useComments(item?.id);

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    const success = await handleAddComment(newComment.trim());
    setSubmitting(false);

    if (success) {
      setNewComment('');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconMessageCircle size={20} />
          <Text fw={600}>
            Komentarze
          </Text>
          <Badge size="sm" variant="light">
            {comments.length}
          </Badge>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {item?.title}
        </Text>

        <Box>
          <Textarea
            placeholder="Dodaj komentarz..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            minRows={3}
            mb="xs"
          />
          <Group justify="flex-end">
            <Button
              leftSection={<IconSend size={16} />}
              onClick={handleSubmit}
              loading={submitting}
              size="sm"
              disabled={!newComment.trim()}
            >
              Dodaj komentarz
            </Button>
          </Group>
        </Box>

        {loading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : comments.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            Brak komentarzy. Dodaj pierwszy!
          </Text>
        ) : (
          <Stack gap="sm">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                onResolve={handleResolveComment}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}