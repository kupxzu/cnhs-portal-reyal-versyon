<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentTrack;
use App\Models\Student;
use App\Models\Tsbsr;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentTrackController extends Controller
{
    /**
     * Display a listing of student tracks (enrollments).
     */
    public function index(Request $request): JsonResponse
    {
        $query = StudentTrack::with([
            'student.info',
            'tsbsr.trackStrand.track',
            'tsbsr.trackStrand.strand',
            'tsbsr.buildingSection.building',
            'tsbsr.buildingSection.section',
            'tsbsr.room',
        ]);

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by TSBSR
        if ($request->has('tsbsr_id')) {
            $query->where('tsbsr_id', $request->tsbsr_id);
        }

        // Filter by school year
        if ($request->has('school_year')) {
            $query->where('school_year', $request->school_year);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $studentTracks = $query->paginate($request->per_page ?? 15);

        return response()->json($studentTracks);
    }

    /**
     * Enroll a student (create student track).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'tsbsr_id' => 'required|exists:tsbsrs,id',
            'school_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'status' => 'nullable|in:enrolled,dropped,graduated,transferred',
        ]);

        // Check if student is already enrolled for this school year
        $exists = StudentTrack::where('student_id', $request->student_id)
            ->where('school_year', $request->school_year)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Student is already enrolled for this school year',
            ], 422);
        }

        // Check room capacity
        $tsbsr = Tsbsr::findOrFail($request->tsbsr_id);
        if (!$tsbsr->hasCapacity()) {
            return response()->json([
                'message' => 'Room capacity is full. Cannot enroll more students.',
            ], 422);
        }

        $studentTrack = StudentTrack::create([
            'student_id' => $request->student_id,
            'tsbsr_id' => $request->tsbsr_id,
            'school_year' => $request->school_year,
            'status' => $request->status ?? 'enrolled',
        ]);

        $studentTrack->load([
            'student.info',
            'tsbsr.trackStrand.track',
            'tsbsr.trackStrand.strand',
            'tsbsr.buildingSection.building',
            'tsbsr.buildingSection.section',
            'tsbsr.room',
        ]);

        return response()->json([
            'message' => 'Student enrolled successfully',
            'student_track' => $studentTrack,
        ], 201);
    }

    /**
     * Display the specified student track.
     */
    public function show(StudentTrack $studentTrack): JsonResponse
    {
        $studentTrack->load([
            'student.info',
            'tsbsr.trackStrand.track',
            'tsbsr.trackStrand.strand',
            'tsbsr.buildingSection.building',
            'tsbsr.buildingSection.section',
            'tsbsr.room',
        ]);

        return response()->json([
            'student_track' => $studentTrack,
        ]);
    }

    /**
     * Update the specified student track.
     */
    public function update(Request $request, StudentTrack $studentTrack): JsonResponse
    {
        $request->validate([
            'tsbsr_id' => 'sometimes|required|exists:tsbsrs,id',
            'school_year' => 'sometimes|required|string|regex:/^\d{4}-\d{4}$/',
            'status' => 'sometimes|required|in:enrolled,dropped,graduated,transferred',
        ]);

        // If changing TSBSR, check capacity
        if ($request->has('tsbsr_id') && $request->tsbsr_id != $studentTrack->tsbsr_id) {
            $tsbsr = Tsbsr::findOrFail($request->tsbsr_id);
            if (!$tsbsr->hasCapacity()) {
                return response()->json([
                    'message' => 'Room capacity is full. Cannot transfer student.',
                ], 422);
            }
        }

        // If changing school year, check for duplicate enrollment
        if ($request->has('school_year') && $request->school_year != $studentTrack->school_year) {
            $exists = StudentTrack::where('student_id', $studentTrack->student_id)
                ->where('school_year', $request->school_year)
                ->where('id', '!=', $studentTrack->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Student already has an enrollment for this school year',
                ], 422);
            }
        }

        $studentTrack->update($request->only(['tsbsr_id', 'school_year', 'status']));

        $studentTrack->load([
            'student.info',
            'tsbsr.trackStrand.track',
            'tsbsr.trackStrand.strand',
            'tsbsr.buildingSection.building',
            'tsbsr.buildingSection.section',
            'tsbsr.room',
        ]);

        return response()->json([
            'message' => 'Student track updated successfully',
            'student_track' => $studentTrack,
        ]);
    }

    /**
     * Remove the specified student track (soft delete).
     */
    public function destroy(StudentTrack $studentTrack): JsonResponse
    {
        $studentTrack->delete();

        return response()->json([
            'message' => 'Student track deleted successfully',
        ]);
    }

    /**
     * Get enrollment history for a specific student.
     */
    public function studentHistory(Student $student): JsonResponse
    {
        $tracks = $student->studentTracks()
            ->with([
                'tsbsr.trackStrand.track',
                'tsbsr.trackStrand.strand',
                'tsbsr.buildingSection.building',
                'tsbsr.buildingSection.section',
                'tsbsr.room',
            ])
            ->orderBy('school_year', 'desc')
            ->get();

        return response()->json([
            'student' => $student->load('info'),
            'enrollment_history' => $tracks,
        ]);
    }
}
