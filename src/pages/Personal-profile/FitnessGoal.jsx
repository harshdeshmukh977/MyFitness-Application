import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FitnessGoal.css";

function FitnessGoal() {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState("");

  const goals = [
    {
      id: "lose-weight",
      icon: "🔥",
      title: "Lose Weight",
      description: "Burn fat and reach a healthier body weight.",
      type: "mint",
    },
    {
      id: "build-muscle",
      icon: "💪",
      title: "Build Muscle",
      description: "Build strength, muscle and a powerful physique.",
      type: "orange",
    },
    {
     id: "get-fit",
      icon: "⚡",
      title: "Get Fitter",
      description: "Improve your overall fitness, stamina and energy.",
      type: "mint",
    },
    {
      id: "stay-healthy",
      icon: "❤️",
      title: "Stay Healthy",
      description: "Maintain a healthy and active lifestyle.",
      type: "orange",
    },
  ];

  // BACK → What's Next
  const handleBack = () => {
    navigate("/what-next");
  };

  // SELECT GOAL
  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId);
  };

  // CONTINUE → BENEFITS
 const handleContinue = () => {
  if (!selectedGoal) return;

  localStorage.setItem("fitnessGoal", selectedGoal);
  localStorage.setItem("selectedGoal", selectedGoal);

  navigate("/benefits-profile");
};

  const selectedGoalData = goals.find(
    (goal) => goal.id === selectedGoal
  );

  return (
    <div className="fitness-goal-page">

      {/* Background decoration */}
      <div className="fg-bg fg-mint"></div>
      <div className="fg-bg fg-orange"></div>
      <div className="fg-bg fg-white"></div>

      {/* ================= HEADER ================= */}

      <header className="fg-header">

        <button
          type="button"
          className="fg-back"
          onClick={handleBack}
          aria-label="Go back"
        >
          ←
        </button>

        <div className="fg-brand">

          <img
            src="/myfitness-m-logo.png"
            alt="MyFitness"
            className="fg-logo"
          />

          <div className="fg-brand-text">

            <div className="fg-brand-name">
              MY<span>FITNESS</span>
            </div>

            <div className="fg-brand-subtitle">
              PERSONAL FITNESS
            </div>

          </div>

        </div>

        <div className="fg-progress">

          <div className="fg-progress-top">
            <span>PROFILE SETUP</span>
            <strong>07 / 09</strong>
          </div>

          <div className="fg-progress-track">
            <div className="fg-progress-fill"></div>
          </div>

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="fg-main">

        {/* Heading */}

        <section className="fg-heading">

          <span className="fg-eyebrow">
            YOUR FITNESS JOURNEY
          </span>

          <h1>
            What's your <span>goal?</span>
          </h1>

          <p>
            Choose what you want to achieve.
            <br />
            We'll build your fitness experience around it.
          </p>

        </section>

        {/* ================= GOALS ================= */}

        <section className="fg-goals">

          {goals.map((goal) => {

            const isSelected = selectedGoal === goal.id;

            return (
              <button
                key={goal.id}
                type="button"
                className={`fg-goal-card ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => handleGoalSelect(goal.id)}
              >

                <div
                  className={`fg-goal-icon ${goal.type}`}
                >
                  {goal.icon}
                </div>

                <div className="fg-goal-content">

                  <h3>
                    {goal.title}
                  </h3>

                  <p>
                    {goal.description}
                  </p>

                </div>

                <div
                  className={`fg-radio ${
                    isSelected ? "checked" : ""
                  }`}
                >
                  {isSelected && <span>✓</span>}
                </div>

              </button>
            );
          })}

        </section>

        {/* ================= SELECTED GOAL ================= */}

        <div
          className={`fg-selection ${
            selectedGoal ? "visible" : ""
          }`}
        >

          <div className="fg-selection-icon">
            ✦
          </div>

          <div className="fg-selection-text">

            <span>
              YOUR GOAL
            </span>

            <strong>
              {selectedGoalData
                ? selectedGoalData.title
                : "Choose a goal"}
            </strong>

          </div>

        </div>

        {/* ================= CONTINUE ================= */}

        <button
          type="button"
          className={`fg-continue ${
            selectedGoal ? "active" : "disabled"
          }`}
          disabled={!selectedGoal}
          onClick={handleContinue}
        >

          <span>
            Continue to Benefits
          </span>

          <div className="fg-arrow">
            →
          </div>

        </button>

        <p className="fg-note">
          You can change your goal anytime from your profile.
        </p>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="fg-footer">

        <span>
          MYFITNESS
        </span>

        <div>
          <span>TRAIN SMARTER</span>
          <i></i>
          <span>MOVE STRONGER</span>
        </div>

        <strong>
          07 / 09
        </strong>

      </footer>

    </div>
  );
}

export default FitnessGoal;