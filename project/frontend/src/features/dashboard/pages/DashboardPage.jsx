import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import itemsService from '../../items/services/itemsService';
import { useRefreshVersion } from '../../../shared/store/refreshStore';
import ItemsList from '../../items/components/ItemsList';
import TrashView from '../../items/components/TrashView';
import LabelsView from '../../labels/components/LabelsView';
import ItemModal from '../../items/components/ItemModal';
import { useItems } from '../../items/hooks/useItems';

export default function DashboardPage() {
  const [selectedView, setSelectedView] = useState({ type: 'all' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [addModalOpened, setAddModalOpened] = useState(false);

  const { handleCreate, handleUpdate, handleToggleFavorite } = useItems(
    getCollectionId(),
    selectedView.type
  );

  // The detail panel shows a snapshot of the clicked item; reload it after any item change
  // (labels, restored version, favorite...). If it was deleted or moved away, close the panel.
  const itemsVersion = useRefreshVersion('items');
  useEffect(() => {
    if (!selectedItem || itemsVersion === 0) return;
    itemsService.getById(selectedItem.id)
      .then((result) => {
        if (result?.success && result.data && result.data.status !== 'trashed') setSelectedItem(result.data);
        else setSelectedItem(null);
      })
      .catch(() => setSelectedItem(null));
  }, [itemsVersion]);

  function getCollectionId() {
    if (selectedView.type === 'all') return 'all';
    if (selectedView.type === 'favorites') return 'favorites';
    if (selectedView.type === 'trash') return 'trash';
    if (selectedView.type === 'labels') return 'labels';
    
    if (selectedView.type === 'collection' && selectedView.data) {
      return selectedView.data.id;
    }
    
    if (selectedView.type === 'workspace-collection' && selectedView.data?.collection) {
      return selectedView.data.collection.id;
    }
    
    return 'all';
  }

  function getWorkspaceId() {
    if (selectedView.type === 'workspace-collection' && selectedView.data?.workspace) {
      return selectedView.data.workspace.id;
    }
    return null;
  }

  const handleEditItem = (item) => {
    setEditItem(item);
    setEditModalOpened(true);
  };

  const handleSubmitEdit = async (itemData) => {
    
    if (editItem) {
      const success = await handleUpdate(editItem.id, itemData);
      
      if (success) {
        setEditModalOpened(false);
        setEditItem(null);
        
        if (selectedItem?.id === editItem.id) {
          setSelectedItem({ ...selectedItem, ...itemData });
        }
      }
    }
  };

  const handleSubmitAdd = async (itemData) => {
    
    const success = await handleCreate(itemData);
    
    if (success) {
      setAddModalOpened(false);
    }
  };

  const handleOpenAddModal = () => {
    setAddModalOpened(true);
  };

  const handleSelectView = (view) => {
    setSelectedView(view);
    setSelectedItem(null);
  };

  return (
    <>
      <DashboardLayout
        selectedView={selectedView}
        onSelectView={handleSelectView}
        selectedItem={selectedItem}
        onEditItem={handleEditItem}
        onToggleFavorite={handleToggleFavorite}
        onOpenAddModal={handleOpenAddModal}
      >
        {selectedView.type === 'trash' ? (
          <TrashView />
        ) : selectedView.type === 'labels' ? (
          <LabelsView />
        ) : selectedView.type === 'workspace-collection' ? (
          <ItemsList
            collectionId={getCollectionId()}
            viewType="workspace-collection"
            workspaceId={getWorkspaceId()}
            onItemSelect={setSelectedItem}
          />
        ) : (
          <ItemsList
            collectionId={getCollectionId()}
            viewType={selectedView.type}
            onItemSelect={setSelectedItem}
          />
        )}
      </DashboardLayout>

      <ItemModal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setEditItem(null);
        }}
        onSubmit={handleSubmitEdit}
        editItem={editItem}
      />

      <ItemModal
        opened={addModalOpened}
        onClose={() => {
          setAddModalOpened(false);
        }}
        onSubmit={handleSubmitAdd}
        editItem={null}
        defaultCollectionId={
          getCollectionId() !== 'all' && 
          getCollectionId() !== 'favorites' && 
          getCollectionId() !== 'trash' &&
          getCollectionId() !== 'labels'
            ? getCollectionId() 
            : null
        }
        workspaceId={getWorkspaceId()}
      />
    </>
  );
}