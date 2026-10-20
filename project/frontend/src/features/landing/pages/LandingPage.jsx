import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor, Badge, Button, Code, Container, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title,
} from '@mantine/core';
import {
  IconBook, IconBrandGithub, IconDownload, IconFolders, IconHistory, IconLogin, IconQuote, IconSearch,
  IconUsers, IconPlayerPlay,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import AuthBackground from '../../auth/components/AuthBackground';
import Footer from '../../auth/components/Footer';
import { authService } from '../../auth/services/authService';
import { useAuthStore } from '../../auth/store/authStore';

// Demo account created by `npm run seed:demo`; can be overridden per deployment.
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || 'demo@example.com';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'Demo1234!';
const REPO_URL = 'https://github.com/MatSarwa/bibliographic-management-system';

const FEATURES = [
  { icon: IconSearch, title: 'Automatyczne metadane', text: 'Wklej DOI, ISBN, arXiv ID lub PMID – tytuł, autorzy i rok uzupełnią się same.' },
  { icon: IconFolders, title: 'Kolekcje i etykiety', text: 'Zagnieżdżone kolekcje, kolorowe etykiety, ulubione i kosz.' },
  { icon: IconQuote, title: 'Cytowania', text: 'APA, MLA, Chicago, Harvard, IEEE i Vancouver jednym kliknięciem.' },
  { icon: IconDownload, title: 'Eksport', text: 'BibTeX i RIS – gotowe do LaTeX-a, Zotero czy Mendeleya.' },
  { icon: IconUsers, title: 'Praca zespołowa', text: 'Wspólne workspace’y z rolami, udostępnianie kolekcji, komentarze.' },
  { icon: IconHistory, title: 'Historia zmian', text: 'Każda edycja jest zapisywana – można wrócić do poprzedniej wersji.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const { data } = await authService.login({ login: DEMO_EMAIL, password: DEMO_PASSWORD });
      setAuth({ username: data.username, email: data.email, id: data.userId }, data.token);
      navigate('/dashboard');
    } catch (err) {
      notifications.show({
        title: 'Nie udało się zalogować',
        message: err.response?.data?.message || 'Serwer może się jeszcze wybudzać – spróbuj ponownie za chwilę.',
        color: 'red',
      });
      setDemoLoading(false);
    }
  };

  return (
    <AuthBackground>
      <Container w="100%" size={880} style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xs" ta="center" mb="xl">
          <ThemeIcon size={56} radius="md" color="violet">
            <IconBook size={30} stroke={2} color="white" />
          </ThemeIcon>
          <Title order={1} fz={{ base: 28, sm: 40 }}>BibliografiaApp</Title>
          <Text size="lg" c="dimmed" maw={560}>
            Aplikacja do zbierania źródeł, porządkowania ich w kolekcjach i generowania cytowań.
          </Text>
        </Stack>

        <Paper withBorder shadow="md" radius="md" p={{ base: 'md', sm: 'xl' }} mb="xl">
          <Stack gap="md" align="center" ta="center">
            {isLoggedIn ? (
              <Button size="md" color="violet" leftSection={<IconLogin size={18} />} onClick={() => navigate('/dashboard')}>
                Przejdź do panelu
              </Button>
            ) : (
              <>
                <Text fw={600}>Wypróbuj bez rejestracji</Text>
                <Group gap="xs" justify="center">
                  <Text size="sm" c="dimmed">Konto demo:</Text>
                  <Code>{DEMO_EMAIL}</Code>
                  <Code>{DEMO_PASSWORD}</Code>
                </Group>
                <Group gap="sm" justify="center">
                  <Button
                    size="md"
                    color="violet"
                    leftSection={<IconPlayerPlay size={18} />}
                    loading={demoLoading}
                    onClick={handleDemoLogin}
                  >
                    Wypróbuj demo
                  </Button>
                  <Button size="md" variant="default" leftSection={<IconLogin size={18} />} onClick={() => navigate('/login')}>
                    Zaloguj się
                  </Button>
                </Group>
                {demoLoading && (
                  <Text size="xs" c="dimmed">
                    Pierwsze logowanie może potrwać do minuty – darmowy serwer budzi się po przerwie.
                  </Text>
                )}
              </>
            )}
          </Stack>
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="xl">
          {FEATURES.map((feature) => (
            <Paper key={feature.title} withBorder radius="md" p="md">
              <Group gap="sm" mb={6} wrap="nowrap">
                <ThemeIcon variant="light" color="violet" radius="md">
                  <feature.icon size={18} />
                </ThemeIcon>
                <Text fw={600} size="sm">{feature.title}</Text>
              </Group>
              <Text size="sm" c="dimmed">{feature.text}</Text>
            </Paper>
          ))}
        </SimpleGrid>

        <Stack align="center" gap="xs">
          <Group gap={6} justify="center">
            {['React', 'Mantine', 'Node.js', 'Express', 'PostgreSQL', 'Sequelize', 'Jest'].map((tech) => (
              <Badge key={tech} variant="light" color="gray">{tech}</Badge>
            ))}
          </Group>
          <Anchor href={REPO_URL} target="_blank" rel="noopener noreferrer" size="sm" c="dimmed">
            <Group gap={4}>
              <IconBrandGithub size={16} />
              Kod źródłowy na GitHubie
            </Group>
          </Anchor>
        </Stack>

        <Footer />
      </Container>
    </AuthBackground>
  );
}
