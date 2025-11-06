'use client';

import { useState, useEffect } from 'react';
import './TravelLogForm.css'; // <-- 1. IMPORT THE NEW CSS
import { get, post } from 'aws-amplify/api'; 
import { getUrl } from 'aws-amplify/storage'; 

export default function TravelLogForm({ initialData, handleSubmit, isSubmitting }) {

  // (All component logic is identical, no changes)
  const [formData, setFormData] = useState({
    location: '',
    whatYouDidThere: '',
    overallExperience: '',
    place: '',
    regionSpeciality: '',
    funLevel: 3,
    weather: [],
  });
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]); 
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isDragging, setIsDragging] = useState(false); 
  const [savingImage, setSavingImage] = useState(null); 
  const funEmojis = [' 😭 ', ' 😔 ', ' 😐 ', ' 🙂 ', ' 🤩 '];
  const weatherEmojis = [
    ' ☀️  Sunny', ' ☁️  Cloudy', ' 🌧️  Rainy', ' ❄️  Snowy',
    ' ⚡  Thunder', ' 💨  Windy', ' 🌫️  Foggy'
  ];
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
      const fetchSignedUrls = async (permanentUrls) => {
        const signedImageObjects = await Promise.all(
          permanentUrls.map(async (permanentUrl) => {
            const fileKey = permanentUrl.split('.com/')[1];
            try {
              const signedUrlResult = await getUrl({
                key: fileKey,
                options: { validateObjectExistence: true },
              });
              return {
                permanentUrl: permanentUrl,
                signedUrl: signedUrlResult.url.href,
              };
            } catch (err) {
              console.error('Error signing URL:', err);
              return { permanentUrl: permanentUrl, signedUrl: null };
            }
          })
        );
        setExistingImages(signedImageObjects);
      };
      if (initialData.imageUrls && initialData.imageUrls.length > 0) {
        fetchSignedUrls(initialData.imageUrls);
      }
    }
  }, [initialData]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleFileChange = (files) => {
    setNewImageFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };
  const handleWeatherTagClick = (tag) => {
    setFormData((prevData) => {
      const newWeather = prevData.weather.includes(tag)
        ? prevData.weather.filter((t) => t !== tag) // Remove
        : [...prevData.weather, tag]; // Add
      return { ...prevData, weather: newWeather };
    });
  };
  const handleRemoveExistingImage = (permanentUrlToRemove) => {
    setExistingImages(
      existingImages.filter(img => img.permanentUrl !== permanentUrlToRemove)
    );
  };
  const handleRemoveNewImage = (fileNameToRemove) => {
    setNewImageFiles(
      newImageFiles.filter(file => file.name !== fileNameToRemove)
    );
  };
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
      },
      {
        enableHighAccuracy: true, 
        timeout: 10000,           
        maximumAge: 0             
      }
    );
  };
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
          queryParams: { location: formData.location }
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
  const handleSaveSuggestedImage = async (imageUrl) => {
    setSavingImage(imageUrl); 
    try {
      const restOperation = post({
        apiName: 'imageProxy',
        path: '/save-image',
        options: {
          body: { imageUrl: imageUrl } 
        }
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      if (data.newS3Url) {
        const fileKey = data.newS3Url.split('.com/')[1];
        const signedUrlResult = await getUrl({
          key: fileKey,
          options: { validateObjectExistence: true },
        });
        setExistingImages((prevImages) => [
          ...prevImages,
          {
            permanentUrl: data.newS3Url,
            signedUrl: signedUrlResult.url.href,
          },
        ]);
      }
    } catch (err) {
      console.error("Error saving suggested image:", err);
      alert("Failed to save image. It might be protected from downloads.");
    } finally {
      setSavingImage(null); 
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
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
      handleFileChange(files);
      e.dataTransfer.clearData();
    }
  };
  const onFormSubmit = (e) => {
    e.preventDefault();
    const finalExistingUrls = existingImages.map(img => img.permanentUrl);
    handleSubmit(formData, newImageFiles, finalExistingUrls);
  };

  // --- RENDER THE FORM ---
  // 2. Change the class name
  return (
    <main className="log-form-container"> 
      <form onSubmit={onFormSubmit}>

        {/* 3. Add IDs for grid styling */}
        <div className="form-group" id="form-group-location">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label htmlFor="location">Location:</label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="detect-location-btn" 
            >
              {isDetectingLocation ? 'Detecting...' : ' 📍  Detect My Location'}
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
        
        <div className="form-group" id="form-group-whatyou-did">
          <label htmlFor="whatYouDidThere">What you did there:</label>
          <textarea
            id="whatYouDidThere"
            name="whatYouDidThere"
            value={formData.whatYouDidThere}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group" id="form-group-experience">
          <label htmlFor="overallExperience">Overall Experience:</label>
          <textarea
            id="overallExperience"
            name="overallExperience"
            value={formData.overallExperience}
            onChange={handleChange}
            required
          />
        </div>

        {/* This block spans two columns */}
        {existingImages.length > 0 && (
          <div className="form-group" id="form-group-images">
            <label>Existing Images:</label>
            <div className="existing-images-container">
              {existingImages.map((image) => (
                <div key={image.permanentUrl} className="existing-image-item">
                  <img src={image.signedUrl || ''} alt="Uploaded log" />
                  <button type="button" onClick={() => handleRemoveExistingImage(image.permanentUrl)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* This block spans two columns */}
        <div className="form-group" id="form-group-images">
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
              onChange={(e) => handleFileChange(e.target.files)}
              multiple
              accept="image/*"
              className="drop-zone-input"
            />
          </div>

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

        {/* This block spans two columns */}
        <div className="form-group" id="form-group-suggestions">
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
                <div key={index} className="suggested-image-item">
                  <img
                    src={image.thumbnailUrl}
                    alt={`Suggested image ${index + 1}`}
                  />
                  <div className="suggested-image-overlay">
                    <a href={image.source} target="_blank" rel="noopener noreferrer" title="View Source">
                      🔗
                    </a>
                    <button
                      type="button"
                      title="Save this image to your log"
                      onClick={() => handleSaveSuggestedImage(image.url)}
                      disabled={savingImage === image.url}
                    >
                      {savingImage === image.url ? '...' : ' 💾 '}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* These fields will be in the two-column grid */}
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