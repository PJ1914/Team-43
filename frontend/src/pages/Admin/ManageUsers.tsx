import { useEffect, useState } from "react";
import api from "../../services/api";
import Spinner from "../../components/ui/Spinner";
import { Role, UserProfile } from "../../types";

const ManageUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const { data } = await api.get<{ users: UserProfile[] }>("/admin/users");
    setUsers(data.users);
    setLoading(false);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const updateRole = async (uid: string, role: Role) => {
    await api.put(`/admin/users/${uid}/role`, { role });
    await loadUsers();
  };

  if (loading) {
    return <Spinner label="Loading users..." />;
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-panel">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Manage Users</h1>
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs uppercase text-slate-500">Name</th>
            <th className="px-4 py-2 text-left text-xs uppercase text-slate-500">Department</th>
            <th className="px-4 py-2 text-left text-xs uppercase text-slate-500">Role</th>
            <th className="px-4 py-2 text-left text-xs uppercase text-slate-500">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uid} className="border-t border-slate-200">
              <td className="px-4 py-3 text-sm">{user.name}</td>
              <td className="px-4 py-3 text-sm">{user.department}</td>
              <td className="px-4 py-3 text-sm">{user.role}</td>
              <td className="px-4 py-3 text-sm">
                <select
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={user.role}
                  onChange={(event) => void updateRole(user.uid, event.target.value as Role)}
                >
                  <option value="faculty">faculty</option>
                  <option value="coordinator">coordinator</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
