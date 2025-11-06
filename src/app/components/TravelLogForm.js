'use client';

import { useState, useEffect } from 'react';
import './Form.css'; // Your big CSS file
import { get } from 'aws-amplify/api'; // To call your REST API

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
  
  // State for file management
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  
  // State for location detection
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // --- NEW: State for image suggestions ---
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Constants for UI elements
  const funEmojis = ['😭', '😔', '😐', '🙂', '🤩'];
  const weatherEmojis = [
    '☀️ Sunny', '☁️ Cloudy', '🌧️ Rainy', '❄️ Snowy',
    '⚡ Thunder', '💨 Windy', '🌫️ Foggy'
  ];

  // This 'useEffect' pre-fills the form for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        location: initialData.location || '',
        whatYouDidThere: initialData.whatYouDidThere || '',
        overallExperience: initialData.overallExperience || '',
        place: initialData.place || '',
        regionSpeciality: initialData.regionSpeciality || '',
        funLevel: initialData.funLevel || 3,
        weather: initialData.weather ? initialData.weather.split(', ') : [],
      });
      setExistingImageUrls(initialData.imageUrls || []);
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

  // Handles NEW file selection
  const handleFileChange = (e) => {
    setNewImageFiles(Array.from(e.target.files));
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

  // A function to remove an *existing* image
  const handleRemoveExistingImage = (imageUrlToRemove) => {
    setExistingImageUrls(
      existingImageUrls.filter(url => url !== imageUrlToRemove)
    );
  };

  // Function to auto-detect location
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

  // --- NEW: Function to get Google Image suggestions ---
  const handleSuggestImages = async () => {
    if (!formData.location) {
      alert("Please enter a location first.");
      return;
    }
    
    setIsSuggesting(true);
    setSuggestedImages([]); // Clear old results
    
    try {
      // This calls your 'googleImageSearch' REST API
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
  
  // This is the local submit handler
  const onFormSubmit = (e) => {
    e.preventDefault();
    // Pass all the data up to the parent
    handleSubmit(formData, newImageFiles, existingImageUrls);
  };

  // --- RENDER THE FORM ---
  return (
    <main className="form-container">      
      <form onSubmit={onFormSubmit}>
        {/* Location group with new button */}
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

        {/* Logic to display existing images */}
        {existingImageUrls.length > 0 && (
          <div className="form-group">
            <label>Existing Images:</label>
            <div className="existing-images-container">
              {existingImageUrls.map((url) => (
                <div key={url} className="existing-image-item">
                  <img src={url} alt="Uploaded log" />
                  <button type="button" onClick={() => handleRemoveExistingImage(url)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="images">Upload New Images:</label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleFileChange}
            multiple
            accept="image/*"
          />
        </div>

        {/* --- NEW: Image Suggestion Section --- */}
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

        {/* Custom Fun Level Slider */}
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

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Log'}
        </button>
      </form>
    </main>
  );
}