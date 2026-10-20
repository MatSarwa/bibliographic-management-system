import { Box, ScrollArea, Divider } from '@mantine/core';
import Resizer from '../Resizer';
import NavigationSection from './NavigationSection';
import CollectionsSection from './CollectionsSection';
import WorkspacesSection from './WorkspacesSection';
import SidebarModals from './SidebarModals';
import { useLeftSidebar } from '../../hooks/temp';

export default function LeftSidebar({
  selectedView,
  onSelectView,
  onResize,
  leftRef,
  onToggleCollapse,
  isCollapsed,
  inDrawer = false
}) {
  const sidebar = useLeftSidebar(onSelectView);

  if (isCollapsed && !inDrawer) {
    return (
      <Resizer
        position="right"
        onToggleCollapse={onToggleCollapse}
        isCollapsed={true}
      />
    );
  }

  return (
    <Box
      ref={leftRef}
      style={{
        // In the phone drawer the sidebar fills the drawer and has no resize handle.
        width: inDrawer ? '100%' : '280px',
        backgroundColor: 'var(--mantine-color-body)',
        borderRight: inDrawer ? 'none' : '1px solid var(--mantine-color-default-border)',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <Box style={{ position: 'relative', height: '100%', paddingRight: inDrawer ? 0 : '20px' }}>
        <ScrollArea h={inDrawer ? '100dvh' : 'calc(100vh - 60px)'} type={inDrawer ? 'auto' : 'always'}>
          <Box p="sm" pr="xs">
            
            <NavigationSection
              selectedView={selectedView}
              onSelectView={onSelectView}
              trashCount={sidebar.trashCount}
            />

            <Divider my="xs" color="var(--mantine-color-default-border)" />

            <CollectionsSection
              collections={sidebar.collections}
              selectedCollection={sidebar.selectedCollection}
              onSelect={sidebar.handleSelectCollection}
              onCreateNew={sidebar.handleOpenCreateCollectionModal}
              onEdit={sidebar.handleOpenEditCollectionModal}
              onUpdate={sidebar.handleCollectionDragUpdate}
              onDelete={sidebar.handleDeleteCollection}
              onShare={sidebar.handleShareCollection}
              getCollectionItemCount={sidebar.getCollectionItemCount}
            />

            <Divider my="xs" color="var(--mantine-color-default-border)" />

            <WorkspacesSection
              workspaces={sidebar.workspaces}
              workspaceSearch={sidebar.workspaceSearch}
              setWorkspaceSearch={sidebar.setWorkspaceSearch}
              workspaceSort={sidebar.workspaceSort}
              showWorkspaceSearch={sidebar.showWorkspaceSearch}
              onToggleSearch={sidebar.handleToggleWorkspaceSearch}
              onToggleSort={sidebar.handleToggleWorkspaceSort}
              onCreateNew={sidebar.handleOpenCreateWorkspaceModal}
              onSelectCollection={sidebar.handleSelectWorkspaceCollection}
            />

          </Box>
        </ScrollArea>

        {!inDrawer && (
          <Resizer
            onResize={onResize}
            position="right"
            sidebarRef={leftRef}
            onToggleCollapse={onToggleCollapse}
            isCollapsed={false}
          />
        )}
      </Box>

      <SidebarModals
        collectionModalOpened={sidebar.collectionModalOpened}
        onCloseCollectionModal={sidebar.handleCloseCollectionModal}
        onCollectionModalSubmit={sidebar.handleCollectionModalSubmit}
        editCollection={sidebar.editCollection}
        collections={sidebar.collections}
        shareModalOpened={sidebar.shareModalOpened}
        onCloseShareModal={sidebar.handleCloseShareModal}
        shareCollection={sidebar.shareCollection}
        workspaceModalOpened={sidebar.workspaceModalOpened}
        onCloseWorkspaceModal={sidebar.handleCloseWorkspaceModal}
        onWorkspaceModalSubmit={sidebar.handleWorkspaceModalSubmit}
        editWorkspace={sidebar.editWorkspace}
      />
    </Box>
  );
}