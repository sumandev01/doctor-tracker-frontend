'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { dataService } from '@/services/dataService';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Activity,
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ShieldAlert,
} from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(null);

  // Strict RBAC Guard: If user is not Admin, block immediately with zero UI render & bounce to Dashboard
  useEffect(() => {
    const currentUser = dataService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'Admin') {
      setIsAdmin(false);
      router.replace('/');
    } else {
      setIsAdmin(true);
    }
  }, [router]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    staff: 0,
    active: 0,
  });

  // Add User State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff',
    phone: '',
    status: 'Active',
  });
  const [userErrors, setUserErrors] = useState({});
  const [showAddSuccessAlert, setShowAddSuccessAlert] = useState(false);
  const [lastCreatedUser, setLastCreatedUser] = useState(null);

  // Edit User State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Delete User Confirmation State (SweetAlert-style)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users list
  async function fetchUsers() {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await dataService.getUsers({
        page: currentPage,
        limit: 5,
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(res.users);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      if (err.status === 403) {
        router.replace('/');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin === true) {
      fetchUsers();
    }
  }, [isAdmin, currentPage, search, roleFilter, statusFilter]);

  // Handle Create User
  async function handleCreateUser(e) {
    e.preventDefault();
    const errors = {};
    if (!newUser.name.trim()) errors.name = 'Full name is required';
    if (!newUser.email.trim()) errors.email = 'Email address is required';
    if (!newUser.password.trim()) errors.password = 'Initial password is required';
    if (!newUser.phone.trim()) errors.phone = 'Contact phone is required';

    if (Object.keys(errors).length > 0) {
      setUserErrors(errors);
      return;
    }

    const created = await dataService.createUser(newUser);
    setIsAddModalOpen(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'Staff',
      phone: '',
      status: 'Active',
    });
    setUserErrors({});
    setLastCreatedUser(created);
    await fetchUsers();
    setShowAddSuccessAlert(true);
  }

  // Handle Edit User
  function handleOpenEdit(user) {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingUser) return;
    await dataService.updateUser(editingUser._id, editingUser);
    setIsEditModalOpen(false);
    setEditingUser(null);
    fetchUsers();
  }

  // Handle Delete User
  function handleOpenDelete(user) {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return;
    await dataService.deleteUser(userToDelete._id);
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    fetchUsers();
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AppLayout
      title="Administrative Staff & User Directory"
      subtitle="Manage hospital administrator accounts, staff roles & access permissions"
      actionButton={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New User
        </Button>
      }
    >
      {/* 4 KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Users
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Administrators */}
        <div className="bg-white p-4 rounded-xl border border-purple-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
              Administrators
            </span>
            <div className="text-xl font-bold text-purple-900 mt-0.5">{stats.admins}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Clinical Staff */}
        <div className="bg-white p-4 rounded-xl border border-teal-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
              Staff Members
            </span>
            <div className="text-xl font-bold text-teal-900 mt-0.5">{stats.staff}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Active Accounts */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Active Accounts
            </span>
            <div className="text-xl font-bold text-emerald-900 mt-0.5">{stats.active}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Input
              placeholder="Search users by name, email, or role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Role Filter */}
          <div className="w-40">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={['All Roles', 'Admin', 'Staff']}
            />
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={['All Status', 'Active', 'Suspended']}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Showing <span className="text-slate-900 font-bold">{users.length}</span> of{' '}
            <span className="text-slate-900 font-bold">{total}</span> Users
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* USERS DATA TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/70">
              <tr>
                <th className="py-3.5 px-6">User Name & Identity</th>
                <th className="py-3.5 px-5">System Role</th>
                <th className="py-3.5 px-5">Account Status</th>
                <th className="py-3.5 px-5">Contact Phone</th>
                <th className="py-3.5 px-5">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users found matching your search filter.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const formattedDate = u.joinedDate ? u.joinedDate.split('T')[0] : '2026-01-10';
                  const initials = u.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  const isAdmin = u.role === 'Admin';

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shadow-xs shrink-0 ${
                              isAdmin
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-teal-100 text-teal-700 border border-teal-200'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="block text-slate-900 font-bold text-xs">{u.name}</span>
                            <span className="text-[11px] text-slate-400 font-normal">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isAdmin
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}
                        >
                          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <Badge
                          variant={u.status === 'Active' ? 'success' : 'danger'}
                          dot
                          pulse={u.status === 'Active'}
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-600">{u.phone}</td>
                      <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                        {formattedDate}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition cursor-pointer select-none active:scale-95 shadow-2xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(u)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 border border-transparent hover:border-rose-200 hover:bg-rose-50 font-semibold transition cursor-pointer select-none active:scale-95 shadow-2xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={total}
          itemsPerPage={5}
        />
      </Card>

      {/* ==================== CREATE USER MODAL ==================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Portal User"
        description="Register a new administrator or staff member with role-based access"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Nusrat Jahan"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            icon={<User className="w-4 h-4" />}
            error={userErrors.name}
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. nusrat@careguide.bd"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            icon={<Mail className="w-4 h-4" />}
            error={userErrors.email}
          />

          <Input
            label="Initial Password *"
            type="password"
            placeholder="Minimum 6 characters"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            icon={<Lock className="w-4 h-4" />}
            error={userErrors.password}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned System Role *"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              options={['Staff', 'Admin']}
            />
            <Select
              label="Account Status"
              value={newUser.status}
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
              options={['Active', 'Suspended']}
            />
          </div>

          <Input
            label="Contact Phone *"
            placeholder="+880 1822-..."
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            error={userErrors.phone}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Register User
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================== EDIT USER MODAL ==================== */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Profile & Role"
        description="Update account credentials, administrative role, and access status"
      >
        {editingUser && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Full Name *"
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
            />

            <Input
              label="Email Address (Login ID) *"
              type="email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="System Role *"
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                options={['Staff', 'Admin']}
              />
              <Select
                label="Account Status *"
                value={editingUser.status}
                onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                options={['Active', 'Suspended']}
              />
            </div>

            <Input
              label="Contact Phone *"
              value={editingUser.phone}
              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="md" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Save User Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ==================== SWEETALERT-STYLE DELETE MODAL ==================== */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm User Deletion"
        maxWidth="max-w-md"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Are you sure you want to delete this user?</h4>
          <p className="text-xs text-slate-500 mt-1">
            User account for <strong className="text-slate-800">{userToDelete?.name}</strong> (
            <span className="text-teal-700">{userToDelete?.email}</span>) will be revoked permanently.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" size="md" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmDelete}>
              Yes, Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* ==================== SWEETALERT-STYLE SUCCESS MODAL ==================== */}
      <Modal
        isOpen={showAddSuccessAlert}
        onClose={() => setShowAddSuccessAlert(false)}
        title="User Account Created"
        maxWidth="max-w-sm"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">User Registered Successfully</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            <strong className="text-slate-800">{lastCreatedUser?.name}</strong> has been registered with{' '}
            <strong className="text-purple-700">{lastCreatedUser?.role}</strong> role.
          </p>
          <div className="mt-5">
            <Button variant="primary" size="md" className="w-full" onClick={() => setShowAddSuccessAlert(false)}>
              Done & View Users
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
