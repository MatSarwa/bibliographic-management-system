import { Text, NavLink, Badge } from '@mantine/core';
import { IconList, IconHeart, IconTrash, IconTag } from '@tabler/icons-react';
import classes from '../../../../shared/styles/interactive.module.css';

const navLinkClassNames = { root: classes.navLink };

const navLinkStyles = {
  label: { fontSize: '13px', lineHeight: '1.2' },
  section: { marginRight: '6px' }
};

export default function NavigationSection({ selectedView, onSelectView, trashCount }) {
  return (
    <>
      <Text size="xs" fw={600} c="var(--mantine-color-placeholder)" tt="uppercase" mb="xs" lts="0.8px">
        Nawigacja
      </Text>

      <NavLink
        label="Wszystkie"
        leftSection={<IconList size={14} />}
        active={selectedView?.type === 'all'}
        onClick={() => onSelectView({ type: 'all' })}
        mb={2}
        classNames={navLinkClassNames}
        styles={navLinkStyles}
      />

      <NavLink
        label="Ulubione"
        leftSection={<IconHeart size={14} />}
        active={selectedView?.type === 'favorites'}
        onClick={() => onSelectView({ type: 'favorites' })}
        mb={2}
        classNames={navLinkClassNames}
        styles={navLinkStyles}
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
        classNames={navLinkClassNames}
        styles={navLinkStyles}
      />

      <NavLink
        label="Etykiety"
        leftSection={<IconTag size={14} />}
        active={selectedView?.type === 'labels'}
        onClick={() => onSelectView({ type: 'labels' })}
        mb={2}
        classNames={navLinkClassNames}
        styles={navLinkStyles}
      />
    </>
  );
}
