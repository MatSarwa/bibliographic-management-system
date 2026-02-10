import { useState } from 'react';
import { useCollections } from '../../collections/hooks/useCollections';
import { useWorkspaces } from '../../workspaces/hooks/useWorkspaces';
import { useItemsStore } from '../../items/store/itemsStore';

export function useLeftSidebar(onSelectView) {
 
  const {
    collections,
    selectedCollection,
    setSelectedCollection,
    handleCreate: handleCreateCollection,
    handleUpdate: handleUpdateCollection,
    handleDelete: handleDeleteCollection,
    getCollectionItemCount,
    fetchCollections
  } = useCollections();

  const {
    workspaces,
    handleCreate: handleCreateWorkspace,
    handleUpdate: handleUpdateWorkspace
  } = useWorkspaces();

  const { items } = useItemsStore();
  const trashCount = items.filter(i => i.status === 'deleted').length;

  const [collectionModalOpened, setCollectionModalOpened] = useState(false);
  const [editCollection, setEditCollection] = useState(null);
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [shareCollection, setShareCollection] = useState(null);

  const [workspaceModalOpened, setWorkspaceModalOpened] = useState(false);
  const [editWorkspace, setEditWorkspace] = useState(null);

  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [workspaceSort, setWorkspaceSort] = useState('name');
  const [showWorkspaceSearch, setShowWorkspaceSearch] = useState(false);

  const handleSelectCollection = (collection) => {
    setSelectedCollection(collection);
    onSelectView({ type: 'collection', data: collection });
  };

  const handleOpenCreateCollectionModal = () => {
    setEditCollection(null);
    setCollectionModalOpened(true);
  };

  const handleOpenEditCollectionModal = (collection) => {
    setEditCollection(collection);
    setCollectionModalOpened(true);
  };

  const handleCollectionModalSubmit = async (data, editId) => {
    console.log('handleCollectionModalSubmit:', { data, editId });
    if (editId) {
      return await handleUpdateCollection(editId, data);
    } else {
      return await handleCreateCollection(data);
    }
  };

  const handleCollectionDragUpdate = async (collectionId, updates) => {
    console.log('handleCollectionDragUpdate:', { collectionId, updates });
    return await handleUpdateCollection(collectionId, updates);
  };

  const handleShareCollection = (collection) => {
    console.log('Udostępnij kolekcję:', collection);
    setShareCollection(collection);
    setShareModalOpened(true);
  };

  const handleCloseCollectionModal = () => {
    setCollectionModalOpened(false);
    setEditCollection(null);
  };

  const handleCloseShareModal = () => {
    setShareModalOpened(false);
    setShareCollection(null);
    fetchCollections();
  };

  const handleOpenCreateWorkspaceModal = () => {
    setEditWorkspace(null);
    setWorkspaceModalOpened(true);
  };

  const handleWorkspaceModalSubmit = async (data, editId) => {
    if (editId) {
      return await handleUpdateWorkspace(editId, data);
    } else {
      return await handleCreateWorkspace(data);
    }
  };

  const handleSelectWorkspaceCollection = (collection, workspace) => {
    console.log('Selected workspace collection:', collection, 'from workspace:', workspace);
    onSelectView({
      type: 'workspace-collection',
      data: { collection, workspace }
    });
  };

  const handleCloseWorkspaceModal = () => {
    setWorkspaceModalOpened(false);
    setEditWorkspace(null);
  };

  const handleToggleWorkspaceSearch = () => {
    setShowWorkspaceSearch(!showWorkspaceSearch);
  };

  const handleToggleWorkspaceSort = () => {
    setWorkspaceSort(prev => prev === 'name' ? 'date' : 'name');
  };

  const filteredAndSortedWorkspaces = workspaces
    .filter(ws => {
      if (!workspaceSearch) return true;
      return ws.name.toLowerCase().includes(workspaceSearch.toLowerCase());
    })
    .sort((a, b) => {
      if (workspaceSort === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

  return {

    collections,
    selectedCollection,
    getCollectionItemCount,
    workspaces: filteredAndSortedWorkspaces,
    trashCount,
    collectionModalOpened,
    editCollection,
    shareModalOpened,
    shareCollection,
    workspaceModalOpened,
    editWorkspace,
    workspaceSearch,
    setWorkspaceSearch,
    workspaceSort,
    showWorkspaceSearch,
    handleSelectCollection,
    handleOpenCreateCollectionModal,
    handleOpenEditCollectionModal,
    handleCollectionModalSubmit,
    handleCollectionDragUpdate,
    handleDeleteCollection,
    handleShareCollection,
    handleCloseCollectionModal,
    handleCloseShareModal,
    handleOpenCreateWorkspaceModal,
    handleWorkspaceModalSubmit,
    handleSelectWorkspaceCollection,
    handleCloseWorkspaceModal,
    handleToggleWorkspaceSearch,
    handleToggleWorkspaceSort
  };
}