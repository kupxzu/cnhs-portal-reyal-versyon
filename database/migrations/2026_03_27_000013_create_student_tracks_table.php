<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_tracks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('tsbsr_id')->constrained('tsbsrs')->onDelete('cascade');
            $table->string('school_year'); // Format: "2026-2027"
            $table->enum('status', ['enrolled', 'dropped', 'graduated', 'transferred'])->default('enrolled');
            $table->timestamps();
            $table->softDeletes();

            // A student can only be enrolled in one TSBSR per school year
            $table->unique(['student_id', 'school_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_tracks');
    }
};
