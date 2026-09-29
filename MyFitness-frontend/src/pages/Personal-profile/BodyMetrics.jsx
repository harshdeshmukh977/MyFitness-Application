import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BodyMetrics.css";

function BodyMetrics() {
  const navigate = useNavigate();

  const [age, setAge] = useState(21);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);

  const changeValue = (type, amount) => {
    if (type === "age") {
      setAge((prev) => Math.min(100, Math.max(13, prev + amount)));
    }

    if (type === "height") {
      setHeight((prev) => Math.min(250, Math.max(100, prev + amount)));
    }

    if (type === "weight") {
      setWeight((prev) => Math.min(250, Math.max(30, prev + amount)));
    }
  };

  const handleContinue = async () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("User not found. Please login again.");
    navigate("/login");
    return;
  }

  const bodyMetricsData = {
    userId: Number(userId),
    age: age,
    height: height,
    weight: weight,
  };

  try {
    const response = await fetch(
      "http://localhost:8080/api/body-metrics",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyMetricsData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save body metrics");
    }

    const savedData = await response.json();

    localStorage.setItem(
      "myfitnessBodyMetrics",
      JSON.stringify(savedData)
    );

    console.log("Body Metrics saved successfully:", savedData);

    navigate("/gender-card");

  } catch (error) {
    console.error("Body Metrics error:", error);

    alert(
      "Unable to save body metrics. Please make sure backend is running."
    );
  }
};

  return (
    <div className="bm-page">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <header className="bm-navbar">

        {/* LEFT - MYFITNESS */}
        <div className="bm-brand">

          <img
            src="/myfitness-m-logo.png"
            alt="MyFitness"
            className="bm-logo"
          />

          <div className="bm-brand-text">
            <div className="bm-brand-name">
              MY<span>FITNESS</span>
            </div>

            <div className="bm-brand-subtitle">
              PERSONAL FITNESS
            </div>
          </div>

        </div>


        {/* RIGHT - PROFILE SETUP */}
        <div className="bm-progress">

          <div className="bm-progress-top">
            <span>PROFILE SETUP</span>
            <strong>03 / 09</strong>
          </div>

          <div className="bm-progress-track">
            <div className="bm-progress-active"></div>
          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="bm-content">

        {/* PAGE TITLE */}

        <div className="bm-heading">

          <div className="bm-step-number">
            03
          </div>

          <div>
            <div className="bm-eyebrow">
              BODY METRICS
            </div>

            <h1>
              Tell us about your body
            </h1>

            <p>
              These values help us create a fitness experience
              that actually fits you.
            </p>
          </div>

        </div>


        {/* =====================================================
            METRIC CARDS
        ===================================================== */}

        <section className="bm-cards">


          {/* AGE */}

          <div className="bm-card bm-card-green">

            <div className="bm-card-top">
              <div>
                <div className="bm-card-title">
                  AGE
                </div>

                <div className="bm-card-unit">
                  YEARS
                </div>
              </div>

              <div className="bm-card-icon">
                ♙
              </div>
            </div>


            <div className="bm-picker">

              <button
                className="bm-minus"
                onClick={() => changeValue("age", -1)}
              >
                −
              </button>

              <div className="bm-circle">

                <span className="bm-small-value">
                  {age - 1}
                </span>

                <div className="bm-main-value">
                  {age}
                </div>

                <span className="bm-small-value">
                  {age + 1}
                </span>

              </div>

              <button
                className="bm-plus"
                onClick={() => changeValue("age", 1)}
              >
                +
              </button>

            </div>


            <div className="bm-card-bottom">
              Your age
            </div>

          </div>


          {/* HEIGHT */}

          <div className="bm-card bm-card-orange">

            <div className="bm-card-top">

              <div>
                <div className="bm-card-title">
                  HEIGHT
                </div>

                <div className="bm-card-unit">
                  CENTIMETERS
                </div>
              </div>

              <div className="bm-card-icon">
                ▥
              </div>

            </div>


            <div className="bm-picker">

              <button
                className="bm-minus"
                onClick={() => changeValue("height", -1)}
              >
                −
              </button>

              <div className="bm-circle">

                <span className="bm-small-value">
                  {height - 1}
                </span>

                <div className="bm-main-value">
                  {height}
                </div>

                <span className="bm-small-value">
                  {height + 1}
                </span>

              </div>

              <button
                className="bm-plus"
                onClick={() => changeValue("height", 1)}
              >
                +
              </button>

            </div>


            <div className="bm-card-bottom">
              Your height
            </div>

          </div>


          {/* WEIGHT */}

          <div className="bm-card bm-card-green">

            <div className="bm-card-top">

              <div>
                <div className="bm-card-title">
                  WEIGHT
                </div>

                <div className="bm-card-unit">
                  KILOGRAMS
                </div>
              </div>

              <div className="bm-card-icon">
                ♙
              </div>

            </div>


            <div className="bm-picker">

              <button
                className="bm-minus"
                onClick={() => changeValue("weight", -1)}
              >
                −
              </button>

              <div className="bm-circle">

                <span className="bm-small-value">
                  {weight - 1}
                </span>

                <div className="bm-main-value">
                  {weight}
                </div>

                <span className="bm-small-value">
                  {weight + 1}
                </span>

              </div>

              <button
                className="bm-plus"
                onClick={() => changeValue("weight", 1)}
              >
                +
              </button>

            </div>


            <div className="bm-card-bottom">
              Your weight
            </div>

          </div>

        </section>


        {/* =====================================================
            INFO BOX
        ===================================================== */}

        <div className="bm-info">

          <div className="bm-info-icon">
            ✦
          </div>

          <div>
            <strong>
              Why we ask for this
            </strong>

            <p>
              Your measurements help MyFitness estimate your
              daily needs and create more relevant workouts and goals.
            </p>
          </div>

          <div className="bm-info-bars">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>


        {/* =====================================================
            NEXT STEP
        ===================================================== */}

        <div className="bm-next">

          <div className="bm-next-text">

            <span>
              NEXT STEP
            </span>

            <strong>
              Tell us about yourself
            </strong>

            <small>
              Gender & personal preferences
            </small>

          </div>


          <button
            className="bm-continue"
            onClick={handleContinue}
          >
            <span>
              Continue
            </span>

            <b>
              →
            </b>
          </button>

        </div>

      </main>

    </div>
  );
}

export default BodyMetrics;