import CollectionsList from '../../../collections/components/CollectionsList';

export default function CollectionsSection({
  collections,
  selectedCollection,
  onSelect,
  onCreateNew,
  onEdit,
  onUpdate,
  onDelete,
  onShare,
  getCollectionItemCount
}) {
  return (
    <CollectionsList
      collections={collections}
      selectedCollection={selectedCollection}
      onSelect={onSelect}
      onCreateNew={onCreateNew}
      onEdit={onEdit}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onShare={onShare}
      getCollectionItemCount={getCollectionItemCount}
    />
  );
}