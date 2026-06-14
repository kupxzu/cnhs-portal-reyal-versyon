<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuildingController extends Controller
{
    /**
     * Display a listing of buildings.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Building::with('sections');
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));
        $shouldPaginate = $request->has('page') || $request->boolean('paginate');

        if ($shouldPaginate) {
            $buildings = $query->paginate($perPage);

            return response()->json([
                'buildings' => $buildings->items(),
                'pagination' => [
                    'current_page' => $buildings->currentPage(),
                    'last_page' => $buildings->lastPage(),
                    'per_page' => $buildings->perPage(),
                    'total' => $buildings->total(),
                ],
            ]);
        }

        $buildings = $query->get();

        return response()->json([
            'buildings' => $buildings,
        ]);
    }

    /**
     * Store a newly created building.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:buildings',
        ]);

        $building = Building::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Building created successfully',
            'building' => $building,
        ], 201);
    }

    /**
     * Display the specified building.
     */
    public function show(Building $building): JsonResponse
    {
        $building->load(['buildingSections.section']);

        return response()->json([
            'building' => $building,
        ]);
    }

    /**
     * Update the specified building.
     */
    public function update(Request $request, Building $building): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:buildings,name,' . $building->id,
        ]);

        $building->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Building updated successfully',
            'building' => $building,
        ]);
    }

    /**
     * Remove the specified building.
     */
    public function destroy(Building $building): JsonResponse
    {
        $building->delete();

        return response()->json([
            'message' => 'Building deleted successfully',
        ]);
    }
}
