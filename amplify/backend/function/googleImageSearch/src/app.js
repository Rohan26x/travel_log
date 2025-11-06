/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// --- NEW: Import axios, which we installed ---
const axios = require('axios');

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// --- THIS IS OUR SECURE MIDDLE-MAN ---

app.get('/images', async (req, res) => {
  // 1. Get the location from the query string (e.g., /images?location=Paris)
  const location = req.query.location;

  if (!location) {
    return res.status(400).json({ error: 'Missing "location" query parameter.' });
  }

  // 2. Securely get our secret keys from the environment
  const API_KEY = process.env.GOOGLE_API_KEY;
  const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!API_KEY || !SEARCH_ENGINE_ID) {
    return res.status(500).json({ error: 'API keys are not configured on the server.' });
  }

  // 3. Build the URL for the Google Custom Search API
  const googleApiUrl = `https://www.googleapis.com/customsearch/v1`;

  try {
    // 4. Call Google using axios
    const response = await axios.get(googleApiUrl, {
      params: {
        key: API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: `${location} travel landmark`, // Make the search query specific
        searchType: 'image', // We only want images
        num: 10, // Ask for 10 images
        safe: 'high', // Filter for safe images
      },
    });

    // 5. Format the results. Google sends a lot of junk.
    // We just want an array of image URLs.
    const images = response.data.items.map(item => ({
      url: item.link, // The full-size image URL
      thumbnailUrl: item.image.thumbnailLink, // The thumbnail URL
      source: item.image.contextLink, // The page the image came from
    }));

    // 6. Send the clean array of images back to our React app
    res.json({ images: images });

  } catch (err) {
    console.error("Google Search API error:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Failed to fetch images from Google.' });
  }
});

// (This is just boilerplate to make the function run on Lambda)
app.listen(3000, function() {
  console.log("App started");
});

module.exports = app;