import { useEffect, useState } from "react";
import { Upload, Sparkles, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../index.css";

const API_URL = "https://ai-caption-generator-fpkt.onrender.com";

function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================
     IMAGE HANDLER
  ========================================= */

  const handleImage = (file) => {
    if (!file) {
      return;
    }

    // Check image type
    if (!file.type || !file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    // Remove old preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imagePreview = URL.createObjectURL(file);

    setImage(file);
    setPreview(imagePreview);

    // Reset old result
    setCaption("");
    setError("");
  };

  /* =========================================
     FILE INPUT
  ========================================= */

  const handleChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleImage(file);
    }

    // Reset input so same image can be selected again
    e.target.value = "";
  };

  /* =========================================
     CLEAN PREVIEW URL
  ========================================= */

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* =========================================
     GENERATE CAPTION
  ========================================= */

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

  /* =========================================
     CHANGE IMAGE
  ========================================= */

  const changeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
    setCaption("");
    setError("");
  };

  return (
    <div className="app">
      {/* ================= BACKGROUND ================= */}

      <div className="background">
        <span className="blob blob1"></span>
        <span className="blob blob2"></span>
        <span className="blob blob3"></span>

        <div className="stars"></div>
      </div>

      {/* ================= NAVBAR ================= */}

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

      {/* ================= HERO ================= */}

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

        {/* ================= UPLOAD BOX ================= */}

        <div className="upload-box">
          {preview ? (
            /* ================= PREVIEW ================= */

            <div className="preview-container">
              <img
                src={preview}
                alt="Selected image preview"
                className="selected-image"
              />

              <div className="preview-info">
                <ImageIcon size={20} />

                <span title={image?.name}>{image?.name}</span>
              </div>

              <button
                type="button"
                className="remove-btn"
                onClick={changeImage}
              >
                Change Image
              </button>
            </div>
          ) : (
            /* ================= UPLOAD ================= */

            <>
              <div className="upload-icon">
                <Upload size={30} />
              </div>

              <h3>Drop your image here</h3>

              <p>or browse from your computer</p>

              <label htmlFor="image-upload" className="browse-btn">
                <Upload size={18} />
                Browse Image
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleChange}
                  hidden
                />
              </label>

              <small>PNG, JPG or WEBP • Max 10MB</small>
            </>
          )}
        </div>

        {/* ================= ERROR ================= */}

        {error && <p className="caption-error">{error}</p>}

        {/* ================= GENERATE ================= */}

        <button
          type="button"
          className={`generate-btn ${!image || loading ? "disabled" : ""}`}
          disabled={!image || loading}
          onClick={generateCaption}
        >
          <Sparkles size={19} />

          {loading ? "Generating Caption..." : "Generate Caption"}
        </button>

        {/* ================= CAPTION ================= */}

        {caption && (
          <div className="caption-result">
            <div className="caption-result-title">
              <Sparkles size={18} />

              <span>AI Generated Caption</span>
            </div>

            <p>{caption}</p>

            <button
              type="button"
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
