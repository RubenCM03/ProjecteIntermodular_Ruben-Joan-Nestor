<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name'     => 'Admin',
                'email'    => 'admin@admin.com',
                'password' => Hash::make('admin1234'),
                'role'     => UserRole::ADMIN,
            ]
        );

        $this->command->info('Admin creat correctament: admin@admin.com / admin1234');
    }
}