import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Input, DataTable, Modal, ConfirmModal, Pagination } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { Building } from '@/types';
import toast from 'react-hot-toast';

export function BuildingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [deletingBuilding, setDeletingBuilding] = useState<Building | null>(null);
  const [name, setName] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['buildings', page],
    queryFn: async () => {
      const res = await adminApi.getBuildings({ page, per_page: 15 });
      return res.data;
    },
  });
  const buildings = data?.buildings || data?.data || (Array.isArray(data) ? data : []);
  const totalPages = data?.pagination?.last_page || 1;

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => adminApi.createBuilding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success('Building created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create building'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => 
      adminApi.updateBuilding(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success('Building updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update building'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBuilding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success('Building deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingBuilding(null);
    },
    onError: () => toast.error('Failed to delete building'),
  });

  const openCreateModal = () => {
    setEditingBuilding(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (building: Building) => {
    setEditingBuilding(building);
    setName(building.name);
    setIsModalOpen(true);
  };

  const openDeleteModal = (building: Building) => {
    setDeletingBuilding(building);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBuilding(null);
    setName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBuilding) {
      updateMutation.mutate({ id: editingBuilding.id, data: { name } });
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
      render: (building: Building) => new Date(building.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (building: Building) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(building)} className="p-1.5 hover:bg-gray-100 rounded">
            <Pencil1Icon className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => openDeleteModal(building)} className="p-1.5 hover:bg-red-50 rounded">
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Buildings" breadcrumbs={[{ label: 'Buildings' }]}>
      <Card>
        <CardHeader
          title="Manage Buildings"
          description="School buildings and facilities"
          action={
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Building
            </Button>
          }
        />
        <DataTable
          columns={columns}
          data={buildings}
          keyExtractor={(building) => building.id}
          isLoading={isLoading}
          enablePagination={false}
          emptyMessage="No buildings found"
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBuilding ? 'Edit Building' : 'Add Building'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Building Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Main Building, Science Building"
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingBuilding ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deletingBuilding && deleteMutation.mutate(deletingBuilding.id)}
        title="Delete Building"
        message={`Are you sure you want to delete "${deletingBuilding?.name}"?`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
