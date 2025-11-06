/*
This is the "Location Search" function. It now has two jobs:
1. Handle text search (e.g., /search?query=Paris)
2. Handle position search (e.g., /search?lat=48.8&lon=2.3)
*/
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// --- NEW: Import the 'SearchPlaceIndexForPositionCommand' ---
const { 
  LocationClient, 
  SearchPlaceIndexForTextCommand,
  SearchPlaceIndexForPositionCommand // <-- NEW
} = require('@aws-sdk/client-location');

// Initialize the Location client
const client = new LocationClient({ region: process.env.REGION });

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// --- MODIFIED: This endpoint is now a router ---
app.get('/search', async (req, res) => {
  
  // Get all possible query parameters
  const { query, lat, lon } = req.query;
  const placeIndex = process.env.GEO_TRAVELLOGPLACEINDEX_NAME;

  if (!placeIndex) {
    return res.status(500).json({ error: 'Place index is not configured on the server.' });
  }

  try {
    let command;
    let response;

    if (query) {
      // --- JOB 1: Handle Text Search (existing logic) ---
      command = new SearchPlaceIndexForTextCommand({
        IndexName: placeIndex,
        Text: query,
        MaxResults: 10,
      });
      response = await client.send(command);

    } else if (lat && lon) {
      // --- JOB 2: Handle Position Search (new logic) ---
      command = new SearchPlaceIndexForPositionCommand({
        IndexName: placeIndex,
        // Note: GeoJSON position is [Longitude, Latitude]
        Position: [parseFloat(lon), parseFloat(lat)], 
        MaxResults: 10,
        Language: 'en',
      });
      response = await client.send(command);

    } else {
      // No valid parameters
      return res.status(400).json({ error: 'Missing "query" or "lat/lon" parameters.' });
    }

    // Format the results (the response format is the same for both)
    const places = response.Results.map(item => ({
      placeId: item.Place.PlaceId,
      name: item.Place.Label, // The full name/label
      // Use Municipality, Region, or Country as a fallback for address
      address: item.Place.Municipality ? `${item.Place.Municipality}, ${item.Place.Region}` : `${item.Place.Region}, ${item.Place.Country}`,
      coordinates: item.Place.Geometry.Point,
    }));

    // Send the clean array back to our React app
    res.json({ places: places });

  } catch (err) {
    console.error("Amazon Location Service error:", err);
    res.status(500).json({ error: 'Failed to search for locations.' });
  }
});

app.listen(3000, function() {
  console.log("App started");
});
module.exports = app;