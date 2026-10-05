import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Sparkles, Copy, Check } from "lucide-react";
import axios from "axios";

const API_URL = "https://ai-caption-generator-fpkt.onrender.com";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Fetch history
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/api/caption/history`);

      if (response.data.success) {
        setHistory(response.data.data);
      } else {
        setError("Failed to load history.");
      }
    } catch (err) {
      console.error("History Error:", err);

      setError(
        err.response?.data?.message || "Unable to load caption history.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Delete history
  const deleteHistory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this caption?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/caption/history/${id}`);

      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);

      alert(err.response?.data?.message || "Failed to delete history.");
    }
  };

  // Copy caption
  const copyCaption = async (caption, id) => {
    try {
      await navigator.clipboard.writeText(caption);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (error) {
      console.error("Copy Error:", error);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="app history-page">
      {/* Background */}
      <div className="background">
        <span className="blob blob1"></span>
        <span className="blob blob2"></span>
        <span className="blob blob3"></span>
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

      {/* History Content */}
      <section className="history-content">
        <div className="history-heading">
          <h1>Caption History</h1>

          <p>Your generated captions will appear here.</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="empty-history">Loading your captions...</div>
        )}

        {/* Error */}
        {!loading && error && <div className="empty-history">{error}</div>}

        {/* Empty */}
        {!loading && !error && history.length === 0 && (
          <div className="empty-history">No captions generated yet.</div>
        )}

        {/* History Cards */}
        {!loading && !error && history.length > 0 && (
          <div className="history-grid">
            {history.map((item) => (
              <article className="history-card" key={item.id}>
                {/* Image */}
                <div className="history-image">
                  <img
                    src={item.imageUrl}
                    alt={item.fileName || "Generated image"}
                  />
                </div>

                {/* Card Content */}
                <div className="history-card-content">
                  <div className="history-card-title">
                    <Sparkles size={17} />

                    <span>AI Generated Caption</span>
                  </div>

                  <p className="history-caption">{item.caption}</p>

                  <div className="history-date">
                    {formatDate(item.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="history-actions">
                    <button
                      className="copy-history-btn"
                      onClick={() => copyCaption(item.caption, item.id)}
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      className="delete-history-btn"
                      onClick={() => deleteHistory(item.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default History;
