import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Select, DataTable, Modal, ConfirmModal, Pagination } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { BuildingSection, Building, Section } from '@/types';
import toast from 'react-hot-toast';

export function BuildingSectionsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BuildingSection | null>(null);
  const [deletingItem, setDeletingItem] = useState<BuildingSection | null>(null);
  const [buildingId, setBuildingId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['building-sections', page],
    queryFn: async () => {
      const res = await adminApi.getBuildingSections({ page, per_page: 15 });
      return res.data;
    },
  });
  const buildingSections = data?.building_sections || data?.data || (Array.isArray(data) ? data : []);
  const totalPages = data?.pagination?.last_page || 1;

  const { data: buildingsData } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const res = await adminApi.getBuildings();
      return res.data;
    },
  });
  const buildings = buildingsData?.buildings || buildingsData?.data || (Array.isArray(buildingsData) ? buildingsData : []);

  const { data: sectionsData } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const res = await adminApi.getSections();
      return res.data;
    },
  });
  const sections = sectionsData?.sections || sectionsData?.data || (Array.isArray(sectionsData) ? sectionsData : []);

  const createMutation = useMutation({
    mutationFn: (data: { building_id: number; section_id: number }) => 
      adminApi.createBuildingSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-sections'] });
      toast.success('Building-Section created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create building-section'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { building_id: number; section_id: number } }) => 
      adminApi.updateBuildingSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-sections'] });
      toast.success('Building-Section updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update building-section'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBuildingSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['building-sections'] });
      toast.success('Building-Section deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    },
    onError: () => toast.error('Failed to delete building-section'),
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setBuildingId('');
    setSectionId('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: BuildingSection) => {
    setEditingItem(item);
    setBuildingId(String(item.building_id));
    setSectionId(String(item.section_id));
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: BuildingSection) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { building_id: Number(buildingId), section_id: Number(sectionId) };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { 
      key: 'building', 
      header: 'Building',
      render: (item: BuildingSection) => item.building?.name || '-'
    },
    { 
      key: 'section', 
      header: 'Section',
      render: (item: BuildingSection) => item.section?.name || '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: BuildingSection) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(item)} className="p-1.5 hover:bg-gray-100 rounded">
            <Pencil1Icon className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => openDeleteModal(item)} className="p-1.5 hover:bg-red-50 rounded">
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Building-Sections" breadcrumbs={[{ label: 'Building-Sections' }]}>
      <Card>
        <CardHeader
          title="Manage Building-Sections"
          description="Link sections to buildings"
          action={
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Building-Section
            </Button>
          }
        />
        <DataTable
          columns={columns}
          data={buildingSections}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          enablePagination={false}
          emptyMessage="No building-sections found"
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Edit Building-Section' : 'Add Building-Section'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Building"
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            options={buildings.map((b: Building) => ({ value: b.id, label: b.name }))}
            placeholder="Select a building"
            required
          />
          <Select
            label="Section"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            options={sections.map((s: Section) => ({ value: s.id, label: s.name }))}
            placeholder="Select a section"
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deletingItem && deleteMutation.mutate(deletingItem.id)}
        title="Delete Building-Section"
        message="Are you sure you want to delete this building-section?"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
