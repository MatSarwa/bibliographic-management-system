import { Text, Group, ColorSwatch } from '@mantine/core';

export const COLORS = [
  { value: '#6366f1', label: 'Fiolet' },
  { value: '#8b5cf6', label: 'Fioletowy' },
  { value: '#ec4899', label: 'Różowy' },
  { value: '#f59e0b', label: 'Pomarańczowy' },
  { value: '#10b981', label: 'Zielony' },
  { value: '#3b82f6', label: 'Niebieski' },
  { value: '#ef4444', label: 'Czerwony' }
];

export default function ColorPicker({ 
  value, 
  onChange, 
  label = 'Kolor',
  size = 32 
}) {
  return (
    <div>
      {label && (
        <Text size="sm" fw={500} mb="xs">
          {label}
        </Text>
      )}
      <Group gap="sm">
        {COLORS.map((c) => (
          <ColorSwatch
            key={c.value}
            color={c.value}
            onClick={() => onChange(c.value)}
            style={{
              cursor: 'pointer',
              border: value === c.value 
                ? '3px solid #6366f1' 
                : '2px solid transparent',
              width: size,
              height: size
            }}
            title={c.label}
          />
        ))}
      </Group>
    </div>
  );
}