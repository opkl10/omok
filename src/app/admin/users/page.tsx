'use client';

import React, { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(console.error);
  }, []);

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const res = await fetch('/api/users', { method: 'PATCH', body: JSON.stringify({ id, role: newRole }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      setUsers((u) => u.map((x) => (x.id === id ? { ...x, role: newRole } : x)));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">משתמשים רשומים</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">אימייל</th>
            <th className="px-4 py-2">שם</th>
            <th className="px-4 py-2">תפקיד</th>
            <th className="px-4 py-2">החלפה</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.role}</td>
              <td className="px-4 py-2">
                <button onClick={() => toggleRole(user.id, user.role)} className="px-3 py-1 bg-blue-600 text-white rounded">
                  {user.role === 'admin' ? 'הסר מנהל' : 'הגדר מנהל'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
