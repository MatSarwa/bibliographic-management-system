import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
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
    console.log('DashboardPage - EDIT ITEM:', item);
    setEditItem(item);
    setEditModalOpened(true);
  };

  const handleSubmitEdit = async (itemData) => {
    console.log('DashboardPage - SUBMIT EDIT:', itemData);
    
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
    console.log('DashboardPage - SUBMIT ADD:', itemData);
    
    const success = await handleCreate(itemData);
    
    if (success) {
      setAddModalOpened(false);
    }
  };

  const handleOpenAddModal = () => {
    console.log('DashboardPage - OPEN ADD MODAL');
    console.log('Default collection ID:', getCollectionId());
    setAddModalOpened(true);
  };

  const handleSelectView = (view) => {
    console.log('DashboardPage - SELECT VIEW:', view);
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
          console.log('Closing EDIT modal');
          setEditModalOpened(false);
          setEditItem(null);
        }}
        onSubmit={handleSubmitEdit}
        editItem={editItem}
      />

      <ItemModal
        opened={addModalOpened}
        onClose={() => {
          console.log('Closing ADD modal');
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