import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GenderCard.css";

function GenderCard() {
  const navigate = useNavigate();

  const [gender, setGender] = useState("");

  const handleContinue = () => {
    if (!gender) return;

    // Save selected gender
    localStorage.setItem("gender", gender);

    // Also save with descriptive key
    localStorage.setItem("userGender", gender);

    console.log("Gender saved:", gender);

    navigate("/profile-summary");
  };

  return (
    <div className="gender-page">

      {/* ================= TOP HEADER ================= */}

      <header className="gender-navbar">

        {/* LEFT - MYFITNESS */}

        <div className="gender-brand">

          <img
            src="/myfitness-m-logo.png"
            alt="MyFitness"
            className="gender-logo"
          />

          <div className="gender-brand-text">

            <div className="gender-brand-name">
              MY<span>FITNESS</span>
            </div>

            <div className="gender-brand-subtitle">
              PERSONAL FITNESS
            </div>

          </div>

        </div>


        {/* RIGHT - SETUP PROGRESS */}

        <div className="gender-progress">

          <div className="gender-progress-top">

            <span>PROFILE SETUP</span>

            <strong>04 / 09</strong>

          </div>

          <div className="gender-progress-track">

            <div className="gender-progress-active"></div>

          </div>

        </div>

      </header>


      {/* ================= MAIN CONTENT ================= */}

      <main className="gender-content">

        <div className="gender-heading">

          <div className="gender-step">
            04
          </div>

          <div>

            <div className="gender-eyebrow">
              PERSONAL PROFILE
            </div>

            <h1>
              Tell us about yourself
            </h1>

            <p>
              This helps us personalize your fitness experience.
            </p>

          </div>

        </div>


        {/* ================= GENDER CARD ================= */}

        <section className="gender-section">

          <div className="gender-section-title">

            <span>STEP 04</span>

            <h2>
              What is your gender?
            </h2>

            <p>
              Select the option that best describes you.
            </p>

          </div>


          <div className="gender-options">

            {/* ================= MALE ================= */}

            <button
              type="button"
              className={`gender-card ${
                gender === "male" ? "selected" : ""
              }`}
              onClick={() => setGender("male")}
            >

              <div className="gender-card-number">
                01
              </div>

              <div className="gender-icon">
                ♂
              </div>

              <div className="gender-card-content">

                <h3>Male</h3>

                <p>
                  Personalize your fitness plan based on your profile.
                </p>

              </div>

              <div className="gender-check">
                {gender === "male" ? "✓" : "+"}
              </div>

            </button>


            {/* ================= FEMALE ================= */}

            <button
              type="button"
              className={`gender-card ${
                gender === "female" ? "selected" : ""
              }`}
              onClick={() => setGender("female")}
            >

              <div className="gender-card-number">
                02
              </div>

              <div className="gender-icon">
                ♀
              </div>

              <div className="gender-card-content">

                <h3>Female</h3>

                <p>
                  Personalize your fitness plan based on your profile.
                </p>

              </div>

              <div className="gender-check">
                {gender === "female" ? "✓" : "+"}
              </div>

            </button>


            {/* ================= PREFER NOT TO SAY ================= */}

            <button
              type="button"
              className={`gender-card ${
                gender === "other" ? "selected" : ""
              }`}
              onClick={() => setGender("other")}
            >

              <div className="gender-card-number">
                03
              </div>

              <div className="gender-icon">
                ○
              </div>

              <div className="gender-card-content">

                <h3>Prefer not to say</h3>

                <p>
                  You can skip this information if you prefer.
                </p>

              </div>

              <div className="gender-check">
                {gender === "other" ? "✓" : "+"}
              </div>

            </button>

          </div>

        </section>


        {/* ================= BOTTOM INFO ================= */}

        <div className="gender-info">

          <div className="gender-info-icon">
            ✦
          </div>

          <div>

            <strong>
              Why we ask for this
            </strong>

            <p>
              Your information helps MyFitness create a more
              personalized fitness experience for you.
            </p>

          </div>

        </div>


        {/* ================= NEXT STEP ================= */}

        <div className="gender-next">

          <div>

            <span>NEXT STEP</span>

            <h3>
              Benefits & preferences
            </h3>

            <p>
              Tell us what matters most to you.
            </p>

          </div>


          <button
            type="button"
            className={`gender-continue ${
              !gender ? "disabled" : ""
            }`}
            onClick={handleContinue}
            disabled={!gender}
          >

            <span>Continue</span>

            <div>→</div>

          </button>

        </div>

      </main>

    </div>
  );
}

export default GenderCard;