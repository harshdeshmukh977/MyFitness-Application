import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

function Welcome() {

  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);


  /* ==================================================
     3 SECOND INITIALIZATION
     Progress bar + automatic Login navigation
  ================================================== */

  useEffect(() => {

    const duration = 3000;
    const startTime = Date.now();

    const interval = setInterval(() => {

      const elapsed = Date.now() - startTime;

      const currentProgress = Math.min(
        Math.floor((elapsed / duration) * 100),
        100
      );

      setProgress(currentProgress);

      if (currentProgress >= 100) {

        clearInterval(interval);

        /*
          Progress complete hone ke baad
          Login page open hoga.
        */

        navigate("/login");
      }

    }, 30);


    return () => {

      clearInterval(interval);

    };

  }, [navigate]);


  return (

    <div className="welcome-page">


      {/* ==================================================
          BACKGROUND IMAGE
      ================================================== */}

      <img
        className="welcome-bg-image"
        src="/fitness-hero.jpg"
        alt="Athlete training in gym"
      />


      {/* ==================================================
          DARK OVERLAYS
      ================================================== */}

      <div className="overlay-base"></div>

      <div className="overlay-left"></div>

      <div className="overlay-bottom"></div>

      <div className="overlay-vignette"></div>


      {/* ==================================================
          DECORATIVE LIGHT
      ================================================== */}

      <div className="mint-light"></div>

      <div className="orange-light"></div>


      {/* ==================================================
          SUBTLE GRID
      ================================================== */}

      <div className="tech-grid"></div>


      {/* ==================================================
          MAIN PAGE CONTENT
      ================================================== */}

      <div className="welcome-inner">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="welcome-header">


          {/* BRAND */}

          <div className="brand">

            {/* =================================================
                MYFITNESS LOGO
                Image logo - no border
            ================================================= */}

            <div className="brand-logo">

              <img
                src="/myfitness-m-logo.png"
                alt="MyFitness"
                className="myfitness-m-logo"
              />

            </div>


            <div className="brand-info">

              <div className="brand-name">
                MY<span>FITNESS</span>
              </div>

              <div className="brand-subtitle">
                INTELLIGENT FITNESS
              </div>

            </div>

          </div>


          {/* AI STATUS */}

          <div className="ai-status">

            <span className="status-indicator"></span>

            <div className="status-content">

              <span className="status-title">
                AI FITNESS SYSTEM
              </span>

              <span className="status-value">
                ONLINE
              </span>

            </div>

          </div>

        </header>


        {/* =================================================
            SIDE LABEL
        ================================================= */}

        <div className="side-label">

          <span className="side-number">
            01
          </span>

          <span className="side-line"></span>

          <span className="side-word">
            PERFORMANCE
          </span>

        </div>


        {/* =================================================
            HERO SECTION
        ================================================= */}

        <main className="hero-section">


          {/* EYEBROW */}

          <div className="hero-eyebrow">

            <span className="eyebrow-line"></span>

            <span>
              AI-POWERED FITNESS PLATFORM
            </span>

          </div>


          {/* MAIN HEADING */}

          <h1 className="hero-title">

            <span className="title-main">
              YOUR FITNESS.
            </span>

            <span className="title-accent">
              EVOLVED<span>.</span>
            </span>

          </h1>


          {/* ACCENT LINE */}

          <div className="title-accent-line">

            <span className="mint-bar"></span>

            <span className="orange-bar"></span>

            <span className="white-bar"></span>

          </div>


          {/* DESCRIPTION */}

          <p className="hero-description">

            Train smarter.

            <br />

            Track your progress.

            <br />

            <strong>
              Become a stronger version of yourself.
            </strong>

          </p>


          {/* FEATURES */}

          <div className="feature-row">


            {/* FEATURE 1 */}

            <div className="feature">

              <div className="feature-symbol mint-symbol">
                ✦
              </div>

              <div className="feature-text">

                <span className="feature-title">
                  AI GUIDANCE
                </span>

                <span className="feature-description">
                  Intelligent training
                </span>

              </div>

            </div>


            <div className="feature-divider"></div>


            {/* FEATURE 2 */}

            <div className="feature">

              <div className="feature-symbol orange-symbol">
                ◉
              </div>

              <div className="feature-text">

                <span className="feature-title">
                  SMART TRACKING
                </span>

                <span className="feature-description">
                  Measure every session
                </span>

              </div>

            </div>


            <div className="feature-divider"></div>


            {/* FEATURE 3 */}

            <div className="feature">

              <div className="feature-symbol mint-symbol">
                ↗
              </div>

              <div className="feature-text">

                <span className="feature-title">
                  REAL PROGRESS
                </span>

                <span className="feature-description">
                  Built around you
                </span>

              </div>

            </div>


          </div>


        </main>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="welcome-footer">


          {/* LEFT */}

          <div className="footer-system">

            <div className="footer-icon">

              <span></span>

            </div>

            <div className="footer-info">

              <span className="footer-label">
                PERSONALIZED EXPERIENCE
              </span>

              <span className="footer-value">
                BUILT AROUND YOU
              </span>

            </div>

          </div>


          {/* CENTER */}

          <div className="footer-center">

            <span className="footer-line"></span>

            <span>
              TRAIN SMARTER
            </span>

            <span className="footer-dot">
              •
            </span>

            <span>
              MOVE STRONGER
            </span>

          </div>


          {/* RIGHT */}

          <div className="loader-container">

            <div className="loader-header">

              <span>
                INITIALIZING MYFITNESS
              </span>

              <span className="loader-number">
                {progress}%
              </span>

            </div>


            <div className="loader-track">

              <div
                className="loader-progress"
                style={{
                  width: `${progress}%`,
                }}
              ></div>

            </div>


            <div className="loader-footer">

              <span>
                AI CORE
              </span>

              <span className="loader-ready">
                READY
              </span>

            </div>

          </div>


        </footer>


      </div>


      {/* ==================================================
          CORNER DECORATIONS
      ================================================== */}

      <div className="corner corner-top-left"></div>

      <div className="corner corner-top-right"></div>

      <div className="corner corner-bottom-left"></div>

      <div className="corner corner-bottom-right"></div>


      {/* ==================================================
          PAGE INDICATOR
      ================================================== */}

      <div className="page-indicator">

        <span className="page-active">
          01
        </span>

        <span>
          /
        </span>

        <span>
          01
        </span>

      </div>


      {/* ==================================================
          ORANGE DECORATIVE DOTS
      ================================================== */}

      <div className="orange-dots">

        <span></span>

        <span></span>

        <span></span>

      </div>


    </div>

  );

}

export default Welcome;