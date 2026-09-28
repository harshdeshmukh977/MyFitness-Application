import { useNavigate } from "react-router-dom";

import "./PersonalProfile.css";

function PersonalProfile() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/setup");
  };

  const handleContinue = () => {
    navigate("/body-metrics");
  };

  return (
    <div className="personal-profile-page">

      {/* Background decoration */}
      <div className="profile-bg profile-bg-mint"></div>
      <div className="profile-bg profile-bg-orange"></div>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="profile-header">

        {/* Back Button */}
        <button
          type="button"
          className="profile-back"
          onClick={handleBack}
          aria-label="Go back"
        >
          <span>←</span>
        </button>


        {/* Brand */}
    <div className="profile-brand">

  <div className="profile-logo">
    <img
      src="/myfitness-m-logo.png"
      alt="MyFitness"
    />
  </div>

  <div className="profile-brand-text">
    <strong>
      MY<span>FITNESS</span>
    </strong>

    <small>
      PERSONAL FITNESS
    </small>
  </div>

</div>

        {/* Progress */}
        <div className="profile-progress">

          <div className="progress-label">

            <span>
              PROFILE SETUP
            </span>

            <strong>
              02 / 09
            </strong>

          </div>

          <div className="progress-track">

            <div className="progress-fill"></div>

          </div>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="profile-main">

        {/* Intro */}
        <section className="profile-intro">

          <div className="intro-tag">

            <span></span>

            PERSONAL PROFILE

          </div>


          <h1>

            Let's make your

            <em>
              fitness personal.
            </em>

          </h1>


          <p>
            A few details about you help us build
            workouts and recommendations that fit
            your body and your goals.
          </p>

        </section>


        {/* =================================================
            PERSONAL PROFILE SECTION
        ================================================= */}

        <section className="gender-section">

          <div className="gender-heading">

            <div className="section-number orange-number">
              01
            </div>

            <div>

              <span>
                YOUR PROFILE
              </span>

              <h2>
                Tell us about yourself
              </h2>

              <p>
                Choose the option that best describes you.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            CONTINUE SECTION
        ================================================= */}

        <section className="profile-next">

          <div className="next-copy">

            <span>
              NEXT STEP
            </span>

            <strong>
              Enter your body metrics
            </strong>

            <small>
              Age • Height • Weight
            </small>

          </div>


          <button
            type="button"
            className="profile-continue"
            onClick={handleContinue}
          >

            <span>
              Continue
            </span>

            <div className="continue-arrow">
              →
            </div>

          </button>

        </section>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="profile-footer">

        <span>
          MYFITNESS
        </span>


        <div>

          <span>
            TRAIN SMARTER
          </span>

          <i></i>

          <span>
            MOVE STRONGER
          </span>

        </div>


        <strong>
          02 / 09
        </strong>

      </footer>

    </div>
  );
}

export default PersonalProfile;