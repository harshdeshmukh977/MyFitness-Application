import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSetup.css";

function ProfileSetup() {

  const navigate = useNavigate();

  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");

  const goals = [

    {
      id: "muscle",
      title: "Build Muscle",
      description: "Gain muscle and build strength",
      icon: "↗",
      color: "mint",
    },

    {
      id: "weight-loss",
      title: "Lose Weight",
      description: "Burn fat and improve fitness",
      icon: "↓",
      color: "orange",
    },

    {
      id: "fitness",
      title: "Stay Fit",
      description: "Improve health and maintain fitness",
      icon: "◎",
      color: "mint",
    },

    {
      id: "strength",
      title: "Build Strength",
      description: "Become stronger and more powerful",
      icon: "✦",
      color: "orange",
    },

  ];


  const complete =
    Boolean(
      age &&
      height &&
      weight &&
      goal
    );


  const handleContinue = () => {

    if (!complete) {
      return;
    }


    const profileData = {

      age: Number(age),

      height: Number(height),

      weight: Number(weight),

      goal,

    };


    localStorage.setItem(
      "myfitnessProfile",
      JSON.stringify(profileData)
    );


    navigate("/dashboard");

  };


  return (

    <div className="profile-setup-page">


      <div className="profile-bg"></div>

      <div className="profile-overlay"></div>

      <div className="profile-mint-glow"></div>

      <div className="profile-orange-glow"></div>


      {/* HEADER */}

      <header className="profile-header">


        <div className="profile-brand">


          <div className="profile-brand-logo">

            M

          </div>


          <div>

            <div className="profile-brand-name">

              MY<span>FITNESS</span>

            </div>


            <div className="profile-brand-caption">

              FITNESS • PERFORMANCE • WELLNESS

            </div>

          </div>


        </div>


        <div className="profile-step">

          <span>
            STEP
          </span>

          <strong>
            02
          </strong>

          <span>
            / 02
          </span>

        </div>


      </header>


      {/* MAIN */}

      <main className="profile-main">


        {/* HERO */}

        <section className="profile-hero">


          <div className="profile-eyebrow">

            <span></span>

            BODY PROFILE

          </div>


          <h1>

            Make it

            <span>
              personal.
            </span>

          </h1>


          <p>

            Tell us a little about yourself.
            These details help create a fitness
            experience designed around you.

          </p>


        </section>


        {/* PROGRESS */}

        <section className="profile-progress">


          <div className="profile-progress-heading">

            <span>
              PERSONALIZATION
            </span>

            <strong>
              02 / 02
            </strong>

          </div>


          <div className="profile-progress-track">

            <div className="profile-progress-fill"></div>

          </div>


          <div className="profile-progress-labels">

            <span>
              Training preferences
            </span>

            <span className="active">
              Body profile
            </span>

          </div>


        </section>


        {/* BASIC DETAILS */}

        <section className="profile-section">


          <div className="profile-section-heading">


            <div className="profile-section-number mint">

              01

            </div>


            <div>

              <span>
                BASIC DETAILS
              </span>

              <h2>
                Tell us about yourself
              </h2>

              <p>
                These details help personalize
                your training experience.
              </p>

            </div>


          </div>


          <div className="profile-input-grid">


            {/* AGE */}

            <div className="profile-field">

              <label>
                AGE
              </label>


              <div className="profile-input-wrapper">

                <input
                  type="number"
                  min="13"
                  max="100"
                  placeholder="21"
                  value={age}
                  onChange={(event) =>
                    setAge(event.target.value)
                  }
                />

                <span>
                  YEARS
                </span>

              </div>

            </div>


            {/* HEIGHT */}

            <div className="profile-field">

              <label>
                HEIGHT
              </label>


              <div className="profile-input-wrapper">

                <input
                  type="number"
                  min="100"
                  max="250"
                  placeholder="175"
                  value={height}
                  onChange={(event) =>
                    setHeight(event.target.value)
                  }
                />

                <span>
                  CM
                </span>

              </div>

            </div>


            {/* WEIGHT */}

            <div className="profile-field">

              <label>
                WEIGHT
              </label>


              <div className="profile-input-wrapper">

                <input
                  type="number"
                  min="30"
                  max="300"
                  placeholder="70"
                  value={weight}
                  onChange={(event) =>
                    setWeight(event.target.value)
                  }
                />

                <span>
                  KG
                </span>

              </div>

            </div>


          </div>


        </section>


        {/* GOAL */}

        <section className="profile-section">


          <div className="profile-section-heading">


            <div className="profile-section-number orange">

              02

            </div>


            <div>

              <span>
                FITNESS GOAL
              </span>

              <h2>
                What do you want to achieve?
              </h2>

              <p>
                Choose the goal that best matches
                your current journey.
              </p>

            </div>


          </div>


          <div className="goal-grid">


            {goals.map((item) => {


              const selected =
                goal === item.id;


              return (

                <button

                  key={item.id}

                  type="button"

                  className={`
                    goal-card
                    ${item.color}
                    ${selected ? "selected" : ""}
                  `}

                  onClick={() =>
                    setGoal(item.id)
                  }

                >


                  <div className="goal-icon">

                    {item.icon}

                  </div>


                  <div className="goal-content">

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description}
                    </p>

                  </div>


                  <div className="goal-check">

                    {selected
                      ? "✓"
                      : "+"}

                  </div>


                </button>

              );

            })}


          </div>


        </section>


        {/* SUMMARY */}

        <section className="profile-summary">


          <div className="summary-symbol">

            ◎

          </div>


          <div className="summary-text">

            <span>
              PROFILE STATUS
            </span>


            <h3>

              {complete
                ? "Your profile is ready"
                : "Complete your profile"}

            </h3>


            <p>

              {complete
                ? "Everything is ready for your personalized fitness experience."
                : "Enter your details and choose a fitness goal to continue."}

            </p>

          </div>


          <div
            className={
              complete
                ? "summary-ready"
                : "summary-pending"
            }
          >

            <span></span>

            {complete
              ? "READY"
              : "INCOMPLETE"}

          </div>


        </section>


        {/* ACTION */}

        <section className="profile-action">


          <div>

            <span>
              FINAL STEP
            </span>


            <strong>
              Your personalized dashboard
            </strong>


            <small>
              Training • Progress • Goals
            </small>

          </div>


          <button

            type="button"

            disabled={!complete}

            className={
              complete
                ? "profile-continue active"
                : "profile-continue"
            }

            onClick={handleContinue}

          >

            <span>
              Continue
            </span>


            <div>
              →
            </div>


          </button>


        </section>


      </main>


      {/* FOOTER */}

      <footer className="profile-footer">

        <span>
          MYFITNESS
        </span>

        <span>
          TRAIN SMARTER
        </span>

        <span>
          MOVE STRONGER
        </span>

        <strong>
          02 / 02
        </strong>

      </footer>


    </div>

  );
}


export default ProfileSetup;