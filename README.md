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

# Sample request objects

A sample request object to create a new mood object

{
	"mood": "Happy",
	"id": "c8ea79a5-1c90-46ad-a0f5-0ad6af7df280",
	"note": "Good morning",
	"timestamp": "2019-01-28T00:34:20"
}

A sample request to update an existing mood object

{
	"id": "c8ea79a5-1c90-46ad-a0f5-0ad6af7df280",
	"note": "Ahh",
}