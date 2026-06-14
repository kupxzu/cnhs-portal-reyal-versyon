import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Input, DataTable, Modal, ConfirmModal, Pagination } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { Section } from '@/types';
import toast from 'react-hot-toast';

export function SectionsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);
  const [name, setName] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['sections', page],
    queryFn: async () => {
      const res = await adminApi.getSections({ page, per_page: 15 });
      return res.data;
    },
  });
  const sections = data?.sections || data?.data || (Array.isArray(data) ? data : []);
  const totalPages = data?.pagination?.last_page || 1;

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => adminApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create section'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => 
      adminApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update section'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingSection(null);
    },
    onError: () => toast.error('Failed to delete section'),
  });

  const openCreateModal = () => {
    setEditingSection(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (section: Section) => {
    setEditingSection(section);
    setName(section.name);
    setIsModalOpen(true);
  };

  const openDeleteModal = (section: Section) => {
    setDeletingSection(section);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data: { name } });
    } else {
      createMutation.mutate({ name });
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { 
      key: 'created_at', 
      header: 'Created At',
      render: (section: Section) => new Date(section.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (section: Section) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(section)} className="p-1.5 hover:bg-gray-100 rounded">
            <Pencil1Icon className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => openDeleteModal(section)} className="p-1.5 hover:bg-red-50 rounded">
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Sections" breadcrumbs={[{ label: 'Sections' }]}>
      <Card>
        <CardHeader
          title="Manage Sections"
          description="Class sections for student grouping"
          action={
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          }
        />
        <DataTable
          columns={columns}
          data={sections}
          keyExtractor={(section) => section.id}
          isLoading={isLoading}
          enablePagination={false}
          emptyMessage="No sections found"
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSection ? 'Edit Section' : 'Add Section'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Section Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Section A, Section B"
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingSection ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deletingSection && deleteMutation.mutate(deletingSection.id)}
        title="Delete Section"
        message={`Are you sure you want to delete "${deletingSection?.name}"?`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
