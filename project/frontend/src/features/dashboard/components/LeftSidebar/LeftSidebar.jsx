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
  isCollapsed
}) {
  const sidebar = useLeftSidebar(onSelectView);

  if (isCollapsed) {
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
        width: '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <Box style={{ position: 'relative', height: '100%', paddingRight: '20px' }}>
        <ScrollArea h="calc(100vh - 60px)" type="always">
          <Box p="sm" pr="xs">
            
            <NavigationSection
              selectedView={selectedView}
              onSelectView={onSelectView}
              trashCount={sidebar.trashCount}
            />

            <Divider my="xs" color="#e5e7eb" />

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

            <Divider my="xs" color="#e5e7eb" />

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

        <Resizer
          onResize={onResize}
          position="right"
          sidebarRef={leftRef}
          onToggleCollapse={onToggleCollapse}
          isCollapsed={false}
        />
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