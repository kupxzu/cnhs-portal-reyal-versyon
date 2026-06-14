<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    /**
     * Display a listing of rooms.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Room::with('building');
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));
        $shouldPaginate = $request->has('page') || $request->boolean('paginate');

        if ($shouldPaginate) {
            $rooms = $query->paginate($perPage);

            return response()->json([
                'rooms' => $rooms->items(),
                'pagination' => [
                    'current_page' => $rooms->currentPage(),
                    'last_page' => $rooms->lastPage(),
                    'per_page' => $rooms->perPage(),
                    'total' => $rooms->total(),
                ],
            ]);
        }

        $rooms = $query->get();

        return response()->json([
            'rooms' => $rooms,
        ]);
    }

    /**
     * Store a newly created room.
     */
    public function store(Request $request): JsonResponse
    {
        $buildingId = $request->building_id ?? null;

        $request->validate([
            'building_id' => 'nullable|exists:buildings,id',
            'room_number' => [
                'required', 'string', 'max:255',
                Rule::unique('rooms')->where(function ($query) use ($buildingId) {
                    return $buildingId === null
                        ? $query->whereNull('building_id')
                        : $query->where('building_id', $buildingId);
                }),
            ],
            'capacity' => 'nullable|integer|min:1|max:100',
        ]);

        $room = Room::create([
            'building_id' => $request->building_id,
            'room_number' => $request->room_number,
            'capacity' => $request->capacity ?? 30,
        ]);

        $room->load('building');

        return response()->json([
            'message' => 'Room created successfully',
            'room' => $room,
        ], 201);
    }

    /**
     * Display the specified room.
     */
    public function show(Room $room): JsonResponse
    {
        $room->load('building');

        return response()->json([
            'room' => $room,
        ]);
    }

    /**
     * Update the specified room.
     */
    public function update(Request $request, Room $room): JsonResponse
    {
        $buildingId = $request->exists('building_id') ? $request->building_id : $room->building_id;

        $request->validate([
            'building_id' => 'nullable|exists:buildings,id',
            'room_number' => [
                'required', 'string', 'max:255',
                Rule::unique('rooms')->where(function ($query) use ($buildingId) {
                    return $buildingId === null
                        ? $query->whereNull('building_id')
                        : $query->where('building_id', $buildingId);
                })->ignore($room->id),
            ],
            'capacity' => 'nullable|integer|min:1|max:100',
        ]);

        $room->update([
            'building_id' => $buildingId,
            'room_number' => $request->room_number,
            'capacity' => $request->capacity ?? $room->capacity,
        ]);

        $room->load('building');

        return response()->json([
            'message' => 'Room updated successfully',
            'room' => $room,
        ]);
    }

    /**
     * Remove the specified room.
     */
    public function destroy(Room $room): JsonResponse
    {
        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully',
        ]);
    }
}
