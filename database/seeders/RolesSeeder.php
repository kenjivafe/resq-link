<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $roles = [
            ['name' => 'Admin', 'display_name' => 'Administrator', 'description' => 'Full access', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dispatcher', 'display_name' => 'Dispatcher', 'description' => 'Dispatch console access', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Responder', 'display_name' => 'Responder', 'description' => 'Mobile responder access', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(['name' => $role['name']], $role);
        }
    }
}
