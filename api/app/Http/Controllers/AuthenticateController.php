<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuthExceptions\JWTException;
use Response;
use Hash;
use App\User;

class AuthenticateController extends Controller
{
    /**
     * Return a JWT
     *
     * @return Response
     */
    public function authenticate(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            // verify the credentials and create a token for the user
            if (!$token = JWTAuth::attempt($credentials)) {
                return Response::json([
                    'status' => false, 
                    'message' => 'Invalid Information!'
                ]);
            }

            return Response::json([
                'token' => $token,
                'status' => true, 
                'message' => 'Authenticate success!'
            ]);
        } catch (JWTException $e) {
            // something went wrong
            return Response::json([
                'status' => false, 
                'message' => 'Could not create token!'
            ]);
        }

        // if no errors are encountered we can return a JWT
    }

    public function signup(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            $credentials['password'] = Hash::make($credentials['password']);
            $user = User::create($credentials);
            $token = JWTAuth::fromUser($user);

            return Response::json([
                'token' => $token, 
                'status' => true, 
                'message' => 'Register success!'
            ]);
        } catch (JWTException $e) {
            return Response::json([
                'status' => false, 
                'message' => 'User already exists!'
            ]);
        }
    }

    public function getUser(Request $request)
    {
        $data = $request->all();
        $user = JWTAuth::toUser($data['token']);
        
        return response()->json([
            'status' => true, 
            'member' => $user,
            'token' => $data['token']
        ]);
    }
}
