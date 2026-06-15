<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StudentFactory extends Factory
{
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $lastName  = fake()->lastName();
        $username  = strtolower($firstName . '.' . $lastName) . fake()->numberBetween(1, 99);

        return [
            'id_number' => fake()->unique()->numerify('####-#####'),
            'email'     => strtolower($firstName . '.' . $lastName) . '@school.edu.ph',
            'username'  => $username,
            'password'  => bcrypt('password'), // default password para sa lahat
        ];
    }
}