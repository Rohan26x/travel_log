'use client';

import { useState, useEffect } from 'react';
import './Form.css'; // Your big CSS file
import { get } from 'aws-amplify/api'; // To call your REST API
import { getUrl } from 'aws-amplify/storage'; // To get signed URLs for images

// This is a reusable component now. It's not a "page".
export default function TravelLogForm({ initialData, handleSubmit, isSubmitting }) {
  
  // State for form data
  const [formData, setFormData] = useState({
    location: '',
    whatYouDidThere: '',
    overallExperience: '',
    place: '',
    regionSpeciality: '',
    funLevel: 3,
    weather: [],
  });
  
  // --- MODIFIED: State for file management ---
  const [newImageFiles, setNewImageFiles] = useState([]);
  // This will now hold objects: { permanentUrl: '...', signedUrl: '...' }
  const [existingImages, setExistingImages] = useState([]); 
  
  // State for UI helpers
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // For drag-and-drop

  // Constants for UI elements
  const funEmojis = ['😭', '😔', '😐', '🙂', '🤩'];
  const weatherEmojis = [
    '☀️ Sunny', '☁️ Cloudy', '🌧️ Rainy', '❄️ Snowy',
    '⚡ Thunder', '💨 Windy', '🌫️ Foggy'
  ];

  // --- MODIFIED: This 'useEffect' now signs the URLs ---
  useEffect(() => {
    if (initialData) {
      // Pre-fill the text fields
      setFormData({
        location: initialData.location || '',
        whatYouDidThere: initialData.whatYouDidThere || '',
        overallExperience: initialData.overallExperience || '',
        place: initialData.place || '',
        regionSpeciality: initialData.regionSpeciality || '',
        funLevel: initialData.funLevel || 3,
        weather: initialData.weather ? initialData.weather.split(', ') : [],
      });

      // --- THIS IS THE BUG FIX ---
      // Take the permanent S3 URLs from the database and get temporary,
      // viewable (signed) URLs for them so they can be displayed in <img> tags.
      const fetchSignedUrls = async (permanentUrls) => {
        const signedImageObjects = await Promise.all(
          permanentUrls.map(async (permanentUrl) => {
            // Get the S3 key from the full URL
            const fileKey = permanentUrl.split('.com/')[1]; 
            try {
              // Fetch the secure, temporary URL
              const signedUrlResult = await getUrl({
                key: fileKey,
                options: { validateObjectExistence: true },
              });
              return {
                permanentUrl: permanentUrl,
                signedUrl: signedUrlResult.url.href, // This is the one we can use in <img src>
              };
            } catch (err) {
              console.error('Error signing URL:', err);
              // Return a broken link object so the user knows something is wrong
              return { permanentUrl: permanentUrl, signedUrl: null }; 
            }
          })
        );
        setExistingImages(signedImageObjects);
      };

      if (initialData.imageUrls && initialData.imageUrls.length > 0) {
        fetchSignedUrls(initialData.imageUrls);
      }
      // --- END BUG FIX ---
    }
  }, [initialData]);

  // Handles text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // --- MODIFIED: Now handles file list from drag-drop OR click ---
  const handleFileChange = (files) => {
    // Add new files to any existing files in the staging area
    setNewImageFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };

  // Handles clicking on weather tags
  const handleWeatherTagClick = (tag) => {
    setFormData((prevData) => {
      const newWeather = prevData.weather.includes(tag)
        ? prevData.weather.filter((t) => t !== tag) // Remove
        : [...prevData.weather, tag]; // Add
      return { ...prevData, weather: newWeather };
    });
  };

  // --- MODIFIED: Now filters based on permanentUrl ---
  const handleRemoveExistingImage = (permanentUrlToRemove) => {
    setExistingImages(
      existingImages.filter(img => img.permanentUrl !== permanentUrlToRemove)
    );
  };

  // --- NEW: Function to remove a *newly staged* image ---
  const handleRemoveNewImage = (fileNameToRemove) => {
    setNewImageFiles(
      newImageFiles.filter(file => file.name !== fileNameToRemove)
    );
  };

  // Function to auto-detect location (unchanged)
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsDetectingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) throw new Error("Failed to fetch location data.");
          const data = await response.json();
          const address = data.address;
          const locationString = [address.city, address.state, address.country]
            .filter(Boolean)
            .join(', ');
          setFormData((prevData) => ({
            ...prevData,
            location: locationString || data.display_name,
          }));
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          alert("Could not find address for your location.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.error("Geolocation failed:", err);
        alert("Unable to get your location. Please check browser permissions.");
        setIsDetectingLocation(false);
      }
    );
  };

  // Function to get Google Image suggestions (unchanged)
  const handleSuggestImages = async () => {
    if (!formData.location) {
      alert("Please enter a location first.");
      return;
    }
    setIsSuggesting(true);
    setSuggestedImages([]); 
    try {
      const restOperation = get({
        apiName: 'googleImageSearch',
        path: '/images',
        options: {
          queryParams: {
            location: formData.location
          }
        }
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      if (data.images) {
        setSuggestedImages(data.images);
      }
    } catch (err) {
      console.error("Error fetching image suggestions:", err);
      alert("Could not fetch image suggestions.");
    } finally {
      setIsSuggesting(false);
    }
  };
  
  // --- NEW: Drag-and-Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault(); // This is necessary to allow a drop
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files); // Use our existing file handler
      e.dataTransfer.clearData();
    }
  };

  // --- MODIFIED: Passes the correct list of permanent URLs ---
  const onFormSubmit = (e) => {
    e.preventDefault();
    // We only send the *permanent* URLs back, not the temporary signed ones
    const finalExistingUrls = existingImages.map(img => img.permanentUrl);
    handleSubmit(formData, newImageFiles, finalExistingUrls);
  };

  // --- RENDER THE FORM ---
  return (
    <main className="form-container">      
      <form onSubmit={onFormSubmit}>
        
        {/* Location group */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label htmlFor="location">Location:</label>
            <button 
              type="button" 
              onClick={handleDetectLocation} 
              disabled={isDetectingLocation}
              className="detect-location-btn"
            >
              {isDetectingLocation ? 'Detecting...' : '📍 Detect My Location'}
            </button>
          </div>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Paris, France"
            required
          />
        </div>

        {/* What You Did */}
        <div className="form-group">
          <label htmlFor="whatYouDidThere">What you did there:</label>
          <textarea
            id="whatYouDidThere"
            name="whatYouDidThere"
            value={formData.whatYouDidThere}
            onChange={handleChange}
            required
          />
        </div>

        {/* Overall Experience */}
        <div className="form-group">
          <label htmlFor="overallExperience">Overall Experience:</label>
          <textarea
            id="overallExperience"
            name="overallExperience"
            value={formData.overallExperience}
            onChange={handleChange}
            required
          />
        </div>

        {/* --- MODIFIED: Logic to display existing images --- */}
        {existingImages.length > 0 && (
          <div className="form-group">
            <label>Existing Images:</label>
            <div className="existing-images-container">
              {existingImages.map((image) => (
                <div key={image.permanentUrl} className="existing-image-item">
                  {/* Use the signedUrl for the src, which is now safe */}
                  <img src={image.signedUrl || ''} alt="Uploaded log" />
                  <button type="button" onClick={() => handleRemoveExistingImage(image.permanentUrl)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- NEW: Drag-and-Drop Upload Zone --- */}
        <div className="form-group">
          <label htmlFor="images">Upload New Images:</label>
          <div 
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p>Drag & drop files here, or click to select</p>
            <input
              type="file"
              id="images"
              name="images"
              // Use our handler for the click event
              onChange={(e) => handleFileChange(e.target.files)} 
              multiple
              accept="image/*"
              className="drop-zone-input" // This is hidden by CSS
            />
          </div>
          
          {/* --- NEW: Staging area for new images --- */}
          {newImageFiles.length > 0 && (
            <div className="new-images-container">
              <p>Files to upload:</p>
              {newImageFiles.map((file, index) => (
                <div key={index} className="new-image-item">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => handleRemoveNewImage(file.name)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Suggestion Section */}
        <div className="form-group">
          <label>Or, get inspiration:</label>
          <button 
            type="button" 
            onClick={handleSuggestImages} 
            disabled={isSuggesting || !formData.location}
            className="suggest-btn"
          >
            {isSuggesting ? 'Searching...' : 'Suggest Images Based on Location'}
          </button>
          
          {suggestedImages.length > 0 && (
            <div className="suggested-images-gallery">
              {suggestedImages.map((image, index) => (
                <a key={index} href={image.source} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={image.thumbnailUrl} 
                    alt={`Suggested image ${index + 1}`} 
                    title="Click to see original page"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Place */}
         <div className="form-group">
            <label htmlFor="place">Place (e.g., Cafe, Mall, Hill Station):</label>
            <input
              type="text"
              id="place"
              name="place"
              value={formData.place}
              onChange={handleChange}
            />
          </div>

        {/* Region Speciality */}
          <div className="form-group">
            <label htmlFor="regionSpeciality">Region Speciality (Food, Dress, etc.):</label>
            <input
              type="text"
              id="regionSpeciality"
              name="regionSpeciality"
              value={formData.regionSpeciality}
              onChange={handleChange}
            />
          </div>

        {/* Fun Level Slider */}
        <div className="form-group">
          <label htmlFor="funLevel" className="fun-label">
            Level of Fun: <span className="fun-emoji">{funEmojis[formData.funLevel - 1]}</span>
          </label>
          <div className="fun-slider-wrapper">
            <input
              type="range"
              id="funLevel"
              name="funLevel"
              min="1"
              max="5"
              value={formData.funLevel}
              onChange={handleChange}
              className="fun-slider"
            />
          </div>
        </div>

        {/* Weather Tags */}
        <div className="form-group">
          <label>Weather on the day:</label>
          <div className="weather-tags-container">
            {weatherEmojis.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`weather-tag ${formData.weather.includes(tag) ? 'selected' : ''}`}
                onClick={() => handleWeatherTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Log'}
        </button>
      </form>
    </main>
  );
}