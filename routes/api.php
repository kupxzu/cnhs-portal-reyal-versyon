<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\BuildingController;
use App\Http\Controllers\Api\BuildingSectionController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\StrandController;
use App\Http\Controllers\Api\StudentAuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentInfoController;
use App\Http\Controllers\Api\StudentTrackController;
use App\Http\Controllers\Api\TrackController;
use App\Http\Controllers\Api\TrackStrandController;
use App\Http\Controllers\Api\TsbsrController;
use App\Http\Controllers\Api\UserAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - SHS Portal
|--------------------------------------------------------------------------
*/

// ==========================================================================
// PUBLIC ROUTES (No authentication required)
// ==========================================================================

// Admin Authentication
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
});

// User (Registrar/Teacher) Authentication
Route::prefix('user')->group(function () {
    Route::post('/login', [UserAuthController::class, 'login']);
    Route::post('/register', [UserAuthController::class, 'register']);
});

// Student Authentication
Route::prefix('student')->group(function () {
    Route::post('/login', [StudentAuthController::class, 'login']);
    Route::post('/register', [StudentAuthController::class, 'register']);
});

// Public data (read-only) - for dropdowns, etc.
Route::prefix('public')->group(function () {
    Route::get('/tracks', [TrackController::class, 'index']);
    Route::get('/strands', [StrandController::class, 'index']);
    Route::get('/track-strands', [TrackStrandController::class, 'index']);
});

// ==========================================================================
// ADMIN PROTECTED ROUTES
// ==========================================================================

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    // Admin profile & logout
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/profile', [AdminAuthController::class, 'profile']);

    // Tracks CRUD
    Route::apiResource('tracks', TrackController::class);

    // Strands CRUD
    Route::apiResource('strands', StrandController::class);

    // Buildings CRUD
    Route::apiResource('buildings', BuildingController::class);

    // Sections CRUD
    Route::apiResource('sections', SectionController::class);

    // Rooms CRUD
    Route::apiResource('rooms', RoomController::class);

    // Track-Strands CRUD
    Route::apiResource('track-strands', TrackStrandController::class);

    // Building-Sections CRUD
    Route::apiResource('building-sections', BuildingSectionController::class);

    // TSBSRs CRUD
    Route::apiResource('tsbsrs', TsbsrController::class);

    // Students management
    Route::apiResource('students', StudentController::class);
    Route::post('/students/{id}/restore', [StudentController::class, 'restore']);

    // Student Info management
    Route::get('/students/{student}/info', [StudentInfoController::class, 'show']);
    Route::post('/students/{student}/info', [StudentInfoController::class, 'store']);
    Route::put('/students/{student}/info', [StudentInfoController::class, 'update']);

    // Student Tracks (Enrollment) management
    Route::apiResource('student-tracks', StudentTrackController::class);
    Route::get('/students/{student}/enrollment-history', [StudentTrackController::class, 'studentHistory']);
});

// ==========================================================================
// USER (REGISTRAR/TEACHER) PROTECTED ROUTES
// ==========================================================================

Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    // User profile & logout
    Route::post('/logout', [UserAuthController::class, 'logout']);
    Route::get('/profile', [UserAuthController::class, 'profile']);
});

// Registrar routes - can manage students and enrollments
Route::middleware('auth:sanctum')->prefix('registrar')->group(function () {
    // View reference data
    Route::get('/tracks', [TrackController::class, 'index']);
    Route::get('/strands', [StrandController::class, 'index']);
    Route::get('/buildings', [BuildingController::class, 'index']);
    Route::get('/sections', [SectionController::class, 'index']);
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/track-strands', [TrackStrandController::class, 'index']);
    Route::get('/building-sections', [BuildingSectionController::class, 'index']);
    Route::get('/tsbsrs', [TsbsrController::class, 'index']);

    // Students management
    Route::apiResource('students', StudentController::class);

    // Student Info management
    Route::get('/students/{student}/info', [StudentInfoController::class, 'show']);
    Route::post('/students/{student}/info', [StudentInfoController::class, 'store']);
    Route::put('/students/{student}/info', [StudentInfoController::class, 'update']);

    // Student Tracks (Enrollment) management
    Route::apiResource('student-tracks', StudentTrackController::class);
    Route::get('/students/{student}/enrollment-history', [StudentTrackController::class, 'studentHistory']);
});

// Teacher routes - read-only access to students
Route::middleware('auth:sanctum')->prefix('teacher')->group(function () {
    // View reference data
    Route::get('/tracks', [TrackController::class, 'index']);
    Route::get('/strands', [StrandController::class, 'index']);
    Route::get('/track-strands', [TrackStrandController::class, 'index']);
    Route::get('/tsbsrs', [TsbsrController::class, 'index']);

    // View students
    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/{student}', [StudentController::class, 'show']);
    Route::get('/students/{student}/info', [StudentInfoController::class, 'show']);

    // View enrollments
    Route::get('/student-tracks', [StudentTrackController::class, 'index']);
});

// ==========================================================================
// STUDENT PROTECTED ROUTES
// ==========================================================================

Route::middleware('auth:sanctum')->prefix('student')->group(function () {
    // Student profile & logout
    Route::post('/logout', [StudentAuthController::class, 'logout']);
    Route::get('/profile', [StudentAuthController::class, 'profile']);

    // View own info
    Route::get('/my-info', function () {
        $student = request()->user();
        return response()->json([
            'student' => $student->load('info'),
        ]);
    });

    // Update own info (registration and profile update)
    Route::put('/my-info', function () {
        $student = request()->user();
        $validated = request()->validate([
            'last_name' => 'nullable|string|max:100',
            'first_name' => 'nullable|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'address' => 'nullable|string',
            'phone_number' => 'nullable|string|max:20',
            'nationality' => 'nullable|string|max:100',
            'lrn' => 'nullable|string|max:20',
            'previous_school' => 'nullable|string|max:255',
            'previous_school_address' => 'nullable|string',
            'father_name' => 'nullable|string|max:200',
            'father_phone' => 'nullable|string|max:20',
            'mother_name' => 'nullable|string|max:200',
            'mother_phone' => 'nullable|string|max:20',
            'guardian_name' => 'nullable|string|max:200',
            'guardian_phone' => 'nullable|string|max:20',
            'emergency_contact_name' => 'nullable|string|max:200',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
        ]);

        // Filter out empty values
        $validated = array_filter($validated, fn($v) => $v !== null && $v !== '');

        if ($student->info) {
            $student->info->update($validated);
        } else {
            // Create new student info
            $student->info()->create($validated);
        }

        return response()->json([
            'message' => 'Info updated successfully',
            'student' => $student->load('info'),
        ]);
    });

    // View own enrollment history
    Route::get('/my-enrollments', function () {
        $student = request()->user();
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
            'enrollment_history' => $tracks,
        ]);
    });

    // View available track-strands for enrollment reference
    Route::get('/available-track-strands', [TrackStrandController::class, 'index']);

    // View available TSBSRs with capacity for enrollment
    Route::get('/available-tsbsrs', function () {
        $tsbsrs = \App\Models\Tsbsr::with([
            'trackStrand.track',
            'trackStrand.strand',
            'buildingSection.building',
            'buildingSection.section',
            'room',
        ])->get()->map(function ($tsbsr) {
            $enrollmentCount = $tsbsr->studentTracks()
                ->where('school_year', '2026-2027')
                ->where('status', 'enrolled')
                ->count();
            $capacity = $tsbsr->room->capacity ?? 0;
            $tsbsr->enrollment_count = $enrollmentCount;
            $tsbsr->available_slots = max(0, $capacity - $enrollmentCount);
            $tsbsr->has_capacity = $enrollmentCount < $capacity;
            return $tsbsr;
        })->filter(function ($tsbsr) {
            return $tsbsr->has_capacity;
        })->values();

        return response()->json([
            'tsbsrs' => $tsbsrs,
        ]);
    });

    // Enroll self in a TSBSR
    Route::post('/enroll', function () {
        $student = request()->user();
        $validated = request()->validate([
            'tsbsr_id' => 'required|exists:tsbsrs,id',
            'school_year' => 'required|string',
        ]);

        // Check if already enrolled for this school year
        $existing = $student->studentTracks()
            ->where('school_year', $validated['school_year'])
            ->where('status', 'enrolled')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You are already enrolled for this school year.',
            ], 422);
        }

        // Check if TSBSR has capacity
        $tsbsr = \App\Models\Tsbsr::with('room')->findOrFail($validated['tsbsr_id']);
        $enrollmentCount = $tsbsr->studentTracks()
            ->where('school_year', $validated['school_year'])
            ->where('status', 'enrolled')
            ->count();
        $capacity = $tsbsr->room->capacity ?? 0;

        if ($enrollmentCount >= $capacity) {
            return response()->json([
                'message' => 'This track-strand section is already full.',
            ], 422);
        }

        // Create enrollment
        $studentTrack = $student->studentTracks()->create([
            'tsbsr_id' => $validated['tsbsr_id'],
            'school_year' => $validated['school_year'],
            'status' => 'enrolled',
        ]);

        $studentTrack->load([
            'tsbsr.trackStrand.track',
            'tsbsr.trackStrand.strand',
            'tsbsr.buildingSection.building',
            'tsbsr.buildingSection.section',
            'tsbsr.room',
        ]);

        return response()->json([
            'message' => 'Enrolled successfully!',
            'enrollment' => $studentTrack,
        ], 201);
    });
});
