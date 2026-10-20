import { Group, ThemeIcon, Title, Text } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';

export default function AuthHeader() {
  return (
    <Group justify="center" align="center" gap="md" mb="lg">
      <ThemeIcon size={40} radius="md" color="violet">
        <IconBook size={22} stroke={2} color="white" />
      </ThemeIcon>
      <div>
        <Title order={2} c="var(--mantine-color-text)" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          BibliografiaApp
        </Title>
      </div>
    </Group>
  );
}