### Frl Laravel (Angular 1.4 + Laravel 5.4 + SocketIO + MySQL)

An demo application prepare for freelance projects in the future.

## Make sure that you have installed all the packages in below:

** `Node.js` (https://nodejs.org/)
** `npm` (https://www.npmjs.com/)
** `nodemon` (npm install -g nodemon)
** `bower` (npm install -g bower)

## Clone or Download the repository

	```
	$ git clone https://github.com/trungcheng/frl-laravel.git chat
	$ cd chat
	```
## Install Dependencies

	```
	$ npm install

	# cd to /api folder:
	$ composer install
	$ cp .env.example .env
	$ php artisan key:generate
	$ php artisan migrate
	
	# cd to /client folder:
	$ bower install --allow-root
	```
## Running 

	```
	# cd to root folder
	$ ./dev.sh
	```