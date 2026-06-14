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
        Schema::create('tsbsrs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('track_strand_id')->constrained('track_strands')->onDelete('cascade');
            $table->foreignId('building_section_id')->constrained('building_sections')->onDelete('cascade');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->timestamps();

            // Unique constraint: same combination cannot exist twice
            $table->unique(['track_strand_id', 'building_section_id', 'room_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tsbsrs');
    }
};
