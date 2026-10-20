import { notifications } from '@mantine/notifications';
import api from './api';

const EXTENSIONS = { bibtex: 'bib', ris: 'ris' };

// Downloads a BibTeX/RIS export of a collection. Goes through `api`, so it uses the configured
// API URL and token, and an error response shows a message instead of being saved as the file.
export async function downloadCollectionExport(collectionId, format, name = 'kolekcja') {
  try {
    const response = await api.get(`/export/collections/${collectionId}`, {
      params: { format },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}_${Date.now()}.${EXTENSIONS[format] || format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    // With responseType 'blob' the JSON error body arrives as a Blob.
    let message = 'Nie udało się wyeksportować kolekcji';
    try {
      const body = JSON.parse(await err.response.data.text());
      if (body?.message) message = body.message;
    } catch {
      // keep the generic message
    }
    notifications.show({ title: 'Błąd eksportu', message, color: 'red' });
  }
}
