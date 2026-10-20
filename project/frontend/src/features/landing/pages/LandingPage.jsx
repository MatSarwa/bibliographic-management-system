import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, Badge, Button, Container, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBook, IconBrandGithub, IconLogin, IconPlayerPlay } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import AuthBackground from '../../auth/components/AuthBackground';
import Footer from '../../auth/components/Footer';
import { authService } from '../../auth/services/authService';
import { useAuthStore } from '../../auth/store/authStore';
import { REGISTRATION_ENABLED } from '../../../shared/config/features';

const REPO_URL = 'https://github.com/MatSarwa/bibliographic-management-system';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [demoLoading, setDemoLoading] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      // Each visitor gets their own temporary account, so nobody sees changes made by others.
      const { data } = await authService.startDemo();
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
      <Container w="100%" size={560} style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xs" ta="center" mb="xl">
          <ThemeIcon size={56} radius="md" color="violet">
            <IconBook size={30} stroke={2} color="white" />
          </ThemeIcon>
          <Title order={1} fz={{ base: 28, sm: 40 }}>BibliografiaApp</Title>
          <Text size="lg" c="dimmed">
            Aplikacja wspierająca pracę naukową: zbieranie źródeł, porządkowanie ich w kolekcjach
            i generowanie cytowań – również wspólnie z zespołem.
          </Text>
        </Stack>

        <Paper withBorder shadow="md" radius="md" p={{ base: 'md', sm: 'xl' }} mb="xl">
          <Stack gap="md" align="center" ta="center">
            {/* The explanation is shown to everyone – also to visitors returning with a saved session. */}
            <Text fw={600}>Wypróbuj bez rejestracji</Text>
            <Text size="sm" c="dimmed">
              Dostaniesz własne konto z przykładową biblioteką – możesz w nim wszystko zmieniać i usuwać.
              Zniknie automatycznie po 24 godzinach.
            </Text>
            <Group gap="sm" justify="center">
              {isLoggedIn && (
                <Button size="md" color="violet" leftSection={<IconLogin size={18} />} onClick={() => navigate('/dashboard')}>
                  Przejdź do panelu
                </Button>
              )}
              <Button
                size="md"
                color="violet"
                variant={isLoggedIn ? 'default' : 'filled'}
                leftSection={<IconPlayerPlay size={18} />}
                loading={demoLoading}
                onClick={handleDemoLogin}
              >
                {isLoggedIn ? 'Nowe demo' : 'Wypróbuj demo'}
              </Button>
              {/* Only where accounts can be created; on the public demo there are none to log in to. */}
              {!isLoggedIn && REGISTRATION_ENABLED && (
                <Button size="md" variant="default" leftSection={<IconLogin size={18} />} onClick={() => navigate('/login')}>
                  Zaloguj się
                </Button>
              )}
            </Group>
            {demoLoading && (
              <Text size="xs" c="dimmed">
                Pierwsze logowanie może potrwać do minuty – darmowy serwer budzi się po przerwie.
              </Text>
            )}
          </Stack>
        </Paper>

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
