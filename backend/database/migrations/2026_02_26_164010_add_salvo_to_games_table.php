<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->boolean('salvo_mode')->default(false)->after('time_limit');
            $table->boolean('salvo_turn_active')->default(false)->after('salvo_mode');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn(['salvo_mode', 'salvo_turn_active']);
        });
    }
};