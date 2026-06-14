<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BuildingSection extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'building_id',
        'section_id',
    ];

    /**
     * Get the building for this building section.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    /**
     * Get the section for this building section.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get the TSBSRs for this building section.
     */
    public function tsbsrs(): HasMany
    {
        return $this->hasMany(Tsbsr::class);
    }

    /**
     * Get the display name (e.g., "Building A - Section 1")
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->building->name} - {$this->section->name}";
    }
}
