<?php

namespace Database\Seeders;

use App\Models\Track;
use Illuminate\Database\Seeder;

class TrackSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tracks = [
            'Academic',
            'TVL',
            'Arts and Design',
            'Sports',
        ];

        foreach ($tracks as $track) {
            Track::firstOrCreate(['name' => $track]);
        }
    }
}
