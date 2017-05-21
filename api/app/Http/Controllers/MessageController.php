<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuthExceptions\JWTException;
use Auth;
use Response;
use App\Message;

class MessageController extends Controller
{

     public function __construct()
    {
        // Ensure user loged in
        $this->middleware('jwt.auth');
    }
    /**
     * Display a listing of the message(s).
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $data = Message::all();
        //dd($messages);
        $success = true;
        return response()->json(['data' => $data, 'status' => $success]);
    }

    /**
     * Store the message.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //dd(\Auth::user());
        
        $message = new Message();
        $message->message  = $request->input('contents');
        $message->name = Auth::user()->name;
        $message->user_id = Auth::user()->id;
        $message->save();

        return response()->json(['status' => true, 'message' => 'Send message successfully'], 200);
    }

}
