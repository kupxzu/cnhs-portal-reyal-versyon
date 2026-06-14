<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Building extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the building sections for this building.
     */
    public function buildingSections(): HasMany
    {
        return $this->hasMany(BuildingSection::class);
    }

    /**
     * Get the rooms for this building.
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    /**
     * Get the sections through building sections.
     */
    public function sections()
    {
        return $this->belongsToMany(Section::class, 'building_sections')
            ->withTimestamps();
    }
}
