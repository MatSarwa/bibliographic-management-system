import CollectionModal from '../../../collections/components/CollectionModal';
import ShareCollectionModal from '../../../collections/components/ShareCollectionModal';
import WorkspaceModal from '../../../workspaces/components/WorkspaceModal';

export default function SidebarModals({
  collectionModalOpened,
  onCloseCollectionModal,
  onCollectionModalSubmit,
  editCollection,
  collections,

  shareModalOpened,
  onCloseShareModal,
  shareCollection,

  workspaceModalOpened,
  onCloseWorkspaceModal,
  onWorkspaceModalSubmit,
  editWorkspace
}) {
  return (
    <>
      <CollectionModal
        opened={collectionModalOpened}
        onClose={onCloseCollectionModal}
        onSuccess={onCollectionModalSubmit}
        editCollection={editCollection}
        collections={collections}
      />

      <ShareCollectionModal
        opened={shareModalOpened}
        onClose={onCloseShareModal}
        collection={shareCollection}
      />

      <WorkspaceModal
        opened={workspaceModalOpened}
        onClose={onCloseWorkspaceModal}
        onSuccess={onWorkspaceModalSubmit}
        editWorkspace={editWorkspace}
      />
    </>
  );
}