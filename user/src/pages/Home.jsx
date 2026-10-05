import { useState } from "react";
import { Upload, Sparkles, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../index.css";

const API_URL = "http://localhost:5000";

function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // New states
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImage = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));

    // Reset previous result
    setCaption("");
    setError("");
  };

  const handleChange = (e) => {
    handleImage(e.target.files[0]);
  };

  // Generate Caption
  const generateCaption = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCaption("");

      const formData = new FormData();

      formData.append("image", image);

      const response = await axios.post(
        `${API_URL}/api/caption/generate`,
        formData,
      );

      if (response.data.success) {
        setCaption(response.data.data.caption);
      } else {
        setError(response.data.message || "Failed to generate caption.");
      }
    } catch (err) {
      console.error("Caption Error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Change Image
  const changeImage = () => {
    setImage(null);
    setPreview(null);
    setCaption("");
    setError("");
  };

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="background">
        <span className="blob blob1"></span>
        <span className="blob blob2"></span>
        <span className="blob blob3"></span>

        <div className="stars"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="logo">
          <Sparkles size={20} />
          CaptionAI
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/history">History</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="hero">
        <div className="badge">
          <Sparkles size={15} />
          AI Powered Caption Generator
        </div>

        <h1>
          Turn Your Images Into
          <span> Amazing Captions</span>
        </h1>

        <p className="subtitle">
          Upload an image and let AI create the perfect caption for your social
          media posts.
        </p>

        {/* Upload Box */}
        <div className="upload-box">
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" />

              <div className="preview-info">
                <ImageIcon size={20} />
                <span>{image?.name}</span>
              </div>

              <button className="remove-btn" onClick={changeImage}>
                Change Image
              </button>
            </div>
          ) : (
            <>
              <div className="upload-icon">
                <Upload size={30} />
              </div>

              <h3>Drop your image here</h3>

              <p>or browse from your computer</p>

              <label className="browse-btn">
                <Upload size={18} />
                Browse Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  hidden
                />
              </label>

              <small>PNG, JPG or WEBP • Max 10MB</small>
            </>
          )}
        </div>

        {/* Error */}
        {error && <p className="caption-error">{error}</p>}

        {/* Generate Button */}
        <button
          className={`generate-btn ${!image || loading ? "disabled" : ""}`}
          disabled={!image || loading}
          onClick={generateCaption}
        >
          <Sparkles size={19} />

          {loading ? "Generating Caption..." : "Generate Caption"}
        </button>

        {/* Generated Caption */}
        {caption && (
          <div className="caption-result">
            <div className="caption-result-title">
              <Sparkles size={18} />
              <span>AI Generated Caption</span>
            </div>

            <p>{caption}</p>

            <button
              className="copy-caption-btn"
              onClick={() => navigator.clipboard.writeText(caption)}
            >
              Copy Caption
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
