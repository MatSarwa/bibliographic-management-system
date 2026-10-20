import { useState } from 'react';
import { Container, Paper } from '@mantine/core';
import AuthBackground from '../components/AuthBackground';
import AuthHeader from '../components/AuthHeader';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import SwitchModeButton from '../components/SwitchModeButton';
import Footer from '../components/Footer';

const paperStyle = {
  backgroundColor: 'var(--mantine-color-body)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--mantine-color-default-border)',
};

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <AuthBackground>
      <Container w="100%" size={480} style={{ position: 'relative', zIndex: 1 }}>
        <AuthHeader />

        <Paper withBorder shadow="xl" p={36} radius="md" style={paperStyle}>
          {isRegister ? <RegisterForm /> : <LoginForm />}
          <SwitchModeButton
            isRegister={isRegister}
            onToggle={() => setIsRegister(!isRegister)}
          />
        </Paper>
        <Footer />
      </Container>
    </AuthBackground>
  );
}