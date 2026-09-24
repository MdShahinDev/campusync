import ResourceListPage from "../../../components/common/ResourceListPage";

export default function AllResources() {
  return (
    <ResourceListPage
      title="All Resources"
      subtitle="Manage and view all resources in the system."
      addLink="/admin/add-resource"
    />
  );
}
