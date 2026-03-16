<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'Admin')->first();

        if (!$adminRole) {
            $this->command->error('Admin role not found. Please run RolePermissionSeeder first.');
            return;
        }

        $admin = User::firstOrCreate(
            ['email' => 'shaileshdhandhukiya012@gmail.com'],
            [
                'name' => 'Shailesh Dhandhukiya',
                'phone' => '+917265047893',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );

        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        $this->command->info('Shailesh Dhandhukiya created successfully!');
        $this->command->info('Email: shaileshdhandhukiya012@gmail.com');
        $this->command->info('Password: 123456789');
    }
}
