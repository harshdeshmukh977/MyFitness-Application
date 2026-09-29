import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Setup.css";

/* =========================================================
   WORKOUT DATA
========================================================= */

const workoutOptions = [
  {
    id: "gym",
    title: "Gym Workout",
    subtitle: "Strength & Muscle",
    description:
      "Build strength, improve muscle development and become stronger with structured gym training.",
    image: "/workouts/gym-workout.jpg",
    number: "01",
    category: "STRENGTH",
    duration: "45–60 MIN",
    equipment: "GYM EQUIPMENT",
    accent: "mint",
  },

  {
    id: "home",
    title: "Home Workout",
    subtitle: "Train Anywhere",
    description:
      "Stay active at home with effective bodyweight and minimal-equipment workouts.",
    image: "/workouts/home-workout.jpg",
    number: "02",
    category: "FLEXIBLE",
    duration: "20–40 MIN",
    equipment: "MINIMAL",
    accent: "orange",
  },

  {
    id: "yoga",
    title: "Yoga & Mobility",
    subtitle: "Balance & Flexibility",
    description:
      "Improve flexibility, balance, mobility and controlled movement through yoga.",
    image: "/workouts/yoga-workout.jpg",
    number: "03",
    category: "MOBILITY",
    duration: "20–45 MIN",
    equipment: "YOGA MAT",
    accent: "mint",
  },

  {
    id: "outdoor",
    title: "Outdoor Fitness",
    subtitle: "Move Outside",
    description:
      "Enjoy running, walking and bodyweight training while staying active outdoors.",
    image: "/workouts/outdoor-workout.jpg",
    number: "04",
    category: "ACTIVE",
    duration: "30–60 MIN",
    equipment: "OUTDOOR",
    accent: "orange",
  },
];

/* =========================================================
   LEVEL DATA
========================================================= */

const levelOptions = [
  {
    id: "beginner",
    title: "Beginner",
    description: "I'm just getting started",
    icon: "01",
  },

  {
    id: "intermediate",
    title: "Intermediate",
    description: "I train regularly",
    icon: "02",
  },

  {
    id: "advanced",
    title: "Advanced",
    description: "I train seriously",
    icon: "03",
  },
];

/* =========================================================
   ICONS
========================================================= */

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8v8" />
      <path d="M3.5 10v4" />
      <path d="M18 8v8" />
      <path d="M20.5 10v4" />
      <path d="M6 12h12" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function YogaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v5" />
      <path d="M8 10l4 2 4-2" />
      <path d="M9 21l3-7 3 7" />
    </svg>
  );
}

function OutdoorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v6" />
      <path d="M8 10l4 3 4-3" />
      <path d="M9 21l3-8 3 8" />
      <path d="M5 21h14" />
    </svg>
  );
}

/* =========================================================
   CATEGORY ICON
========================================================= */

function CategoryIcon({ id }) {
  if (id === "gym") {
    return <DumbbellIcon />;
  }

  if (id === "home") {
    return <HomeIcon />;
  }

  if (id === "yoga") {
    return <YogaIcon />;
  }

  return <OutdoorIcon />;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function Setup() {
  const navigate = useNavigate();

  const [selectedWorkout, setSelectedWorkout] = useState("");

  const [selectedLevel, setSelectedLevel] = useState("");

  const [hoveredWorkout, setHoveredWorkout] = useState("");

  /* =======================================================
     SELECT WORKOUT
  ======================================================= */

  const handleWorkoutSelect = (id) => {
    setSelectedWorkout(id);
  };

  /* =======================================================
     SELECT LEVEL
  ======================================================= */

  const handleLevelSelect = (id) => {
    setSelectedLevel(id);
  };

  /* =======================================================
     CONTINUE
  ======================================================= */

  const handleContinue = async () => {
  if (!selectedWorkout || !selectedLevel) {
    return;
  }

  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("User not found. Please login again.");
    navigate("/login");
    return;
  }

  const setupData = {
    userId: Number(userId),
    workoutType: selectedWorkout,
    fitnessLevel: selectedLevel,
  };

  try {
    const response = await fetch(
      "http://localhost:8080/api/setup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(setupData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save setup");
    }

    const savedSetup = await response.json();

    localStorage.setItem(
      "myfitnessSetup",
      JSON.stringify(savedSetup)
    );

    console.log("Setup saved successfully:", savedSetup);

    navigate("/personal-profile");

  } catch (error) {
    console.error("Setup error:", error);
    alert(
      "Unable to save setup. Please make sure backend is running."
    );
  }
};
  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div className="setup-page">

      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div className="setup-background">

        <div className="setup-orb setup-orb-mint"></div>

        <div className="setup-orb setup-orb-orange"></div>

        <div className="setup-grid"></div>

      </div>


      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="setup-container">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="setup-header">

          <div className="setup-brand">

           <div className="setup-brand-mark">
  <img
    src="/myfitness-m-logo.png"
    alt="MyFitness Logo"
  />
</div>

            <div className="setup-brand-text">

              <div className="setup-brand-name">
                MY<span>FITNESS</span>
              </div>

              <div className="setup-brand-line">
                PERSONAL FITNESS
              </div>

            </div>

          </div>


          <div className="setup-progress">

            <div className="setup-progress-label">
              <span>SETUP</span>
              <strong>01 / 09</strong>
            </div>

            <div className="setup-progress-track">

              <div className="setup-progress-active"></div>

            </div>

          </div>

        </header>


        {/* ===================================================
            INTRO
        =================================================== */}

        <section className="setup-intro">

          <div className="setup-intro-eyebrow">

            <span className="intro-line"></span>

            <span>
              PERSONAL TRAINING SETUP
            </span>

          </div>


          <h1>
            How do you
            <br />

            <span>
              like to train?
            </span>
          </h1>


          <p>
            Choose your preferred training style and
            experience level. We'll use this to shape
            your MyFitness experience.
          </p>

        </section>


        {/* ===================================================
            WORKOUT SECTION
        =================================================== */}

        <section className="selection-section">

          <div className="section-heading">

            <div>

              <span className="section-kicker">
                STEP 01
              </span>

              <h2>
                Choose your workout
              </h2>

            </div>

            <span className="section-counter">
              {selectedWorkout ? "1 SELECTED" : "SELECT ONE"}
            </span>

          </div>


          {/* =================================================
              WORKOUT GRID
          ================================================= */}

          <div className="workout-grid">

            {workoutOptions.map((option) => {

              const selected =
                selectedWorkout === option.id;

              const hovered =
                hoveredWorkout === option.id;

              return (

                <button
                  type="button"
                  key={option.id}
                  className={`
                    workout-card
                    workout-${option.accent}
                    ${selected ? "workout-selected" : ""}
                    ${hovered ? "workout-hovered" : ""}
                  `}
                  onClick={() =>
                    handleWorkoutSelect(option.id)
                  }
                  onMouseEnter={() =>
                    setHoveredWorkout(option.id)
                  }
                  onMouseLeave={() =>
                    setHoveredWorkout("")
                  }
                >

                  {/* IMAGE */}

                  <div className="workout-image-wrapper">

                    <img
                      src={option.image}
                      alt={option.title}
                      className="workout-image"
                    />

                    <div className="workout-image-overlay"></div>


                    {/* NUMBER */}

                    <div className="workout-number">
                      {option.number}
                    </div>


                    {/* CATEGORY */}

                    <div className="workout-category">

                      <CategoryIcon
                        id={option.id}
                      />

                      <span>
                        {option.category}
                      </span>

                    </div>


                    {/* SELECT CHECK */}

                    <div
                      className="
                        workout-selection-indicator
                      "
                    >

                      {selected ? (
                        <CheckIcon />
                      ) : (
                        <span>+</span>
                      )}

                    </div>


                    {/* IMAGE TITLE */}

                    <div className="workout-image-title">

                      <span>
                        {option.subtitle}
                      </span>

                      <strong>
                        {option.title}
                      </strong>

                    </div>

                  </div>


                  {/* CARD CONTENT */}

                  <div className="workout-content">

                    <div className="workout-title-row">

                      <div>

                        <h3>
                          {option.title}
                        </h3>

                        <p>
                          {option.subtitle}
                        </p>

                      </div>

                    </div>


                    <p className="workout-description">
                      {option.description}
                    </p>


                    {/* META */}

                    <div className="workout-meta">

                      <div className="workout-meta-item">

                        <span>
                          DURATION
                        </span>

                        <strong>
                          {option.duration}
                        </strong>

                      </div>


                      <div className="workout-meta-divider"></div>


                      <div className="workout-meta-item">

                        <span>
                          EQUIPMENT
                        </span>

                        <strong>
                          {option.equipment}
                        </strong>

                      </div>

                    </div>


                    {/* FOOTER */}

                    <div className="workout-footer">

                      <span>
                        {selected
                          ? "WORKOUT SELECTED"
                          : "SELECT WORKOUT"}
                      </span>

                      <div className="workout-footer-arrow">

                        <ArrowIcon />

                      </div>

                    </div>

                  </div>

                </button>

              );

            })}

          </div>

        </section>


        {/* ===================================================
            LEVEL SECTION
        =================================================== */}

        <section className="selection-section level-section">

          <div className="section-heading">

            <div>

              <span className="section-kicker">
                STEP 02
              </span>

              <h2>
                What's your level?
              </h2>

            </div>

            <span className="section-counter">
              {selectedLevel
                ? "1 SELECTED"
                : "SELECT ONE"}
            </span>

          </div>


          <div className="level-grid">

            {levelOptions.map((level) => {

              const selected =
                selectedLevel === level.id;

              return (

                <button
                  type="button"
                  key={level.id}
                  className={`
                    level-card
                    ${selected ? "level-selected" : ""}
                  `}
                  onClick={() =>
                    handleLevelSelect(level.id)
                  }
                >

                  <div className="level-number">

                    {selected ? (
                      <CheckIcon />
                    ) : (
                      level.icon
                    )}

                  </div>


                  <div className="level-content">

                    <h3>
                      {level.title}
                    </h3>

                    <p>
                      {level.description}
                    </p>

                  </div>


                  <div className="level-radio">

                    {selected && (
                      <span></span>
                    )}

                  </div>

                </button>

              );

            })}

          </div>

        </section>


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <section className="setup-summary">

          <div className="summary-icon">

            <DumbbellIcon />

          </div>


          <div className="summary-content">

            <span>
              YOUR CURRENT SELECTION
            </span>

            <strong>

              {selectedWorkout
                ? workoutOptions.find(
                    (item) =>
                      item.id === selectedWorkout
                  )?.title
                : "Choose a workout"}

              {" • "}

              {selectedLevel
                ? levelOptions.find(
                    (item) =>
                      item.id === selectedLevel
                  )?.title
                : "Choose your level"}

            </strong>

          </div>

        </section>


        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="setup-actions">

          <button
            type="button"
            className="setup-back-button"
            onClick={handleBack}
          >
            <span>←</span>
            Back
          </button>


          <button
            type="button"
            className={`
              continue-button
              ${
                selectedWorkout &&
                selectedLevel
                  ? "continue-active"
                  : ""
              }
            `}
            disabled={
              !selectedWorkout ||
              !selectedLevel
            }
            onClick={handleContinue}
          >

            <span>
              Continue
            </span>

            <div className="continue-arrow">

              <ArrowIcon />

            </div>

          </button>

        </div>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="setup-footer">

          <div>

            <span className="footer-dot"></span>

            <span>
              MYFITNESS
            </span>

          </div>


          <span>
            PERSONALIZED TRAINING EXPERIENCE
          </span>


          <span>
            01 / 09
          </span>

        </footer>

      </div>

    </div>
  );
}

export default Setup;