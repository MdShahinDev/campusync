import UserListPage from "../components/UserListPage";

export default function AllUsers() {
  return (
    <UserListPage
      showAll={true}
      title="All Users"
      subtitle="Manage and view all users across the platform."
      emptyMessage="No users found."
    />
  );
}
