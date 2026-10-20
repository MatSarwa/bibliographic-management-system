import { useState, useEffect } from 'react';
import commentsService from '../services/commentsService';
import { notifications } from '@mantine/notifications';
import { confirmAction } from '../../../shared/utils/confirm';

export function useComments(itemId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (itemId) {
      fetchComments();
    }
  }, [itemId]);

  const fetchComments = async () => {
    setLoading(true);
    const result = await commentsService.getComments(itemId);
    
    if (result.success) {
      setComments(result.data);
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
    }
    setLoading(false);
  };

  const handleAddComment = async (content) => {
    const result = await commentsService.addComment(itemId, content);
    
    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: 'Komentarz dodany',
        color: 'green',
      });
      fetchComments();
      return true;
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
      return false;
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    const result = await commentsService.updateComment(commentId, content);
    
    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: 'Komentarz zaktualizowany',
        color: 'green',
      });
      fetchComments();
      return true;
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
      return false;
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!(await confirmAction({ title: 'Usunąć komentarz?', message: 'Tej operacji nie można cofnąć.', confirmLabel: 'Usuń' }))) {
      return;
    }

    const result = await commentsService.deleteComment(commentId);
    
    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: 'Komentarz usunięty',
        color: 'green',
      });
      fetchComments();
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
    }
  };

  const handleResolveComment = async (commentId) => {
    const result = await commentsService.resolveComment(commentId);
    
    if (result.success) {
      notifications.show({
        title: 'Sukces!',
        message: 'Status komentarza zmieniony',
        color: 'green',
      });
      fetchComments();
    } else {
      notifications.show({
        title: 'Błąd',
        message: result.error,
        color: 'red',
      });
    }
  };

  return {
    comments,
    loading,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    handleResolveComment,
    fetchComments,
  };
}