import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfileImage() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleContinue = () => {
    navigate("/body-metrics");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e9fff7 0%, #ffffff 50%, #fff1e8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "100%",
          maxWidth: "1000px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "60px",
        }}
      >
        <button
          onClick={() => navigate("/setup")}
          style={{
            border: "none",
            background: "white",
            borderRadius: "12px",
            width: "45px",
            height: "45px",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          ←
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "900",
              letterSpacing: "2px",
            }}
          >
            MY<span style={{ color: "#18b889" }}>FITNESS</span>
          </div>

          <div
            style={{
              fontSize: "10px",
              letterSpacing: "3px",
              color: "#777",
              marginTop: "4px",
            }}
          >
            PERSONAL FITNESS
          </div>
        </div>

        <div
          style={{
            fontWeight: "700",
            color: "#333",
          }}
        >
          03 / 09
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          width: "100%",
          maxWidth: "600px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "800",
            letterSpacing: "3px",
            color: "#18b889",
            marginBottom: "15px",
          }}
        >
          YOUR PROFILE
        </div>

        <h1
          style={{
            fontSize: "42px",
            margin: "0 0 15px",
            color: "#171717",
          }}
        >
          Add your <span style={{ color: "#18b889" }}>profile photo</span>
        </h1>

        <p
          style={{
            color: "#666",
            lineHeight: "1.6",
            marginBottom: "40px",
          }}
        >
          Add a photo to personalize your fitness experience.
        </p>

        {/* Image area */}
        <div
          style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            margin: "0 auto 30px",
            background: "#ffffff",
            border: "5px solid #dff8ef",
            boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {image ? (
            <img
              src={image}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: "70px",
                color: "#18b889",
              }}
            >
              👤
            </div>
          )}
        </div>

        {/* Upload */}
        <label
          style={{
            display: "inline-block",
            padding: "14px 28px",
            background: "#18b889",
            color: "white",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "15px",
          }}
        >
          {image ? "Change Photo" : "Upload Photo"}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>

        <p
          style={{
            fontSize: "12px",
            color: "#888",
            marginBottom: "35px",
          }}
        >
          JPG, PNG or JPEG
        </p>

        {/* Continue */}
        <button
          onClick={handleContinue}
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "17px",
            border: "none",
            borderRadius: "14px",
            background: "#171717",
            color: "white",
            fontSize: "16px",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          Continue →
        </button>

        <p
          style={{
            fontSize: "12px",
            color: "#888",
            marginTop: "15px",
          }}
        >
          You can skip this and add a photo later.
        </p>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: "auto",
          paddingTop: "50px",
          color: "#777",
          fontSize: "11px",
          letterSpacing: "2px",
        }}
      >
        MYFITNESS • TRAIN SMARTER • MOVE STRONGER
      </footer>
    </div>
  );
}

export default ProfileImage;