/*
This is the "Image Proxy" function. Its job is to:
1. Receive a public URL from the React app (e.g., a Google Image URL).
2. Download the image at that URL.
3. Securely upload that image to the logged-in user's private S3 bucket.
4. Return the new, permanent S3 URL.
*/

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const axios = require('axios'); // For downloading the image
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); // AWS tool to talk to S3

// Initialize the S3 client
const s3 = new S3Client({ region: process.env.REGION });

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

// This is our new endpoint: POST /save-image
app.post('/save-image', async (req, res) => {

  // 1. Get the URL from the request and the user's ID
  const { imageUrl } = req.body;

  // This 'identityId' is the user's unique, secure folder name in S3.
  // Amplify provides it to us in the request context.
  const identityId = req.apiGateway.event.requestContext.identity.cognitoIdentityId;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing "imageUrl" in request body.' });
  }

  if (!identityId) {
    return res.status(401).json({ error: 'User is not authenticated.' });
  }

  try {
    // 2. Download the image from the public URL
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer' // Tell axios to download it as raw data
    });

    const imageData = response.data;
    const contentType = response.headers['content-type'];

    // 3. Prepare the upload to S3
    const bucketName = process.env.STORAGE_TRAVELLOGDB_BUCKETNAME; // Amplify gives us this
    // We'll give it a unique name based on the current time
    const fileKey = `private/${identityId}/${Date.now()}-google-image.jpg`;

    const s3Params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: imageData,
      ContentType: contentType || 'image/jpeg',
    };

    // 4. Upload the image data to S3
    await s3.send(new PutObjectCommand(s3Params));

    // 5. Return the new, permanent S3 URL
    const permanentS3Url = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;

    res.json({
      message: 'Image saved successfully!',
      newS3Url: permanentS3Url
    });

  } catch (err) {
    console.error("Error in image proxy:", err);
    res.status(500).json({ error: 'Failed to save image.' });
  }
});

app.listen(3000, function() {
  console.log("App started");
});

module.exports = app;