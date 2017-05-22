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
                ['name' => 'trungdn', 'email' => 'trungdn@gmail.com', 'password' => Hash::make('123456'), 'p_photo' => 'http://lorempixel.com/400/200', 'online' => 'Y', 'timestamp' => 1495384616],
                ['name' => 'trungcheng', 'email' => 'trungcheng@gmail.com', 'password' => Hash::make('123456'), 'p_photo' => 'http://lorempixel.com/400/200', 'online' => 'Y', 'timestamp' => 1495389998],
                ['name' => 'trungji', 'email' => 'trungji@gmail.com', 'password' => Hash::make('123456'), 'p_photo' => 'http://lorempixel.com/400/200', 'online' => 'Y', 'timestamp' => 1495384345],
        );
            
        // Loop through each user above and create the record for them in the database
        foreach ($users as $user)
        {
            User::create($user);
        }

        Model::reguard();
    }
}
