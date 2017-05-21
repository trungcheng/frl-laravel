<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuthExceptions\JWTException;
use Response;
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
                return response()->json(['status' => false, 'message' => 'Invalid Information!'], 401);
            }
        } catch (JWTException $e) {
            // something went wrong
            return Response::json(['status' => false, 'message' => 'Could not create token!'], 500);
        }

        // if no errors are encountered we can return a JWT
        return Response::json(['token' => $token, 'status' => true, 'message' => 'Authenticate success!'], 200);
    }

    public function signup(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            $user = User::create($credentials);
        } catch (JWTException $e) {
            return Response::json(['status' => false, 'message' => 'User already exists!'], 500);
        }

        $token = JWTAuth::fromUser($user);

        return Response::json(['token' => $token, 'status' => true, 'message' => 'Register success!'], 200);
    }
}
