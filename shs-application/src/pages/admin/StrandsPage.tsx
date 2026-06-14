import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Input, DataTable, Modal, ConfirmModal, Pagination } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { Strand } from '@/types';
import toast from 'react-hot-toast';

export function StrandsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStrand, setEditingStrand] = useState<Strand | null>(null);
  const [deletingStrand, setDeletingStrand] = useState<Strand | null>(null);
  const [name, setName] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['strands', page],
    queryFn: async () => {
      const res = await adminApi.getStrands({ page, per_page: 15 });
      return res.data;
    },
  });
  const strands = data?.strands || data?.data || (Array.isArray(data) ? data : []);
  const totalPages = data?.pagination?.last_page || 1;

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => adminApi.createStrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strands'] });
      toast.success('Strand created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create strand'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => 
      adminApi.updateStrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strands'] });
      toast.success('Strand updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update strand'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteStrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strands'] });
      toast.success('Strand deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingStrand(null);
    },
    onError: () => toast.error('Failed to delete strand'),
  });

  const openCreateModal = () => {
    setEditingStrand(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (strand: Strand) => {
    setEditingStrand(strand);
    setName(strand.name);
    setIsModalOpen(true);
  };

  const openDeleteModal = (strand: Strand) => {
    setDeletingStrand(strand);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStrand(null);
    setName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStrand) {
      updateMutation.mutate({ id: editingStrand.id, data: { name } });
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
      render: (strand: Strand) => new Date(strand.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (strand: Strand) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(strand)}
            className="p-1.5 hover:bg-gray-100 rounded"
          >
            <Pencil1Icon className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => openDeleteModal(strand)}
            className="p-1.5 hover:bg-red-50 rounded"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Strands" breadcrumbs={[{ label: 'Strands' }]}>
      <Card>
        <CardHeader
          title="Manage Strands"
          description="Academic strands under each track"
          action={
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Strand
            </Button>
          }
        />
        <DataTable
          columns={columns}
          data={strands}
          keyExtractor={(strand) => strand.id}
          isLoading={isLoading}
          enablePagination={false}
          emptyMessage="No strands found"
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStrand ? 'Edit Strand' : 'Add Strand'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Strand Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., STEM, ABM, HUMSS"
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingStrand ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deletingStrand && deleteMutation.mutate(deletingStrand.id)}
        title="Delete Strand"
        message={`Are you sure you want to delete "${deletingStrand?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
