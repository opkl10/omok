'use client';

import { useState, useEffect } from 'react';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const response = await fetch('/api/contact');
    const data = await response.json();
    setContacts(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch('/api/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchContacts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק הודעה זו?')) return;

    await fetch('/api/contact', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchContacts();
    if (selectedContact?.id === id) setSelectedContact(null);
  };

  if (loading) return <div className="text-center py-8">טוען...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">הודעות צור קשר</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-black">שם</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-black">נושא</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-black">סטטוס</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-black">תאריך</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-black">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-black">
                      אין הודעות
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td className="px-4 py-3 text-black">{contact.name}</td>
                      <td className="px-4 py-3 text-black">{contact.subject || '-'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={contact.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(contact.id, e.target.value);
                          }}
                          className={`px-2 py-1 text-xs rounded ${
                            contact.status === 'new'
                              ? 'bg-yellow-100 text-yellow-800'
                              : contact.status === 'read'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          <option value="new">חדש</option>
                          <option value="read">נקרא</option>
                          <option value="replied">נענה</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-black text-sm">
                        {new Date(contact.createdAt).toLocaleDateString('he-IL')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(contact.id);
                          }}
                          className="text-red-600 hover:underline text-sm"
                        >
                          מחק
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {selectedContact ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">פרטי ההודעה</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-black font-medium">שם: </span>
                  <span className="text-black">{selectedContact.name}</span>
                </div>
                <div>
                  <span className="text-black font-medium">אימייל: </span>
                  <a href={`mailto:${selectedContact.email}`} className="text-blue-600">
                    {selectedContact.email}
                  </a>
                </div>
                <div>
                  <span className="text-black font-medium">נושא: </span>
                  <span className="text-black">{selectedContact.subject || '-'}</span>
                </div>
                <div>
                  <span className="text-black font-medium">תאריך: </span>
                  <span className="text-black">
                    {new Date(selectedContact.createdAt).toLocaleString('he-IL')}
                  </span>
                </div>
                <div>
                  <span className="text-black font-medium block mb-2">הודעה:</span>
                  <p className="text-black bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-black">
              בחר הודעה לצפייה
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
