<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

use App\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Model::unguard();

        // $this->call(UserTableSeeder::class);

        DB::table('users')->delete();

        $users = array(
                ['name' => 'trungdn', 'email' => 'trungdn@gmail.com', 'password' => Hash::make('123456')],
                ['name' => 'anhpt', 'email' => 'anhpt@gmail.com', 'password' => Hash::make('123456')],
                ['name' => 'philv', 'email' => 'philv@gmail.com', 'password' => Hash::make('123456')],
        );
            
        // Loop through each user above and create the record for them in the database
        foreach ($users as $user)
        {
            User::create($user);
        }

        Model::reguard();
    }
}
