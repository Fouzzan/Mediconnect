import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
import { User } from '../../types';
import { SearchIcon, FilterIcon, XIcon, Trash2Icon, UserIcon } from '../../components/Icons';

type RoleFilter = 'all' | 'patient' | 'clinician' | 'admin';
type StatusFilter = 'all' | 'active' | 'suspended';

const EditUserPanel: React.FC<{ user: User; onClose: () => void; onSave: (user: User) => void; }> = ({ user, onClose, onSave }) => {
    const [role, setRole] = useState(user.role);
    const [status, setStatus] = useState(user.status);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!role) return;
        setIsSaving(true);
        try {
            const updatedUser = await api.updateUserByAdmin(user.id, { role, status });
            onSave(updatedUser);
        } catch (error) {
            console.error("Failed to save user:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}>
            <div
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right-full duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Edit User: {user.username}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 flex-grow space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select value={role ?? ''} onChange={e => setRole(e.target.value as User['role'])} className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                            <option value="patient">Patient</option>
                            <option value="clinician">Clinician</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as User['status'])} className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-semibold">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-semibold disabled:bg-slate-400">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminUserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const allUsers = await api.getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => searchTerm === '' || user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(user => roleFilter === 'all' || user.role === roleFilter)
            .filter(user => statusFilter === 'all' || user.status === statusFilter);
    }, [users, searchTerm, roleFilter, statusFilter]);
    
    const handleSaveUser = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.deleteUserByAdmin(userToDelete.id);
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            setUserToDelete(null);
        } catch (error) {
             console.error("Failed to delete user:", error);
        }
    };
    
    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">User Management</h1>
            <p className="text-lg text-gray-600 mb-8">View, edit, and manage all users on the platform.</p>

            {/* Toolbar */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 p-2 border border-gray-300 rounded-md"/>
                </div>
                <div className="flex gap-4">
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as RoleFilter)} className="p-2 border border-gray-300 rounded-md">
                        <option value="all">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="clinician">Clinicians</option>
                        <option value="admin">Admins</option>
                    </select>
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} className="p-2 border border-gray-300 rounded-md">
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {isLoading ? <p>Loading users...</p> : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Last Login</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-t">
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800">{user.username}</div>
                                        <div className="text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="p-4 capitalize"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-slate-100 text-slate-700' : user.role === 'clinician' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>{user.role}</span></td>
                                    <td className="p-4 capitalize"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span></td>
                                    <td className="p-4 text-gray-600">{new Date(user.lastLogin).toLocaleDateString()}</td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => setUserToDelete(user)} className="text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editingUser && <EditUserPanel user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
            
            {userToDelete && (
                 <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
                     <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                         <h3 className="text-lg font-bold">Confirm Deletion</h3>
                         <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete the user "{userToDelete.username}"? This action cannot be undone.</p>
                         <div className="mt-4 flex justify-end gap-3">
                            <button onClick={() => setUserToDelete(null)} className="bg-gray-200 px-4 py-2 rounded-md text-sm font-semibold">Cancel</button>
                            <button onClick={handleDeleteUser} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold">Delete</button>
                         </div>
                     </div>
                 </div>
            )}
        </div>
    );
};

export default AdminUserManagementPage;