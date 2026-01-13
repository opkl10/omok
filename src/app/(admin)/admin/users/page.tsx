'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: { posts: number; pages: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
    setLoading(false);
  };

  const handleRoleChange = async (id: string, role: string) => {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    });

    if (response.ok) {
      fetchUsers();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) return;

    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      fetchUsers();
    } else {
      const data = await response.json();
      alert(data.error || 'שגיאה במחיקה');
    }
  };

  if (loading) return <div className="text-center py-8">טוען...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ניהול משתמשים</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">שם</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">אימייל</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">תפקיד</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">פוסטים</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">תאריך הרשמה</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-black">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-black">{user.name}</td>
                <td className="px-6 py-4 text-black">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="px-2 py-1 border rounded-md"
                  >
                    <option value="user">משתמש</option>
                    <option value="editor">עורך</option>
                    <option value="admin">מנהל</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-black">{user._count.posts}</td>
                <td className="px-6 py-4 text-black">
                  {new Date(user.createdAt).toLocaleDateString('he-IL')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
