<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrackStrand extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'track_id',
        'strand_id',
        'grade_level',
    ];

    /**
     * Get the track for this track strand.
     */
    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class);
    }

    /**
     * Get the strand for this track strand.
     */
    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class);
    }

    /**
     * Get the TSBSRs for this track strand.
     */
    public function tsbsrs(): HasMany
    {
        return $this->hasMany(Tsbsr::class);
    }

    /**
     * Get the display name (e.g., "Academic - STEM Grade 11")
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->track->name} - {$this->strand->name} Grade {$this->grade_level}";
    }
}
