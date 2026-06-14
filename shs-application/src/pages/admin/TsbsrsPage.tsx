import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, Button, Select, DataTable, Modal, ConfirmModal, Badge, Pagination } from '@/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { adminApi } from '@/lib/api';
import type { Tsbsr, TrackStrand, BuildingSection, Room } from '@/types';
import toast from 'react-hot-toast';

export function TsbsrsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tsbsr | null>(null);
  const [deletingItem, setDeletingItem] = useState<Tsbsr | null>(null);
  const [trackStrandId, setTrackStrandId] = useState('');
  const [buildingSectionId, setBuildingSectionId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['tsbsrs', page],
    queryFn: async () => {
      const res = await adminApi.getTsbsrs({ page, per_page: 15 });
      return res.data;
    },
  });
  const tsbsrs = data?.tsbsrs || data?.data || (Array.isArray(data) ? data : []);
  const totalPages = data?.pagination?.last_page || 1;

  const { data: trackStrandsData } = useQuery({
    queryKey: ['track-strands'],
    queryFn: async () => {
      const res = await adminApi.getTrackStrands();
      return res.data;
    },
  });
  const trackStrands = trackStrandsData?.track_strands || trackStrandsData?.data || (Array.isArray(trackStrandsData) ? trackStrandsData : []);

  const { data: buildingSectionsData } = useQuery({
    queryKey: ['building-sections'],
    queryFn: async () => {
      const res = await adminApi.getBuildingSections();
      return res.data;
    },
  });
  const buildingSections = buildingSectionsData?.building_sections || buildingSectionsData?.data || (Array.isArray(buildingSectionsData) ? buildingSectionsData : []);

  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await adminApi.getRooms();
      return res.data;
    },
  });
  const rooms = roomsData?.rooms || roomsData?.data || (Array.isArray(roomsData) ? roomsData : []);

  const selectedBuildingSection = buildingSections.find((bs: BuildingSection) => bs.id === Number(buildingSectionId));
  const filteredRooms = selectedBuildingSection
    ? rooms.filter((room: Room) => room.building_id === null || room.building_id === selectedBuildingSection.building_id)
    : rooms;

  // Rooms already assigned to another TSBSR (allow keeping the current room when editing)
  const takenRoomIds = new Set(
    tsbsrs
      .filter((t: Tsbsr) => !editingItem || t.id !== editingItem.id)
      .map((t: Tsbsr) => t.room_id)
  );
  const availableRooms = filteredRooms.filter((r: Room) => !takenRoomIds.has(r.id));

  const createMutation = useMutation({
    mutationFn: (data: { track_strand_id: number; building_section_id: number; room_id: number }) => 
      adminApi.createTsbsr(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tsbsrs'] });
      toast.success('TSBSR created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create TSBSR'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { track_strand_id: number; building_section_id: number; room_id: number } }) => 
      adminApi.updateTsbsr(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tsbsrs'] });
      toast.success('TSBSR updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update TSBSR'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteTsbsr(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tsbsrs'] });
      toast.success('TSBSR deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    },
    onError: () => toast.error('Failed to delete TSBSR'),
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setTrackStrandId('');
    setBuildingSectionId('');
    setRoomId('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Tsbsr) => {
    setEditingItem(item);
    setTrackStrandId(String(item.track_strand_id));
    setBuildingSectionId(String(item.building_section_id));
    setRoomId(String(item.room_id));
    setIsModalOpen(true);
  };

  const openDeleteModal = (item: Tsbsr) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { 
      track_strand_id: Number(trackStrandId), 
      building_section_id: Number(buildingSectionId),
      room_id: Number(roomId)
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getTrackStrandLabel = (ts: TrackStrand) => 
    `${ts.track?.name || ''} - ${ts.strand?.name || ''} (G${ts.grade_level})`;

  const getBuildingSectionLabel = (bs: BuildingSection) => 
    `${bs.building?.name || ''} - ${bs.section?.name || ''}`;

  const columns = [
    { key: 'id', header: 'ID' },
    { 
      key: 'track_strand', 
      header: 'Track-Strand',
      render: (item: Tsbsr) => item.track_strand ? getTrackStrandLabel(item.track_strand) : '-'
    },
    { 
      key: 'building_section', 
      header: 'Building-Section',
      render: (item: Tsbsr) => item.building_section ? getBuildingSectionLabel(item.building_section) : '-'
    },
    { 
      key: 'room', 
      header: 'Room',
      render: (item: Tsbsr) => {
        if (!item.room) return '-';
        const buildingName = item.room.building?.name;
        return buildingName ? `${buildingName} - ${item.room.room_number}` : item.room.room_number;
      }
    },
    { 
      key: 'capacity', 
      header: 'Capacity',
      render: (item: Tsbsr) => (
        <Badge variant={item.has_capacity ? 'success' : 'danger'}>
          {item.enrollment_count || 0}/{item.room?.capacity || 0}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Tsbsr) => (
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
    <DashboardLayout title="TSBSR" breadcrumbs={[{ label: 'TSBSR' }]}>
      <Card>
        <CardHeader
          title="Manage TSBSR"
          description="Track-Strand, Building-Section, Room combinations"
          action={
            <Button onClick={openCreateModal}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add TSBSR
            </Button>
          }
        />
        <DataTable
          columns={columns}
          data={tsbsrs}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          enablePagination={false}
          emptyMessage="No TSBSR entries found"
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Edit TSBSR' : 'Add TSBSR'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Track-Strand"
            value={trackStrandId}
            onChange={(e) => setTrackStrandId(e.target.value)}
            options={trackStrands.map((ts: TrackStrand) => ({ 
              value: ts.id, 
              label: getTrackStrandLabel(ts)
            }))}
            placeholder="Select track-strand"
            required
          />
          <Select
            label="Building-Section"
            value={buildingSectionId}
            onChange={(e) => setBuildingSectionId(e.target.value)}
            options={buildingSections.map((bs: BuildingSection) => ({ 
              value: bs.id, 
              label: getBuildingSectionLabel(bs)
            }))}
            placeholder="Select building-section"
            required
          />
          <Select
            label="Room"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            options={availableRooms.map((r: Room) => ({ 
              value: r.id, 
              label: `${r.building?.name ? `${r.building.name} - ` : ''}${r.room_number} (Capacity: ${r.capacity || 'N/A'})`
            }))}
            placeholder={availableRooms.length === 0 ? 'No available rooms' : 'Select room'}
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
        title="Delete TSBSR"
        message="Are you sure you want to delete this TSBSR entry?"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
