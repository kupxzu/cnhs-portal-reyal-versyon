import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Input, DataTable, Modal, ConfirmModal, Badge, Pagination } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon, MagnifyingGlassIcon, ResetIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { Student } from '@/types';
import toast from 'react-hot-toast';

export function StudentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, page],
    queryFn: async () => {
      const res = await adminApi.getStudents({ search, page });
      return res.data;
    },
  });

  const students = data?.students?.data || data?.data || [];
  const totalPages = data?.students?.last_page || data?.last_page || 1;

  const createMutation = useMutation({
    mutationFn: (data: { id_number: string; email: string; username: string; password: string }) => 
      adminApi.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create student'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ id_number: string; email: string; username: string; password: string }> }) => 
      adminApi.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update student'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingStudent(null);
    },
    onError: () => toast.error('Failed to delete student'),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => adminApi.restoreStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student restored successfully');
    },
    onError: () => toast.error('Failed to restore student'),
  });

  const openCreateModal = () => {
    setEditingStudent(null);
    setIdNumber('');
    setEmail('');
    setUsername('');
    setPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setIdNumber(student.id_number);
    setEmail(student.email);
    setUsername(student.username);
    setPassword('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (student: Student) => {
    setDeletingStudent(student);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const updateData: Partial<{ id_number: string; email: string; username: string; password: string }> = {
        id_number: idNumber,
        email,
        username,
      };
      if (password) updateData.password = password;
      updateMutation.mutate({ id: editingStudent.id, data: updateData });
    } else {
      createMutation.mutate({ id_number: idNumber, email, username, password });
    }
  };

  const columns = [
    { key: 'id_number', header: 'ID Number' },
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { 
      key: 'status', 
      header: 'Status',
      render: (student: Student) => (
        <Badge variant={student.deleted_at ? 'danger' : 'success'}>
          {student.deleted_at ? 'Deleted' : 'Active'}
        </Badge>
      )
    },
    { 
      key: 'created_at', 
      header: 'Created At',
      render: (student: Student) => new Date(student.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (student: Student) => (
        <div className="flex gap-2">
          {student.deleted_at ? (
            <button 
              onClick={() => restoreMutation.mutate(student.id)} 
              className="p-1.5 hover:bg-green-50 rounded"
              title="Restore"
            >
              <ResetIcon className="w-4 h-4 text-green-600" />
            </button>
          ) : (
            <>
              <button onClick={() => openEditModal(student)} className="p-1.5 hover:bg-gray-100 rounded">
                <Pencil1Icon className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => openDeleteModal(student)} className="p-1.5 hover:bg-red-50 rounded">
                <TrashIcon className="w-4 h-4 text-red-600" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Students" breadcrumbs={[{ label: 'Students' }]}>
      <Card>
        <CardHeader
          title="Manage Students"
          description="Student accounts and information"
          action={
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          }
        />
        
        <div className="mb-4 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search students..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={students}
          keyExtractor={(student) => student.id}
          isLoading={isLoading}
          enablePagination={false}
          emptyMessage="No students found"
        />
        
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStudent ? 'Edit Student' : 'Add Student'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ID Number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="e.g., 2026-0001"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            required
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
          <Input
            label={editingStudent ? 'Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required={!editingStudent}
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingStudent ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deletingStudent && deleteMutation.mutate(deletingStudent.id)}
        title="Delete Student"
        message={`Are you sure you want to delete student "${deletingStudent?.username}"? This is a soft delete and can be restored.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
