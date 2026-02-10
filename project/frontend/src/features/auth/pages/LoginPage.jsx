import { useState } from 'react';
import { Container, Paper } from '@mantine/core';
import AuthBackground from '../components/AuthBackground';
import AuthHeader from '../components/AuthHeader';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import SwitchModeButton from '../components/SwitchModeButton';
import Footer from '../components/Footer';

const paperStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(229, 231, 235, 0.8)',
};

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <AuthBackground>
      <Container size={480} style={{ position: 'relative', zIndex: 1 }}>
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