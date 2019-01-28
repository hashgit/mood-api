# Mood API

This is a REST api project written in Javascript ES6. It exposes the following API endpoints.
- Get all (query by start and end date)
- Get a single mood
- Insert a new mood
- Update an existing mood

# Dependencies

The app requires MongoDB to store mood objects.

# Environment Variables

Please make sure you have a '.env' file in the root directory before starting the node server.
The only required environment variable is MONGODB_URI. You can set it in the .env file as follows:

MONGODB_URI=<your mongodb uri>

Other variables are PORT, MOOD_COLLECTION and LOG_LEVELS but they are optional to set and have
a default value.

# Setup

After you have the .env file all you need to do is,

npm install
npm run test
npm run start

Your API will be up and running at http://<YOUR SERVER NAME>/api/mood and will have the three
GET, POST AND PUT operations available.

# Deployed URL

The application is deployed at a free heroku account https://calm-sands-83848.herokuapp.com/.
I initially intended to deploy on AWS lambda as I am more used to but I ran out of free option
and heroku was way easier to setup and deploy. That is why you may find AWS lambda libraries in
the git history which have been removed.

# Sample request objects

A sample request object to create a new mood object

POST /api/mood
{
	"mood": "Happy",
	"id": "c8ea79a5-1c90-46ad-a0f5-0ad6af7df280",
	"note": "Good morning",
	"timestamp": "2019-01-28T00:34:20"
}

A sample request to update an existing mood object

PUT /api/mood
{
	"id": "c8ea79a5-1c90-46ad-a0f5-0ad6af7df280",
	"note": "Ahh",
}

A list of all mood objects can be obtained using the REST API

GET /api/mood?startDate={yyyy-mm-ddThh:mi:ss}&endDate={yyyy-mm-ddThh:mi:ss}

where start date and end date are optional arguments.

A single mood object is retrieved using the URL

GET /api/mood/{uuid}

# design considerations

The application has been designed using express js package with a single mood controller
as the request handler. Express js is the most popular node js MVC implementation.
All handling is performed inside the mood-service.js and controller only acts as a
request forwarder. The service makes use of the mood-repository to persist and retrieve
the mood objects. The service is completely agnostic to storage and a second mock
storage is provided as well.

A single connection to the database could be considered for optimal behavior but in this
application there isn't going to be many requests individually let alone simultaneously.

All the application layers e.g. service, data-layer etc. use dependency injection for
reusability and unit testing.

# Database

The application stores all data in Mongodb is required in the test to use a nosql database.
The only reason to chose mongo is that heroku provides a free instance of it.

The timestamp property is not indexed in mongodb hence the start date and end date filter
is not the most efficient one. A simple index can be added using the statement if
required.

db.collection(COLLECTION_NAME).create_index({ timestamp: 1 });

# tests

The service and repo layer has been thoroughly tested in the provided unit tests. The
code coverage report has been provided as well using istanbul. I have not written any
unit tests for the controller and API because they are boilerplate code only which has been
tested already. This code is often repeated and unit testing of controllers will be over kill
every time. Code coverage apart from controller stands at 85%.

# NPM packages

The application does not use any special NPM packages other than what is absolutely required.
The development environment uses babel for ES6 and mocha/chai/sinon/nyc for unit testing.
The lint package uses airbnb which I am more comfortable with.

The runtime uses babel packages for runtime, joi for object validation and momentjs for easy
data formatting and conversions. lodash is only added for the mock storage implementation.
