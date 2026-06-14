<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Strand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StrandController extends Controller
{
    /**
     * Display a listing of strands.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Strand::with('tracks');
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));
        $shouldPaginate = $request->has('page') || $request->boolean('paginate');

        if ($shouldPaginate) {
            $strands = $query->paginate($perPage);

            return response()->json([
                'strands' => $strands->items(),
                'pagination' => [
                    'current_page' => $strands->currentPage(),
                    'last_page' => $strands->lastPage(),
                    'per_page' => $strands->perPage(),
                    'total' => $strands->total(),
                ],
            ]);
        }

        $strands = $query->get();

        return response()->json([
            'strands' => $strands,
        ]);
    }

    /**
     * Store a newly created strand.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:strands',
        ]);

        $strand = Strand::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Strand created successfully',
            'strand' => $strand,
        ], 201);
    }

    /**
     * Display the specified strand.
     */
    public function show(Strand $strand): JsonResponse
    {
        $strand->load(['trackStrands.track']);

        return response()->json([
            'strand' => $strand,
        ]);
    }

    /**
     * Update the specified strand.
     */
    public function update(Request $request, Strand $strand): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:strands,name,' . $strand->id,
        ]);

        $strand->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Strand updated successfully',
            'strand' => $strand,
        ]);
    }

    /**
     * Remove the specified strand.
     */
    public function destroy(Strand $strand): JsonResponse
    {
        $strand->delete();

        return response()->json([
            'message' => 'Strand deleted successfully',
        ]);
    }
}
