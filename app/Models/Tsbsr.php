<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tsbsr extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tsbsrs';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'track_strand_id',
        'building_section_id',
        'room_id',
    ];

    /**
     * Get the track strand for this TSBSR.
     */
    public function trackStrand(): BelongsTo
    {
        return $this->belongsTo(TrackStrand::class);
    }

    /**
     * Get the building section for this TSBSR.
     */
    public function buildingSection(): BelongsTo
    {
        return $this->belongsTo(BuildingSection::class);
    }

    /**
     * Get the room for this TSBSR.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the student tracks for this TSBSR.
     */
    public function studentTracks(): HasMany
    {
        return $this->hasMany(StudentTrack::class);
    }

    /**
     * Get the full display name.
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->trackStrand->displayName} | {$this->buildingSection->displayName} | Room {$this->room->room_number}";
    }

    /**
     * Get the current enrollment count.
     */
    public function getEnrollmentCountAttribute(): int
    {
        return $this->studentTracks()
            ->where('status', 'enrolled')
            ->count();
    }

    /**
     * Check if the room has available capacity.
     */
    public function hasCapacity(): bool
    {
        return $this->enrollment_count < $this->room->capacity;
    }
}
