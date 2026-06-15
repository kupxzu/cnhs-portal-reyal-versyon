<?php

// use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
// use Illuminate\Support\Facades\Schema;

// return new class extends Migration
// {
//     /**
//      * Run the migrations.
//      */
//     public function up(): void
//     {
//         Schema::create('students', function (Blueprint $table) {
//             $table->id();
//             $table->string('id_number')->unique();
//             $table->string('email')->unique();
//             $table->string('username')->unique();
//             $table->string('password');
//             $table->rememberToken();
//             $table->timestamps();
//             $table->softDeletes();
//         });
//     }

//     /**
//      * Reverse the migrations.
//      */
//     public function down(): void
//     {
//         Schema::dropIfExists('students');
//     }
// };


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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('id_number')->unique()->index();  // ← index added
            $table->string('email')->unique()->index();      // ← index added
            $table->string('username')->unique()->index();   // ← index added
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes()->index();                  // ← index added (para mabilis ang soft delete queries)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};