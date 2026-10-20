import { Box } from '@mantine/core';
import ColorSchemeToggle from '../../../shared/components/ColorSchemeToggle';

export default function AuthBackground({ children }) {
  return (
    <Box
      py="xl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--app-hover) 0%, var(--mantine-color-default-border) 100%)',
        position: 'relative',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />
      <Box style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
        <ColorSchemeToggle />
      </Box>
      {children}
    </Box>
  );
}
