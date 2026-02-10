import { Text, NavLink, Badge } from '@mantine/core';
import { IconList, IconHeart, IconTrash, IconTag } from '@tabler/icons-react';

const navLinkStyles = (isActive) => ({
  root: {
    borderRadius: '4px',
    padding: '6px 8px',
    minHeight: '28px',
    color: isActive ? '#111827' : '#6b7280',
    backgroundColor: isActive ? '#f3f4f6' : 'transparent',
    fontWeight: isActive ? 500 : 400,
    fontSize: '13px',
    '&:hover': {
      backgroundColor: isActive ? '#f3f4f6' : '#f9fafb'
    }
  },
  label: { fontSize: '13px', lineHeight: '1.2' },
  section: { marginRight: '6px' }
});

export default function NavigationSection({ selectedView, onSelectView, trashCount }) {
  return (
    <>
      <Text size="xs" fw={600} c="#9ca3af" tt="uppercase" mb="xs" lts="0.8px">
        Nawigacja
      </Text>

      <NavLink
        label="Wszystkie"
        leftSection={<IconList size={14} />}
        active={selectedView?.type === 'all'}
        onClick={() => onSelectView({ type: 'all' })}
        mb={2}
        styles={navLinkStyles(selectedView?.type === 'all')}
      />

      <NavLink
        label="Ulubione"
        leftSection={<IconHeart size={14} />}
        active={selectedView?.type === 'favorites'}
        onClick={() => onSelectView({ type: 'favorites' })}
        mb={2}
        styles={navLinkStyles(selectedView?.type === 'favorites')}
      />

      <NavLink
        label="Kosz"
        leftSection={<IconTrash size={14} />}
        active={selectedView?.type === 'trash'}
        onClick={() => onSelectView({ type: 'trash' })}
        mb={2}
        rightSection={
          trashCount > 0 && (
            <Badge
              size="xs"
              variant="light"
              color="red"
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                fontWeight: 500,
                fontSize: '10px',
                height: '16px',
                padding: '0 6px'
              }}
            >
              {trashCount}
            </Badge>
          )
        }
        styles={navLinkStyles(selectedView?.type === 'trash')}
      />

      <NavLink
        label="Etykiety"
        leftSection={<IconTag size={14} />}
        active={selectedView?.type === 'labels'}
        onClick={() => onSelectView({ type: 'labels' })}
        mb={2}
        styles={navLinkStyles(selectedView?.type === 'labels')}
      />
    </>
  );
}