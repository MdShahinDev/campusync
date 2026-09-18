import UserListPage from "../components/UserListPage";

export default function PendingUsers() {
  return (
    <UserListPage
      verified={false}
      title="Pending Users"
      subtitle="Newly registered users awaiting verification. Approve them to grant full access."
      emptyMessage="No pending users. All users are verified."
      showPendingActions={true}
    />
  );
}
