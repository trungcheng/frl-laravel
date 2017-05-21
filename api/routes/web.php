<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::group(['middleware' => 'cors', 'prefix' => 'api/v1'], function()
{
    Route::post('signup', 'AuthenticateController@signup');
    Route::post('authenticate', 'AuthenticateController@authenticate');
	Route::resource('message', 'MessageController', ['only' => ['index', 'store']]);
});
