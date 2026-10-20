import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { IconError404, IconAlertTriangle } from '@tabler/icons-react';

// Full-page message for unknown URLs (notFound) and for crashes caught by the router or ErrorBoundary.
// Uses plain links instead of router hooks, so it also works outside the router.
export default function ErrorPage({ notFound = false }) {
  const Icon = notFound ? IconError404 : IconAlertTriangle;

  return (
    <Center style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-body)' }} p="md">
      <Stack align="center" gap="sm" maw={420} ta="center">
        <Icon size={64} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
        <Title order={2}>{notFound ? 'Nie ma takiej strony' : 'Coś poszło nie tak'}</Title>
        <Text c="dimmed">
          {notFound
            ? 'Adres jest nieprawidłowy albo strona została przeniesiona.'
            : 'Wystąpił nieoczekiwany błąd. Odśwież stronę albo wróć do panelu.'}
        </Text>
        <Stack gap="xs" mt="md" w="100%" maw={240}>
          <Button component="a" href="/dashboard" color="violet">
            Wróć do panelu
          </Button>
          {!notFound && (
            <Button variant="subtle" color="gray" onClick={() => window.location.reload()}>
              Odśwież stronę
            </Button>
          )}
        </Stack>
      </Stack>
    </Center>
  );
}
