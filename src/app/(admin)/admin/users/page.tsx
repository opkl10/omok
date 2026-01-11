'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  createdAt: string;
  _count: {
    posts: number;
    pages: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchUsers();
        setEditingUser(null);
        setFormData({ name: '', email: '', role: '', password: '' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ניהול משתמשים</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">שם</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">אימייל</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">תפקיד</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">פוסטים</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">עמודים</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">תאריך הצטרפות</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  אין משתמשים
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user._count.posts}</td>
                  <td className="px-6 py-4 text-gray-500">{user._count.pages}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        ערוך
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        מחק
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">ערוך משתמש</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="user">משתמש</option>
                  <option value="admin">מנהל</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סיסמה חדשה (השאר ריק כדי לא לשנות)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="סיסמה חדשה"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                שמור
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
