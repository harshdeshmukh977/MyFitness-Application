import { useNavigate } from "react-router-dom";
import "./BenefitsProfile.css";

function BenefitsProfile() {
  const navigate = useNavigate();

  const benefits = [
    {
      id: 1,
      type: "workout",
      title: "Personalized Workouts",
      description:
        "Workouts designed around your body, fitness level and goals.",
      color: "mint",
    },
    {
      id: 2,
      type: "results",
      title: "Better Results",
      description:
        "Smarter training plans to help you progress faster and safely.",
      color: "orange",
    },
    {
      id: 3,
      type: "nutrition",
      title: "Nutrition Guidance",
      description:
        "Simple nutrition guidance that fits your lifestyle and goals.",
      color: "mint",
    },
    {
      id: 4,
      type: "injury",
      title: "Injury Prevention",
      description:
        "Training recommendations designed to support safer movement.",
      color: "orange",
    },
  ];

  const handleBack = () => {
    navigate("/fitness-goal");
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  return (
    <div className="benefits-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="benefits-bg benefits-mint-bg"></div>
      <div className="benefits-bg benefits-orange-bg"></div>
      <div className="benefits-bg benefits-white-bg"></div>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="benefits-header">

        {/* BACK */}

        <button
          type="button"
          className="benefits-back"
          onClick={handleBack}
          aria-label="Go back"
        >
          ←
        </button>


        {/* BRAND */}

        <div className="benefits-brand">

          <img
            src="/myfitness-m-logo.png"
            alt="MyFitness"
            className="benefits-logo"
          />

          <div className="benefits-brand-text">

            <div className="benefits-brand-name">
              MY<span>FITNESS</span>
            </div>

            <div className="benefits-brand-subtitle">
              PERSONAL FITNESS
            </div>

          </div>

        </div>


        {/* PROGRESS */}

        <div className="benefits-progress">

          <div className="benefits-progress-top">

            <span>
              PROFILE SETUP
            </span>

            <strong>
              08 / 09
            </strong>

          </div>

          <div className="benefits-progress-track">

            <div className="benefits-progress-fill"></div>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="benefits-main">


        {/* =================================================
            HEADING
        ================================================= */}

        <section className="benefits-heading">

          <span className="benefits-eyebrow">
            YOUR PROFILE
          </span>

          <h1>
            Benefits of your <span>profile.</span>
          </h1>

          <p>
            Your information helps MyFitness create a
            <br />
            smarter fitness experience for you.
          </p>

        </section>


        {/* =================================================
            PROFILE READY CARD
        ================================================= */}

        <section className="benefits-ready-card">

          <div className="benefits-ready-icon">

            <div className="ready-circle">

              <svg
                viewBox="0 0 64 64"
                aria-hidden="true"
              >
                <path
                  d="M18 33L27 42L47 21"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

            </div>

          </div>


          <div className="benefits-ready-content">

            <span>
              PROFILE READY
            </span>

            <h2>
              Your fitness journey starts here.
            </h2>

            <p>
              We'll use your profile information to
              personalize your workouts and guidance.
            </p>

          </div>


          <div className="benefits-ready-badge">
            ✓ READY
          </div>

        </section>


        {/* =================================================
            BENEFITS TITLE
        ================================================= */}

        <div className="benefits-section-title">

          <div>
            <span>
              WHAT YOU GET
            </span>

            <h2>
              Built around you.
            </h2>
          </div>

          <div className="benefits-count">
            04
          </div>

        </div>


        {/* =================================================
            BENEFIT CARDS
        ================================================= */}

        <section className="benefits-list">

          {benefits.map((benefit) => (

            <article
              className="benefit-card"
              key={benefit.id}
            >

              {/* ICON */}

              <div
                className={`benefit-icon ${benefit.color}`}
              >

                {benefit.type === "workout" && (

                  <svg
                    viewBox="0 0 64 64"
                    className="benefit-svg"
                  >

                    <rect
                      x="7"
                      y="27"
                      width="9"
                      height="10"
                      rx="3"
                    />

                    <rect
                      x="17"
                      y="20"
                      width="8"
                      height="24"
                      rx="3"
                    />

                    <rect
                      x="25"
                      y="28"
                      width="14"
                      height="8"
                      rx="3"
                    />

                    <rect
                      x="39"
                      y="20"
                      width="8"
                      height="24"
                      rx="3"
                    />

                    <rect
                      x="48"
                      y="27"
                      width="9"
                      height="10"
                      rx="3"
                    />

                  </svg>

                )}


                {benefit.type === "results" && (

                  <svg
                    viewBox="0 0 64 64"
                    className="benefit-svg"
                  >

                    <polyline
                      points="9,46 9,31 21,35 33,23 43,29 55,14"
                      fill="none"
                    />

                    <polyline
                      points="45,14 55,14 53,24"
                      fill="none"
                    />

                    <line
                      x1="9"
                      y1="50"
                      x2="55"
                      y2="50"
                    />

                  </svg>

                )}


                {benefit.type === "nutrition" && (

                  <svg
                    viewBox="0 0 64 64"
                    className="benefit-svg"
                  >

                    <path
                      d="M11 31H53V36C53 48 45 55 32 55C19 55 11 48 11 36V31Z"
                      fill="none"
                    />

                    <path
                      d="M20 31C21 23 26 18 32 18C39 18 44 23 45 31"
                      fill="none"
                    />

                    <path
                      d="M32 18C30 11 34 7 40 5"
                      fill="none"
                    />

                    <path
                      d="M39 12C45 11 50 14 51 20"
                      fill="none"
                    />

                  </svg>

                )}


                {benefit.type === "injury" && (

                  <svg
                    viewBox="0 0 64 64"
                    className="benefit-svg"
                  >

                    <path
                      d="M32 7L53 15V29C53 42 45 52 32 57C19 52 11 42 11 29V15L32 7Z"
                      fill="none"
                    />

                    <line
                      x1="32"
                      y1="20"
                      x2="32"
                      y2="37"
                    />

                    <circle
                      cx="32"
                      cy="44"
                      r="2"
                      fill="currentColor"
                      stroke="none"
                    />

                  </svg>

                )}

              </div>


              {/* CARD TEXT */}

              <div className="benefit-text">

                <span className="benefit-number">
                  0{benefit.id}
                </span>

                <h3>
                  {benefit.title}
                </h3>

                <p>
                  {benefit.description}
                </p>

              </div>


              {/* ARROW */}

              <div className="benefit-arrow">
                →
              </div>

            </article>

          ))}

        </section>


        {/* =================================================
            PERSONALIZATION MESSAGE
        ================================================= */}

        <section className="benefits-message">

          <div className="benefits-message-symbol">
            ✦
          </div>

          <div className="benefits-message-content">

            <span>
              PERSONALIZED FOR YOU
            </span>

            <h3>
              You stay in control.
            </h3>

            <p>
              Your goals can change anytime.
              MyFitness will adapt with you.
            </p>

          </div>

          <div className="benefits-message-check">
            ✓
          </div>

        </section>


        {/* =================================================
            CONTINUE
        ================================================= */}

        <button
          type="button"
          className="benefits-continue"
          onClick={handleContinue}
        >

          <div className="benefits-continue-text">

            <span>
              NEXT STEP
            </span>

            <strong>
              Continue to Dashboard
            </strong>

          </div>

          <div className="benefits-continue-arrow">
            →
          </div>

        </button>


        {/* NOTE */}

        <p className="benefits-note">
          You can update your profile anytime from your dashboard.
        </p>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="benefits-footer">

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
          08 / 09
        </strong>

      </footer>

    </div>
  );
}

export default BenefitsProfile;