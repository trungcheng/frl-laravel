#!/bin/bash
#run api server
cd api

(>&2 echo "Laravel API Server ! Only use like API Host !")

php artisan serve
#run node server
cd ../server

(>&2 echo "Nodejs Server ! Please go to http://localhost:1337 to run !")

nodemon server.js
