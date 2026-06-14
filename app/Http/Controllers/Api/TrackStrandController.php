<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrackStrand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackStrandController extends Controller
{
    /**
     * Display a listing of track strands.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TrackStrand::with(['track', 'strand']);

        // Filter by grade level
        if ($request->has('grade_level')) {
            $query->where('grade_level', $request->grade_level);
        }

        // Filter by track
        if ($request->has('track_id')) {
            $query->where('track_id', $request->track_id);
        }

        // Filter by strand
        if ($request->has('strand_id')) {
            $query->where('strand_id', $request->strand_id);
        }

        $perPage = max(1, min((int) $request->input('per_page', 15), 100));
        $shouldPaginate = $request->has('page') || $request->boolean('paginate');

        if ($shouldPaginate) {
            $trackStrands = $query->paginate($perPage);

            return response()->json([
                'track_strands' => $trackStrands->items(),
                'pagination' => [
                    'current_page' => $trackStrands->currentPage(),
                    'last_page' => $trackStrands->lastPage(),
                    'per_page' => $trackStrands->perPage(),
                    'total' => $trackStrands->total(),
                ],
            ]);
        }

        $trackStrands = $query->get();

        return response()->json([
            'track_strands' => $trackStrands,
        ]);
    }

    /**
     * Store a newly created track strand.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'track_id' => 'required|exists:tracks,id',
            'strand_id' => 'required|exists:strands,id',
            'grade_level' => 'required|in:11,12',
        ]);

        // Check if combination already exists
        $exists = TrackStrand::where('track_id', $request->track_id)
            ->where('strand_id', $request->strand_id)
            ->where('grade_level', $request->grade_level)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This track-strand-grade combination already exists',
            ], 422);
        }

        $trackStrand = TrackStrand::create([
            'track_id' => $request->track_id,
            'strand_id' => $request->strand_id,
            'grade_level' => $request->grade_level,
        ]);

        $trackStrand->load(['track', 'strand']);

        return response()->json([
            'message' => 'Track strand created successfully',
            'track_strand' => $trackStrand,
        ], 201);
    }

    /**
     * Display the specified track strand.
     */
    public function show(TrackStrand $trackStrand): JsonResponse
    {
        $trackStrand->load(['track', 'strand']);

        return response()->json([
            'track_strand' => $trackStrand,
        ]);
    }

    /**
     * Update the specified track strand.
     */
    public function update(Request $request, TrackStrand $trackStrand): JsonResponse
    {
        $request->validate([
            'track_id' => 'required|exists:tracks,id',
            'strand_id' => 'required|exists:strands,id',
            'grade_level' => 'required|in:11,12',
        ]);

        // Check if combination already exists (excluding current)
        $exists = TrackStrand::where('track_id', $request->track_id)
            ->where('strand_id', $request->strand_id)
            ->where('grade_level', $request->grade_level)
            ->where('id', '!=', $trackStrand->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This track-strand-grade combination already exists',
            ], 422);
        }

        $trackStrand->update([
            'track_id' => $request->track_id,
            'strand_id' => $request->strand_id,
            'grade_level' => $request->grade_level,
        ]);

        $trackStrand->load(['track', 'strand']);

        return response()->json([
            'message' => 'Track strand updated successfully',
            'track_strand' => $trackStrand,
        ]);
    }

    /**
     * Remove the specified track strand.
     */
    public function destroy(TrackStrand $trackStrand): JsonResponse
    {
        $trackStrand->delete();

        return response()->json([
            'message' => 'Track strand deleted successfully',
        ]);
    }
}
