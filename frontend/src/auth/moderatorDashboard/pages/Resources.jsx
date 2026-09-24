import ResourceListPage from "../../../components/common/ResourceListPage";

export default function Resources() {
  return (
    <ResourceListPage
      title="Resources"
      subtitle="View and manage assigned resources."
      addLink="/moderator/add-resource"
    />
  );
}
