import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSummary.css";

function ProfileSummary() {
  const navigate = useNavigate();

  const [bodyMetrics, setBodyMetrics] = useState(null);

  // ----------------------------------------
  // LOAD BODY METRICS FROM BACKEND
  // ----------------------------------------

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("User ID not found");
      return;
    }

    fetch(`http://localhost:8080/api/body-metrics/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch body metrics");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Profile Summary Body Metrics:", data);
        setBodyMetrics(data);
      })
      .catch((error) => {
        console.error(
          "Profile Summary Body Metrics error:",
          error
        );
      });
  }, []);

  // ----------------------------------------
  // BODY METRICS
  // ----------------------------------------

  const age = Number(bodyMetrics?.age) || 21;
  const height = Number(bodyMetrics?.height) || 175;
  const weight = Number(bodyMetrics?.weight) || 70;

  // ----------------------------------------
  // GENDER
  // ----------------------------------------

  const savedGender =
  localStorage.getItem("gender") ||
  localStorage.getItem("userGender") ||
  localStorage.getItem("selectedGender") ||
  "";

const genderMap = {
  male: "Male",
  female: "Female",
  other: "Prefer not to say",
};

const gender = genderMap[savedGender] || "Male";
  return (
    <div className="summary-page">

      {/* Background */}
      <div className="summary-mint-glow" />
      <div className="summary-orange-glow" />

      {/* Header */}
      <header className="summary-header">

        <button
          className="summary-back"
          onClick={() => navigate("/gender-card")}
        >
          ←
        </button>

        <div className="summary-brand">
          <span>MYFITNESS</span>
          <strong>Profile Summary</strong>
        </div>

        <div className="summary-step">
          <small>STEP</small>
          <strong>05</strong>
          <span>/ 09</span>
        </div>

      </header>


      {/* Progress */}
      <div className="summary-progress">

        <div className="summary-progress-line">
          <span />
        </div>

        <div className="summary-progress-labels">
          <span>Body</span>
          <strong>Profile</strong>
          <span>Goal</span>
        </div>

      </div>


      {/* Hero */}
      <section className="summary-hero">

        <span className="summary-eyebrow">
          YOUR PROFILE
        </span>

        <h1>
          Almost
          <em>ready.</em>
        </h1>

        <p>
          Everything looks good. Here's a quick
          look at your personalized body profile.
        </p>

      </section>


      {/* Main Card */}
      <main className="summary-card">

        {/* Decorative circles */}
        <div className="card-decoration mint-decoration" />
        <div className="card-decoration orange-decoration" />


        {/* Profile Visual */}
        <div className="summary-visual">

          <div className="summary-ring ring-one" />
          <div className="summary-ring ring-two" />

          <div className="summary-avatar">

            <div className="avatar-head" />

            <div className="avatar-body" />

          </div>


          {/* Ready */}
          <div className="ready-badge">

            <span>✓</span>

            READY

          </div>

        </div>


        {/* Profile Name */}
        <div className="profile-title">

          <span>
            YOUR PROFILE
          </span>

          <h2>
            {gender} Profile
          </h2>

          <p>
            Your basic information is ready.
          </p>

        </div>


        {/* Details */}
        <div className="profile-details">


          {/* Age */}
          <div className="detail-row">

            <div className="detail-icon mint">

              <span>{age}</span>

            </div>

            <div className="detail-text">

              <strong>Age</strong>

              <small>
                Current age
              </small>

            </div>

            <div className="detail-value">

              {age}

              <small>
                years
              </small>

            </div>

          </div>


          {/* Height */}
          <div className="detail-row">

            <div className="detail-icon orange">

              <span>↕</span>

            </div>

            <div className="detail-text">

              <strong>Height</strong>

              <small>
                Body height
              </small>

            </div>

            <div className="detail-value">

              {height}

              <small>
                cm
              </small>

            </div>

          </div>


          {/* Weight */}
          <div className="detail-row">

            <div className="detail-icon mint">

              <span>kg</span>

            </div>

            <div className="detail-text">

              <strong>Weight</strong>

              <small>
                Current weight
              </small>

            </div>

            <div className="detail-value">

              {weight}

              <small>
                kg
              </small>

            </div>

          </div>


          {/* Gender */}
          <div className="detail-row">

            <div className="detail-icon orange">

              <span>♀♂</span>

            </div>

            <div className="detail-text">

              <strong>Gender</strong>

              <small>
                Selected profile
              </small>

            </div>

            <div className="detail-value gender-value">

              {gender}

            </div>

          </div>

        </div>


        {/* Message */}
        <div className="summary-message">

          <div className="message-symbol">
            ✦
          </div>

          <div>

            <strong>
              Looking good
            </strong>

            <p>
              Your profile is ready.
              Next, see what's waiting for you.
            </p>

          </div>

        </div>


        {/* Continue */}
        <button
          className="summary-continue"
          onClick={() => navigate("/what-next")}
        >

          <span>
            Continue
          </span>

          <div>
            →
          </div>

        </button>

      </main>


      {/* Footer */}
      <footer className="summary-footer">

        <span>
          MYFITNESS
        </span>

        <div>
          TRAIN SMARTER
          <i />
          MOVE STRONGER
        </div>

        <strong>
          05 / 09
        </strong>

      </footer>

    </div>
  );
}

export default ProfileSummary;