import { Group, ThemeIcon, Title, UnstyledButton } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export default function AuthHeader() {
  return (
    <Group justify="center" mb="lg">
      <UnstyledButton component={Link} to="/" aria-label="Strona główna">
        <Group align="center" gap="md">
          <ThemeIcon size={40} radius="md" color="violet">
            <IconBook size={22} stroke={2} color="white" />
          </ThemeIcon>
          <Title order={2} c="var(--mantine-color-text)" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            BibliografiaApp
          </Title>
        </Group>
      </UnstyledButton>
    </Group>
  );
}
