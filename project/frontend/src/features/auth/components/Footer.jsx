import { Text } from '@mantine/core';

export default function Footer() {
  return (
    <Text ta="center" size="xs" c="var(--mantine-color-placeholder)" mt="md">
      © {new Date().getFullYear()} BibliografiaApp
    </Text>
  );
}
