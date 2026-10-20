import { Box } from '@mantine/core';
import Resizer from './Resizer';
import DetailPanel from '../../items/components/DetailPanel';

export default function RightSidebar({
  selectedItem,
  onEdit,
  onToggleFavorite,
  onResize,
  rightRef,
  onToggleCollapse,
  isCollapsed
}) {
  if (isCollapsed) {
    return (
      <Resizer
        position="left"
        onToggleCollapse={onToggleCollapse}
        isCollapsed={true}
      />
    );
  }

  return (
    <Box
      ref={rightRef}
      style={{
        width: '320px',
        backgroundColor: 'var(--mantine-color-body)',
        borderLeft: '1px solid var(--mantine-color-default-border)',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <Box style={{ position: 'relative', height: '100%', paddingLeft: '20px' }}>
        <DetailPanel
          item={selectedItem}
          onEdit={onEdit}
          onToggleFavorite={onToggleFavorite}
        />

        <Resizer
          onResize={onResize}
          position="left"
          sidebarRef={rightRef}
          onToggleCollapse={onToggleCollapse}
          isCollapsed={false}
        />
      </Box>
    </Box>
  );
}