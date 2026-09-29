import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { getAchievements, getWeeklyProgress } from "../services/dashboardApi";

function Dashboard() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState(null);
  const [currentStreak, setCurrentStreak] = useState({ days: 0, weekday: "" });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [showTodayMeal, setShowTodayMeal] = useState(false);

  const [setupData, setSetupData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("myfitnessSetup")) || null;
    } catch {
      return null;
    }
  });
  

    const [bodyMetrics, setBodyMetrics] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
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
        console.log("Body Metrics from backend:", data);
        setBodyMetrics(data);
      })
      .catch((error) => {
        console.error("Body Metrics fetch error:", error);
      });
  }, []);

  // --------------------------------------------------
  // WORKOUT SETUP FROM BACKEND
  // --------------------------------------------------

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      return;
    }

    fetch(`http://localhost:8080/api/setup/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Setup not found");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Setup from backend:", data);
        setSetupData(data);
        localStorage.setItem("myfitnessSetup", JSON.stringify(data));
      })
      .catch((error) => {
        console.error("Setup fetch error:", error);
      });
  }, []);

  // --------------------------------------------------
  // DASHBOARD TRACKING DATA
  // --------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      try {
        const [achievementData, weeklyData, streakResponse] = await Promise.all([
          getAchievements(),
          getWeeklyProgress(),
          fetch("http://localhost:8080/api/workouts/streak", {
            headers: {
              ...(localStorage.getItem("token") || localStorage.getItem("authToken")
                ? { Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("authToken")}` }
                : {}),
            },
          }).then((response) => {
            if (!response.ok) throw new Error("Failed to fetch streak");
            return response.json();
          }),
        ]);

        if (!active) return;
        setAchievements(achievementData);
        setWeeklyProgress(weeklyData);
        setCurrentStreak(streakResponse);
      } catch (error) {
        console.error("Dashboard tracking error:", error);
      } finally {
        if (active) setDashboardLoading(false);
      }
    };

    loadDashboardData();
    return () => { active = false; };
  }, []);

  // --------------------------------------------------
  // PROFILE DATA FROM ONBOARDING
  // --------------------------------------------------

  const getStoredValue = (keys, fallback) => {
    for (const key of keys) {
      const value = localStorage.getItem(key);

      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        return value;
      }
    }

    return fallback;
  };

  const rawAge = getStoredValue(
    ["age", "userAge", "profileAge"],
    "21"
  );

  const rawHeight = getStoredValue(
    ["height", "userHeight", "heightCm"],
    "175"
  );

  const rawWeight = getStoredValue(
    ["weight", "userWeight", "weightKg"],
    "70"
  );

 const savedGender = getStoredValue(
  ["gender", "userGender", "selectedGender"],
  ""
);

const genderMap = {
  male: "Male",
  female: "Female",
  other: "Prefer not to say",
};

const gender = genderMap[savedGender] || "Male";

  const profileImage =
    savedGender === "female"
      ? "/female-profile.jpg"
      : "/profile-avatar.jpg";

  const storedGoal = getStoredValue(
    [
      "fitnessGoal",
      "goal",
      "selectedGoal",
      "fitness_goal",
    ],
    "get-fit"
  );

  const userName = getStoredValue(
    [
      "name",
      "userName",
      "fullName",
      "profileName",
    ],
    "Athlete"
  );

 const age = Number(bodyMetrics?.age ?? rawAge) || 21;
const height = Number(bodyMetrics?.height ?? rawHeight) || 175;
const weight = Number(bodyMetrics?.weight ?? rawWeight) || 70;
  // --------------------------------------------------
  // FITNESS GOAL
  // --------------------------------------------------

  const goalMap = {
    "lose-weight": {
      title: "Lose Weight",
      short: "Fat Loss",
      icon: "🔥",
      description:
        "Burn fat and build a healthier, stronger body.",
      workout:
        "Cardio + full body fat-burning workout",
    },

    "build-muscle": {
      title: "Build Muscle",
      short: "Muscle Gain",
      icon: "💪",
      description:
        "Build strength, muscle and a powerful physique.",
      workout:
        "Progressive resistance & strength training",
    },

    "get-fit": {
      title: "Get Fitter",
      short: "Overall Fitness",
      icon: "⚡",
      description:
        "Improve your fitness, stamina and daily energy.",
      workout:
        "Balanced full-body fitness workout",
    },

    "stay-healthy": {
      title: "Stay Healthy",
      short: "Healthy Lifestyle",
      icon: "❤️",
      description:
        "Maintain a healthy, active and balanced lifestyle.",
      workout:
        "Mobility + cardio + strength workout",
    },
  };

  const goal = goalMap[storedGoal] || goalMap["get-fit"];

  // --------------------------------------------------
  // PERSONALIZED WORKOUT
  // --------------------------------------------------

  const workoutType = setupData?.workoutType || "gym";
  const fitnessLevel = setupData?.fitnessLevel || "beginner";

  const workoutTypeMap = {
    gym: {
      title: "Gym Workout",
      image: "/workouts/gym-workout.jpg",
    },
    home: {
      title: "Home Workout",
      image: "/workouts/home-workout.jpg",
    },
    yoga: {
      title: "Yoga & Mobility",
      image: "/workouts/yoga-workout.jpg",
    },
    outdoor: {
      title: "Outdoor Fitness",
      image: "/workouts/outdoor-workout.jpg",
    },
  };

  const levelMap = {
    beginner: { title: "Beginner", duration: 30, calories: 220 },
    intermediate: { title: "Intermediate", duration: 40, calories: 300 },
    advanced: { title: "Advanced", duration: 50, calories: 400 },
  };

  const exerciseLibrary = {
  // ==================================================
  // 🏠 HOME WORKOUT
  // ==================================================
  home: {
    "lose-weight": [
      "Jumping Jacks",
      "Mountain Climbers",
      "Bodyweight Squats",
      "High Knees",
      "Burpees",
    ],

    "build-muscle": [
      "Push Ups",
      "Diamond Push Ups",
      "Bodyweight Squats",
      "Bulgarian Split Squats",
      "Glute Bridges",
    ],

    "get-fit": [
      "Jumping Jacks",
      "Push Ups",
      "Bodyweight Squats",
      "Mountain Climbers",
      "Plank",
    ],

    "stay-healthy": [
      "Mobility Flow",
      "Bodyweight Squats",
      "Bird Dog",
      "Low Impact March",
      "Full Body Stretch",
    ],
  },

  // ==================================================
  // 🏋️ GYM WORKOUT
  // ==================================================
  gym: {
    "lose-weight": [
      "Treadmill Warm Up",
      "Goblet Squats",
      "Dumbbell Row",
      "Cycling Intervals",
      "Battle Ropes",
    ],

    "build-muscle": [
      "Barbell Squats",
      "Bench Press",
      "Lat Pulldown",
      "Shoulder Press",
      "Barbell Curls",
    ],

    "get-fit": [
      "Dynamic Warm Up",
      "Full Body Strength",
      "Cable Row",
      "Core Training",
      "Cardio Conditioning",
    ],

    "stay-healthy": [
      "Mobility Warm Up",
      "Light Leg Press",
      "Seated Cable Row",
      "Core & Balance",
      "Easy Cardio",
    ],
  },

  // ==================================================
  // 🧘 YOGA & MOBILITY
  // ==================================================
  yoga: {
    "lose-weight": [
      "Sun Salutation",
      "Power Yoga Flow",
      "Chair Pose",
      "Warrior Flow",
      "Core Yoga",
    ],

    "build-muscle": [
      "Plank Hold",
      "Chaturanga",
      "Warrior III",
      "Boat Pose",
      "Side Plank",
    ],

    "get-fit": [
      "Sun Salutation",
      "Full Body Flow",
      "Core Flow",
      "Balance Flow",
      "Mobility Flow",
    ],

    "stay-healthy": [
      "Breathing Exercise",
      "Gentle Stretch",
      "Cat Cow",
      "Child's Pose",
      "Relaxation",
    ],
  },

  // ==================================================
  // 🌳 OUTDOOR FITNESS
  // ==================================================
  outdoor: {
    "lose-weight": [
      "Brisk Walk",
      "Jogging",
      "Hill Intervals",
      "Bodyweight Circuit",
      "Fast Walk",
    ],

    "build-muscle": [
      "Jog Warm Up",
      "Outdoor Squats",
      "Push Up Set",
      "Walking Lunges",
      "Hill Strength",
    ],

    "get-fit": [
      "Brisk Walk",
      "Jogging",
      "Bodyweight Circuit",
      "Cardio Intervals",
      "Sprint Training",
    ],

    "stay-healthy": [
      "Easy Walk",
      "Light Jog",
      "Mobility Break",
      "Easy Bodyweight",
      "Full Body Stretch",
    ],
  },
};
  const selectedWorkoutType =
    workoutTypeMap[workoutType] || workoutTypeMap.gym;

  const selectedLevel =
    levelMap[fitnessLevel] || levelMap.beginner;

  const exerciseNames =
    exerciseLibrary[workoutType]?.[storedGoal] ||
    exerciseLibrary.gym["get-fit"];

  const selectedExercises = exerciseNames.map((name, index) => [
    String(index + 1).padStart(2, "0"),
    name,
    index === 0 ? "05 min" : index === 4 ? "04 min" : "08 min",
    ["◎", "◈", "◇", "↗", "○"][index],
  ]);


  // --------------------------------------------------
  // TODAY'S MEAL
  // Based only on the nutrition plan provided for MyFitness.
  // Food quantities are shown only where the provided plan specified them.
  // --------------------------------------------------

  const todayMealLibrary = {
    home: {
      "build-muscle": {
        title: "Home Workout · Muscle Gain",
        targets: "Maintenance +200–250 kcal · Protein 1.8–2 g/kg · Carbs 4–5 g/kg · Fats 0.9 g/kg",
        meals: [
          { timing: "Pre-workout", meal: "Banana + peanut butter", amount: "Portion not specified in the provided plan" },
          { timing: "Post-workout", meal: "Paneer or soya bhurji + 2 roti", amount: "2 roti; paneer/soya portion not specified" },
          { timing: "Night", meal: "Curd or milk", amount: "Portion not specified in the provided plan" },
        ],
        note: "Bodyweight load is lower, so do not use a large surplus."
      },
      "lose-weight": {
        title: "Home Workout · Weight Loss",
        targets: "Maintenance −400 kcal · Protein 1.8–2 g/kg · Carbs 2–3 g/kg · Fats 0.8 g/kg",
        meals: [
          { timing: "Meal", meal: "Moong chilla or sprouts", amount: "Portion not specified in the provided plan" },
          { timing: "Main meal", meal: "Dal + sabzi + 2 roti + dahi", amount: "2 roti; other portions not specified" },
        ],
        note: "Keep fibre high and protein high to preserve muscle."
      },
      "get-fit": {
        title: "Home Workout · Get Fitter",
        targets: "Maintenance −200 kcal · Protein 1.6–1.8 g/kg · Carbs 3–4 g/kg · Fats 0.8 g/kg",
        meals: [
          { timing: "45 min before HIIT/circuit", meal: "Oats or banana", amount: "Portion not specified in the provided plan" },
          { timing: "After workout", meal: "Eggs or paneer + roti", amount: "Portion not specified in the provided plan" },
        ],
        note: "Designed around HIIT/circuit training."
      },
      "stay-healthy": {
        title: "Home Workout · Stay Healthy",
        targets: "Maintenance · Protein 1.2–1.4 g/kg · Carbs 3–4 g/kg · Fats 0.9 g/kg",
        meals: [
          { timing: "Main meals", meal: "Balanced thali: dal + roti + sabzi + dahi", amount: "Portions not specified in the provided plan" },
          { timing: "Snack", meal: "Handful of nuts + fruit", amount: "Handful of nuts; fruit portion not specified" },
        ],
        note: "Keep the diet balanced."
      },
    },

    gym: {
      "build-muscle": {
        title: "Gym Workout · Muscle Gain",
        targets: "Maintenance +300 kcal · Protein 2 g/kg · Carbs 5–6 g/kg · Fats 1 g/kg",
        meals: [
          { timing: "60–90 min before workout", meal: "Oats + banana", amount: "Portion not specified in the provided plan" },
          { timing: "1–2 h after workout", meal: "Rice + dal + paneer or chicken", amount: "Portions not specified in the provided plan" },
          { timing: "As needed", meal: "Whey or milk", amount: "Portion not specified; optional supplement" },
          { timing: "Daily", meal: "Creatine", amount: "3–5 g/day optional" },
        ],
        note: "Protein-focused strength nutrition."
      },
      "lose-weight": {
        title: "Gym Workout · Weight Loss",
        targets: "Maintenance −400 to −500 kcal · Protein 2–2.2 g/kg · Carbs 2.5–3.5 g/kg · Fats 0.8 g/kg",
        meals: [
          { timing: "Around workout", meal: "Oats, banana or rice", amount: "Keep most carbs around the workout; portion not specified" },
          { timing: "Other meals", meal: "Vegetables + dal + soya or eggs + salad", amount: "Portions not specified in the provided plan" },
        ],
        note: "Use weights to help preserve muscle."
      },
      "get-fit": {
        title: "Gym Workout · Get Fitter",
        targets: "Maintenance −100 to −200 kcal · Protein 1.8–2 g/kg · Carbs 3.5–4.5 g/kg · Fats 0.9 g/kg",
        meals: [
          { timing: "Main meals", meal: "Brown rice or jowar/bajra roti + chicken/paneer + dal", amount: "Portions not specified in the provided plan" },
          { timing: "Post-workout", meal: "Protein-rich meal", amount: "25–30 g protein" },
        ],
        note: "Recomposition-focused nutrition."
      },
      "stay-healthy": {
        title: "Gym Workout · Stay Healthy",
        targets: "Maintenance · Protein 1.4–1.6 g/kg · Carbs 3.5–4 g/kg · Fats 0.9 g/kg",
        meals: [
          { timing: "Each meal", meal: "Protein-rich meal with salad + thali", amount: "Portions not specified in the provided plan" },
          { timing: "Daily", meal: "Low processed food", amount: "Preference/instruction from the provided plan" },
        ],
        note: "Include protein in each meal and keep processed food low."
      },
    },

    yoga: {
      "build-muscle": {
        title: "Yoga & Mobility · Muscle Gain",
        targets: "Maintenance +150–200 kcal · Protein 1.8 g/kg · Carbs 4 g/kg · Fats 1 g/kg",
        meals: [
          { timing: "Daily", meal: "Paneer + dal + nuts", amount: "Portions not specified in the provided plan" },
          { timing: "Night", meal: "Haldi doodh", amount: "Portion not specified in the provided plan" },
        ],
        note: "Yoga alone is not enough for muscle gain; add bodyweight/weights 2–3 days. Yoga supports recovery."
      },
      "lose-weight": {
        title: "Yoga & Mobility · Weight Loss",
        targets: "Maintenance −300 kcal · Protein 1.5–1.8 g/kg · Carbs 2.5–3 g/kg · Fats 0.8 g/kg",
        meals: [
          { timing: "Light dinner", meal: "Khichdi or soup or sabzi", amount: "Portion not specified in the provided plan" },
          { timing: "Hydration", meal: "Chhach or nimbu paani", amount: "Portion not specified in the provided plan" },
        ],
        note: "Use a smaller deficit because yoga burns fewer calories. Avoid a crash diet."
      },
      "get-fit": {
        title: "Yoga & Mobility · Get Fitter",
        targets: "Maintenance · Protein 1.4–1.6 g/kg · Carbs 3 g/kg · Fats 0.9 g/kg",
        meals: [
          { timing: "Daily", meal: "Green vegetables + fruits + dal + seeds + nuts + dahi", amount: "Portions not specified in the provided plan" },
          { timing: "2–3 h before session", meal: "Avoid heavy food", amount: "Timing instruction from the provided plan" },
        ],
        note: "Green vegetables support magnesium intake."
      },
      "stay-healthy": {
        title: "Yoga & Mobility · Stay Healthy",
        targets: "Maintenance · Protein 1.0–1.2 g/kg · Carbs 3–4 g/kg · Fats 0.9 g/kg",
        meals: [
          { timing: "Daily", meal: "Khichdi + sabzi + dal + little ghee", amount: "Portions not specified in the provided plan" },
          { timing: "Snack/drink", meal: "Fruits + herbal chai", amount: "Portions not specified in the provided plan" },
        ],
        note: "Sattvik and easy-to-digest food."
      },
    },

    outdoor: {
      "build-muscle": {
        title: "Outdoor Fitness · Muscle Gain",
        targets: "Maintenance +300–400 kcal on cardio days · Protein 1.8–2 g/kg · Carbs 5–6 g/kg · Fats 1 g/kg",
        meals: [
          { timing: "Pre-workout", meal: "Poha or upma + banana", amount: "Portions not specified in the provided plan" },
          { timing: "Post-workout", meal: "Rice + dal + paneer or egg", amount: "Portions not specified in the provided plan" },
          { timing: "Night", meal: "Milk", amount: "Portion not specified in the provided plan" },
        ],
        note: "Limit excessive cardio."
      },
      "lose-weight": {
        title: "Outdoor Fitness · Weight Loss",
        targets: "Maintenance −400 kcal · Protein 1.8 g/kg · Carbs 3–4 g/kg · Fats 0.8 g/kg",
        meals: [
          { timing: "Pre-workout", meal: "Banana + dates", amount: "Portion not specified in the provided plan" },
          { timing: "Post-workout", meal: "Eggs or dal + roti + sabzi", amount: "Portions not specified in the provided plan" },
          { timing: "Hot weather", meal: "Lemon-salt water or coconut water", amount: "Portion not specified in the provided plan" },
        ],
        note: "Avoid a long fasted run."
      },
      "get-fit": {
        title: "Outdoor Fitness · Get Fitter",
        targets: "Maintenance +100 kcal · Protein 1.5–1.7 g/kg · Carbs 5–7 g/kg · Fats 0.9 g/kg",
        meals: [
          { timing: "During activity >75 min", meal: "Banana, dates or ORS", amount: "30–60 g carbs/hour" },
          { timing: "Post-workout", meal: "Carbohydrates + protein", amount: "About 3:1 carb-to-protein ratio" },
        ],
        note: "Endurance activity needs enough carbohydrates."
      },
      "stay-healthy": {
        title: "Outdoor Fitness · Stay Healthy",
        targets: "Maintenance · Protein 1.2–1.4 g/kg · Carbs 4–5 g/kg · Fats 0.9 g/kg",
        meals: [
          { timing: "Daily", meal: "Seasonal fruits + chhach + sattu drink", amount: "Portions not specified in the provided plan" },
          { timing: "Main meal", meal: "Dal + roti", amount: "Portions not specified in the provided plan" },
          { timing: "Hydration", meal: "Coconut water", amount: "Portion not specified in the provided plan" },
        ],
        note: "Focus on hydration and sun exposure for Vitamin D."
      },
    },
  };

  const todayMeal =
    todayMealLibrary[workoutType]?.[storedGoal] ||
    todayMealLibrary.gym["get-fit"];

  // --------------------------------------------------
  // BMI
  // --------------------------------------------------

  const heightMeters = height / 100;
  const bmi =
    heightMeters > 0
      ? weight / (heightMeters * heightMeters)
      : 0;

  const bmiValue = bmi.toFixed(1);

  let bmiStatus = "Healthy";

  if (bmi < 18.5) {
    bmiStatus = "Underweight";
  } else if (bmi >= 25 && bmi < 30) {
    bmiStatus = "Overweight";
  } else if (bmi >= 30) {
    bmiStatus = "High BMI";
  }

  // --------------------------------------------------
  // DATE
  // --------------------------------------------------

  const today = new Date();

  const dateText = today.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const searchItems = [
    {
      name: "Overview",
      section: "overview",
      keywords: "dashboard home overview",
    },
    {
      name: "Workout",
      section: "workout",
      keywords: "exercise training workout",
    },
    {
      name: "Nutrition",
      section: "nutrition",
      keywords: "food diet nutrition meal",
    },
    {
      name: "Progress",
      section: "progress",
      keywords: "progress statistics weekly",
    },
    {
      name: "Achievements",
      section: "achievements",
      keywords: "badges achievements milestones",
    },
    {
      name: "Body Metrics",
      section: "metrics",
      keywords: "body bmi height weight metrics",
    },
    {
      name: "Profile",
      section: "profile",
      keywords: "profile age gender user",
    },
  ];

  const filteredSearch = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return searchItems;
    }

    return searchItems.filter((item) =>
      `${item.name} ${item.keywords}`
        .toLowerCase()
        .includes(value)
    );
  }, [search]);

  const handleSearchSelect = (section) => {
    setActiveSection(section);
    setSearch("");
    setShowSearch(false);

    setTimeout(() => {
      const element = document.getElementById(
        `section-${section}`
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  // --------------------------------------------------
  // SIDEBAR NAVIGATION
  // --------------------------------------------------

  const handleSection = (section) => {
    setActiveSection(section);

    const element = document.getElementById(
      `section-${section}`
    );

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // --------------------------------------------------
  // PROFILE ROUTES
  // --------------------------------------------------

  const openProfile = () => {
    navigate("/profile-summary");
  };

  const openBodyMetrics = () => {
    navigate("/body-metrics");
  };

  const openGoal = () => {
    navigate("/fitness-goal");
  };

  const editProfile = () => {
    navigate("/profile-image");
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  // --------------------------------------------------
  // KEYBOARD SHORTCUT
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setShowSearch(true);
      }

      if (event.key === "Escape") {
        setShowSearch(false);
        setShowProfileMenu(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // --------------------------------------------------
  // WORKOUT
  // --------------------------------------------------

  const startWorkout = () => {
    setWorkoutStarted(true);
    handleSection("workout");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="dashboard-page">

      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="dashboard-bg-glow glow-one" />
      <div className="dashboard-bg-glow glow-two" />
      <div className="dashboard-bg-grid" />

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-logo-area">
          <div
            className="sidebar-logo"
            onClick={() =>
              handleSection("overview")
            }
          >
            <img
              src="/myfitness-m-logo.png"
              alt="MyFitness"
            />

            <div>
              <div className="sidebar-brand">
                MY<span>FITNESS</span>
              </div>

              <small>
                PERSONAL FITNESS
              </small>
            </div>
          </div>
        </div>

        <div className="sidebar-user">

          <img
            src={profileImage}
            alt="Profile"
          />

          <div>
            <strong>
              {userName}
            </strong>

            <span>
              {goal.short}
            </span>
          </div>

          <button
            type="button"
            onClick={openProfile}
            aria-label="Open profile"
          >
            →
          </button>

        </div>

        <div className="sidebar-label">
          MAIN MENU
        </div>

        <nav className="sidebar-nav">

          <button
            type="button"
            className={
              activeSection === "overview"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSection("overview")
            }
          >
            <span className="nav-icon">
              ⌂
            </span>

            <span>Overview</span>

            {activeSection ===
              "overview" && (
              <i />
            )}
          </button>

          <button
            type="button"
            className={
              activeSection === "workout"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSection("workout")
            }
          >
            <span className="nav-icon">
              ◈
            </span>

            <span>Workout</span>

            {activeSection ===
              "workout" && <i />}
          </button>

          <button
            type="button"
            className={
              activeSection === "nutrition"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSection("nutrition")
            }
          >
            <span className="nav-icon">
              ◌
            </span>

            <span>Nutrition</span>

            {activeSection ===
              "nutrition" && <i />}
          </button>

          <button
            type="button"
            className={
              activeSection === "progress"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSection("progress")
            }
          >
            <span className="nav-icon">
              ↗
            </span>

            <span>Progress</span>

            {activeSection ===
              "progress" && <i />}
          </button>

          <button
            type="button"
            className={
              activeSection === "achievements"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSection("achievements")
            }
          >
            <span className="nav-icon">
              ✦
            </span>

            <span>Achievements</span>

            {activeSection ===
              "achievements" && <i />}
          </button>

        </nav>

        <div className="sidebar-label profile-label">
          PERSONAL
        </div>

        <nav className="sidebar-nav">

          <button
            type="button"
            onClick={openProfile}
          >
            <span className="nav-icon">
              ◯
            </span>

            <span>My Profile</span>
          </button>

          <button
            type="button"
            onClick={openBodyMetrics}
          >
            <span className="nav-icon">
              ◫
            </span>

            <span>Body Metrics</span>
          </button>

          <button
            type="button"
            onClick={openGoal}
          >
            <span className="nav-icon">
              ◎
            </span>

            <span>Fitness Goal</span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-tip">
            <div className="tip-icon">
              ✦
            </div>

            <div>
              <strong>
                Daily reminder
              </strong>

              <span>
                Consistency beats intensity.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Sign Out
          </button>

        </div>

      </aside>

      {/* ==========================================
          MAIN AREA
      ========================================== */}

      <main className="dashboard-main">

        {/* ========================================
            TOP BAR
        ======================================== */}

        <header className="dashboard-topbar">

          <div className="mobile-logo">
            <img
              src="/myfitness-m-logo.png"
              alt="MyFitness"
            />

            <strong>
              MY<span>FITNESS</span>
            </strong>
          </div>

          <button
            type="button"
            className="ai-search"
            onClick={() =>
              setShowSearch(true)
            }
          >
            <span className="ai-search-icon">
              ✦
            </span>

            <span className="ai-search-text">
              Ask MyFitness AI anything...
            </span>

            <kbd>
              Ctrl K
            </kbd>
          </button>

          <div className="topbar-actions">

            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              onClick={() =>
                alert(
                  "You're all caught up! 🎉"
                )
              }
            >
              ♢
              <span />
            </button>

            <div className="profile-dropdown-wrapper">

              <button
                type="button"
                className="top-profile"
                onClick={() =>
                  setShowProfileMenu(
                    (value) => !value
                  )
                }
              >
                <img
                  src={profileImage}
                  alt="Profile"
                />

                <div>
                  <strong>
                    {userName}
                  </strong>

                  <span>
                    {goal.short}
                  </span>
                </div>

                <b>⌄</b>
              </button>

              {showProfileMenu && (
                <div className="profile-menu">

                  <button
                    type="button"
                    onClick={openProfile}
                  >
                    ◯ &nbsp; View Profile
                  </button>

                  <button
                    type="button"
                    onClick={openBodyMetrics}
                  >
                    ◫ &nbsp; Body Metrics
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    ↪ &nbsp; Sign Out
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* ========================================
            CONTENT
        ======================================== */}

        <div className="dashboard-content">

          {/* ======================================
              HERO
          ====================================== */}

          <section
            id="section-overview"
            className="welcome-section"
          >

            <div className="welcome-copy">

              <div className="date-badge">
                <span />
                {dateText}
              </div>

              <h1>
                Welcome back,
                <br />
                <span>
                  {userName}.
                </span>
              </h1>

              <p>
                Your body knows the way.
                <br />
                Let's make today's session
                count.
              </p>

              <div className="hero-actions">

                <button
                  type="button"
                  className="primary-action"
                  onClick={startWorkout}
                >
                  <span>
                    {workoutStarted
                      ? "Workout Started"
                      : "Start Today's Workout"}
                  </span>

                  <b>→</b>
                </button>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={openGoal}
                >
                  Change Goal
                </button>

              </div>

            </div>

            <div className="welcome-visual">

              <div className="visual-glow" />

              <img
                src="/setup-fitness.jpg"
                alt="Fitness"
              />

              <div className="visual-floating-card">

                <span className="floating-icon">
                  {goal.icon}
                </span>

                <div>
                  <small>
                    CURRENT GOAL
                  </small>

                  <strong>
                    {goal.title}
                  </strong>
                </div>

              </div>

              <div className="visual-number">
                <span>{String(currentStreak.days || 0).padStart(2, "0")}</span>
                <small>
                  DAY · {currentStreak.weekday || "---"}
                </small>
              </div>

            </div>

          </section>

          {/* ======================================
              QUICK STATS
          ====================================== */}

          <section className="stats-grid">

            <article className="stat-card stat-primary">

              <div className="stat-top">
                <span>
                  BMI
                </span>

                <div className="stat-icon">
                  ◫
                </div>
              </div>

              <div className="stat-number">
                {bmiValue}
              </div>

              <div className="stat-bottom">
                <span>
                  {bmiStatus}
                </span>

                <button
                  type="button"
                  onClick={openBodyMetrics}
                >
                  Details →
                </button>
              </div>

            </article>

            <article className="stat-card">

              <div className="stat-top">
                <span>
                  WEIGHT
                </span>

                <div className="stat-icon orange-icon">
                  kg
                </div>
              </div>

              <div className="stat-number">
                {weight}
                <small>
                  kg
                </small>
              </div>

              <div className="stat-bottom">
                <span>
                  Current
                </span>

                <button
                  type="button"
                  onClick={openBodyMetrics}
                >
                  Update →
                </button>
              </div>

            </article>

            <article className="stat-card">

              <div className="stat-top">
                <span>
                  HEIGHT
                </span>

                <div className="stat-icon">
                  ↕
                </div>
              </div>

              <div className="stat-number">
                {height}
                <small>
                  cm
                </small>
              </div>

              <div className="stat-bottom">
                <span>
                  Profile
                </span>

                <button
                  type="button"
                  onClick={openBodyMetrics}
                >
                  Details →
                </button>
              </div>

            </article>

            <article className="stat-card">

              <div className="stat-top">
                <span>
                  AGE
                </span>

                <div className="stat-icon orange-icon">
                  {age}
                </div>
              </div>

              <div className="stat-number">
                {age}
                <small>
                  yrs
                </small>
              </div>

              <div className="stat-bottom">
                <span>
                  Active profile
                </span>

                <button
                  type="button"
                  onClick={openProfile}
                >
                  Profile →
                </button>
              </div>

            </article>

          </section>

          {/* ======================================
              PROFILE + GOAL
          ====================================== */}

          <section className="two-column-section">

            <article
              id="section-profile"
              className="dashboard-card profile-card"
            >

              <div className="card-header">

                <div>
                  <span className="card-eyebrow">
                    YOUR PROFILE
                  </span>

                  <h2>
                    Body Snapshot
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={openProfile}
                >
                  Edit
                </button>

              </div>

              <div className="profile-snapshot">

                <div className="profile-image-large">
                  <img
                    src={profileImage}
                    alt="Profile"
                  />

                  <div className="online-dot" />
                </div>

                <div className="profile-main-info">

                  <h3>
                    {userName}
                  </h3>

                  <p>
                    {gender} ·
                    {age} years
                  </p>

                  <div className="profile-tags">
                    <span>
                      {height} cm
                    </span>

                    <span>
                      {weight} kg
                    </span>

                    <span>
                      {bmiStatus}
                    </span>
                  </div>

                </div>

              </div>

              <div className="profile-detail-grid">

                <div>
                  <small>
                    GENDER
                  </small>

                  <strong>
                    {gender}
                  </strong>
                </div>

                <div>
                  <small>
                    HEIGHT
                  </small>

                  <strong>
                    {height} cm
                  </strong>
                </div>

                <div>
                  <small>
                    WEIGHT
                  </small>

                  <strong>
                    {weight} kg
                  </strong>
                </div>

                <div>
                  <small>
                    BMI
                  </small>

                  <strong>
                    {bmiValue}
                  </strong>
                </div>

              </div>

            </article>

            <article
              className="dashboard-card goal-card"
            >

              <div className="goal-decoration" />

              <div className="card-header goal-header">

                <div>
                  <span className="card-eyebrow">
                    YOUR FOCUS
                  </span>

                  <h2>
                    Fitness Goal
                  </h2>
                </div>

                <span className="goal-icon">
                  {goal.icon}
                </span>

              </div>

              <div className="goal-main">

                <div className="goal-progress-circle">
                  <div>
                    <strong>
                      68
                    </strong>

                    <span>
                      %
                    </span>

                    <small>
                      ON TRACK
                    </small>
                  </div>
                </div>

                <div className="goal-text">

                  <span>
                    CURRENT GOAL
                  </span>

                  <h3>
                    {goal.title}
                  </h3>

                  <p>
                    {goal.description}
                  </p>

                  <button
                    type="button"
                    onClick={openGoal}
                  >
                    Manage Goal
                    <b>→</b>
                  </button>

                </div>

              </div>

              <div className="goal-motivation">
                <span>
                  ✦
                </span>

                <p>
                  Small progress every day
                  creates big results.
                </p>
              </div>

            </article>

          </section>

          {/* ======================================
              WORKOUT SECTION
          ====================================== */}

          <section
            id="section-workout"
            className="workout-section"
          >

            <div className="section-heading">

              <div>
                <span>
                  PERSONALIZED PLAN
                </span>

                <h2>
                  Your Workout
                </h2>
              </div>

              <button
                type="button"
                onClick={startWorkout}
              >
                {workoutStarted
                  ? "Workout Active ✓"
                  : "Start Workout →"}
              </button>

            </div>

            <div className="workout-layout">

              <article className="workout-feature">

                <div className="workout-image">

                  <img
                    src={selectedWorkoutType.image}
                    alt={selectedWorkoutType.title}
                  />

                  <div className="workout-overlay" />

                  <div className="workout-image-label">
                    <span>
                      {goal.title.toUpperCase()}
                    </span>
                  </div>

                  <div className="workout-time">
                    <strong>
                      {selectedLevel.duration}
                    </strong>
                    <span>
                      MIN
                    </span>
                  </div>

                </div>

                <div className="workout-info">

                  <span className="workout-category">
                    {selectedWorkoutType.title} · {selectedLevel.title}
                  </span>

                  <h3>
                    {goal.title} — {selectedWorkoutType.title}
                  </h3>

                  <p>
                    Personalized from your selected workout type,
                    fitness level and fitness goal.
                  </p>

                  <div className="workout-meta">
                    <span>◷ {selectedLevel.duration} min</span>
                    <span>◈ {selectedLevel.title}</span>
                    <span>✦ {selectedLevel.calories} kcal</span>
                  </div>

                  <button
                    type="button"
                    className="workout-start"
                    onClick={startWorkout}
                  >
                    {workoutStarted
                      ? "Workout In Progress"
                      : "Begin Session"}

                    <b>→</b>
                  </button>

                </div>

              </article>

              <div className="exercise-list">

                <div className="exercise-list-header">
                  <span>
                    TODAY'S EXERCISES
                  </span>

                  <strong>
                    {String(selectedExercises.length).padStart(2, "0")}
                  </strong>
                </div>

                {selectedExercises.map((exercise) => (
                  <button
                    type="button"
                    className="exercise-row"
                    key={exercise[0]}
                    onClick={() => setWorkoutStarted(true)}
                  >
                    <span className="exercise-number">
                      {exercise[0]}
                    </span>

                    <span className="exercise-icon">
                      {exercise[3]}
                    </span>

                    <span className="exercise-name">
                      <strong>{exercise[1]}</strong>
                      <small>{exercise[2]}</small>
                    </span>

                    <span className="exercise-arrow">
                      →
                    </span>
                  </button>
                ))}

              </div>

            </div>

          </section>


          <section
            id="section-nutrition"
            className="nutrition-section"
          >

            <div className="section-heading">

              <div>
                <span>
                  FUEL YOUR BODY
                </span>

                <h2>
                  Today's Nutrition
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowTodayMeal(true)}
              >
                Today's Meal →
              </button>

            </div>

            <div className="nutrition-grid">

              <article className="nutrition-feature">

                <div className="nutrition-image">

                  <img
                    src="/nutrition-fitness.jpg"
                    alt="Healthy fitness lifestyle"
                  />

                  <div className="nutrition-image-overlay" />

                  <div className="nutrition-image-content">
                    <span>
                      RECOMMENDED
                    </span>

                    <h3>
                      Protein-focused
                      nutrition
                    </h3>
                  </div>

                </div>

                <div className="nutrition-copy">

                  <div>
                    <span>
                      YOUR GOAL
                    </span>

                    <strong>
                      {goal.short}
                    </strong>
                  </div>

                  <p>
                    Keep your meals balanced
                    with enough protein, fiber
                    and quality carbohydrates.
                  </p>

                </div>

              </article>

              <div className="nutrition-stats">

                <div className="nutrition-stat">

                  <div className="nutrition-stat-icon">
                    ◉
                  </div>

                  <div>
                    <small>
                      PROTEIN
                    </small>

                    <strong>
                      92
                      <span>
                        / 120 g
                      </span>
                    </strong>

                    <div className="mini-progress">
                      <i
                        style={{
                          width: "77%",
                        }}
                      />
                    </div>
                  </div>

                </div>

                <div className="nutrition-stat">

                  <div className="nutrition-stat-icon orange">
                    ◇
                  </div>

                  <div>
                    <small>
                      WATER
                    </small>

                    <strong>
                      1.8
                      <span>
                        / 2.5 L
                      </span>
                    </strong>

                    <div className="mini-progress orange-progress">
                      <i
                        style={{
                          width: "72%",
                        }}
                      />
                    </div>
                  </div>

                </div>

                <div className="nutrition-stat">

                  <div className="nutrition-stat-icon">
                    ✦
                  </div>

                  <div>
                    <small>
                      CALORIES
                    </small>

                    <strong>
                      1,480
                      <span>
                        / 2,100 kcal
                      </span>
                    </strong>

                    <div className="mini-progress">
                      <i
                        style={{
                          width: "70%",
                        }}
                      />
                    </div>
                  </div>

                </div>

                <button
                  type="button"
                  className="meal-reminder"
                  onClick={() => setShowTodayMeal(true)}
                >

                  <span>
                    🥗
                  </span>

                  <div>
                    <strong>
                      Today's Meal
                    </strong>

                    <p>
                      Open today's personalized meal plan
                    </p>
                  </div>

                  <b>
                    →
                  </b>

                </button>

              </div>

            </div>

          </section>

          {showTodayMeal && (
            <>
              <style>{`
                .today-meal-modal {
                  position: fixed;
                  inset: 0;
                  z-index: 9999;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 24px;
                  background: rgba(0, 0, 0, 0.48);
                }
                .today-meal-card {
                  width: min(680px, 100%);
                  max-height: 88vh;
                  overflow-y: auto;
                  background: #fff;
                  border-radius: 24px;
                  padding: 28px;
                  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.2);
                }
                .today-meal-header {
                  display: flex;
                  justify-content: space-between;
                  gap: 20px;
                  align-items: flex-start;
                  margin-bottom: 22px;
                }
                .today-meal-header span {
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: 1.4px;
                }
                .today-meal-header h3 {
                  margin: 7px 0 0;
                  font-size: 24px;
                }
                .today-meal-close {
                  border: 0;
                  background: #f2f2f2;
                  width: 38px;
                  height: 38px;
                  border-radius: 50%;
                  font-size: 25px;
                  cursor: pointer;
                  flex: 0 0 auto;
                }
                .today-meal-targets {
                  padding: 16px 18px;
                  border-radius: 16px;
                  background: #f6f7f4;
                  margin-bottom: 18px;
                }
                .today-meal-targets p, .today-meal-note p {
                  margin: 7px 0 0;
                  line-height: 1.55;
                }
                .today-meal-list {
                  display: grid;
                  gap: 12px;
                }
                .today-meal-item {
                  display: grid;
                  grid-template-columns: 150px 1fr;
                  gap: 16px;
                  padding: 15px 0;
                  border-bottom: 1px solid #ececec;
                }
                .today-meal-time {
                  font-weight: 700;
                }
                .today-meal-item strong {
                  display: block;
                  margin-bottom: 5px;
                }
                .today-meal-item p {
                  margin: 0;
                  line-height: 1.5;
                }
                .today-meal-note {
                  margin-top: 18px;
                  padding: 15px 18px;
                  border-radius: 16px;
                  background: #fff7e8;
                }
                @media (max-width: 600px) {
                  .today-meal-card { padding: 20px; }
                  .today-meal-item { grid-template-columns: 1fr; gap: 5px; }
                }
              `}</style>
              <div
                className="today-meal-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Today's Meal"
              onClick={() => setShowTodayMeal(false)}
            >
              <div
                className="today-meal-card"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="today-meal-header">
                  <div>
                    <span>TODAY'S MEAL</span>
                    <h3>{todayMeal.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="today-meal-close"
                    onClick={() => setShowTodayMeal(false)}
                    aria-label="Close today's meal"
                  >
                    ×
                  </button>
                </div>

                <div className="today-meal-targets">
                  <strong>Daily targets</strong>
                  <p>{todayMeal.targets}</p>
                </div>

                <div className="today-meal-list">
                  {todayMeal.meals.map((item, index) => (
                    <div className="today-meal-item" key={`${item.timing}-${index}`}>
                      <span className="today-meal-time">{item.timing}</span>
                      <div>
                        <strong>{item.meal}</strong>
                        <p><b>Amount:</b> {item.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="today-meal-note">
                  <strong>Note</strong>
                  <p>{todayMeal.note}</p>
                </div>
              </div>
              </div>
            </>
          )}

          {/* ======================================
              BODY METRICS
          ====================================== */}

          <section
            id="section-metrics"
            className="metrics-section"
          >

            <div className="section-heading">

              <div>
                <span>
                  BODY INTELLIGENCE
                </span>

                <h2>
                  Body Metrics
                </h2>
              </div>

              <button
                type="button"
                onClick={openBodyMetrics}
              >
                Update Metrics →
              </button>

            </div>

            <div className="metrics-grid">

              <div className="metric-big-card">

                <div className="metric-circle">

                  <div>
                    <span>
                      BMI
                    </span>

                    <strong>
                      {bmiValue}
                    </strong>

                    <small>
                      {bmiStatus}
                    </small>
                  </div>

                </div>

                <div className="bmi-scale">

                  <span>
                    18.5
                  </span>

                  <div>
                    <i />
                  </div>

                  <span>
                    25
                  </span>

                </div>

                <p>
                  Your BMI is calculated using
                  your current height and weight.
                </p>

              </div>

              <div className="metric-list">

                <div className="metric-item">
                  <span className="metric-item-icon">
                    ↕
                  </span>

                  <div>
                    <small>
                      HEIGHT
                    </small>

                    <strong>
                      {height} cm
                    </strong>
                  </div>

                  <span>
                    Current
                  </span>
                </div>

                <div className="metric-item">
                  <span className="metric-item-icon orange">
                    kg
                  </span>

                  <div>
                    <small>
                      WEIGHT
                    </small>

                    <strong>
                      {weight} kg
                    </strong>
                  </div>

                  <span>
                    Current
                  </span>
                </div>

                <div className="metric-item">
                  <span className="metric-item-icon">
                    ◯
                  </span>

                  <div>
                    <small>
                      GENDER
                    </small>

                    <strong>
                      {gender}
                    </strong>
                  </div>

                  <span>
                    Profile
                  </span>
                </div>

                <div className="metric-item">
                  <span className="metric-item-icon orange">
                    ◷
                  </span>

                  <div>
                    <small>
                      AGE
                    </small>

                    <strong>
                      {age} years
                    </strong>
                  </div>

                  <span>
                    Current
                  </span>
                </div>

              </div>

            </div>

          </section>

          {/* ======================================
              AI COACH
          ====================================== */}
<section className="ai-coach-section">

  <img
    className="ai-coach-image"
    src="/ai-fitness-companion.jpg"
    alt="MyFitness AI Coach"
  />

</section>
          {/* ======================================
              PROGRESS
          ====================================== */}

          <section
            id="section-progress"
            className="progress-section"
          >
            <div className="section-heading">
              <div>
                <span>KEEP MOVING</span>
                <h2>Weekly Progress</h2>
              </div>
              <span className="week-badge">THIS WEEK</span>
            </div>

            <div className="progress-card">
              <div className="progress-summary">
                <span>WEEKLY COMPLETION</span>
                <strong>{weeklyProgress?.completionPercent ?? 0}%</strong>
                <p>Based on completed workout days this week.</p>
                <div className="progress-bar-large">
                  <i style={{ width: `${weeklyProgress?.completionPercent ?? 0}%` }} />
                </div>
              </div>

              <div className="weekly-chart">
                {(weeklyProgress?.days || []).map((day) => (
                  <div className="chart-day" key={day.date}>
                    <div className="chart-column">
                      <i style={{ height: `${day.completed ? 100 : 0}%` }} />
                    </div>
                    <span>{day.day}</span>
                  </div>
                ))}
              </div>

              <div className="progress-facts">
                <div><strong>{weeklyProgress?.workouts ?? 0}</strong><span>Workouts</span></div>
                <div><strong>{(weeklyProgress?.hours ?? 0).toFixed(1)}</strong><span>Hours</span></div>
                <div><strong>{(weeklyProgress?.calories ?? 0).toLocaleString()}</strong><span>Calories</span></div>
              </div>
            </div>
          </section>

          {/* ======================================
              ACHIEVEMENTS
          ====================================== */}
          <section
            id="section-achievements"
            className="achievements-section"
          >
            <div className="section-heading">
              <div>
                <span>MILESTONES</span>
                <h2>Achievements</h2>
              </div>
              <button type="button" onClick={() => handleSection("achievements")}>View All →</button>
            </div>

            <div className="achievement-grid">
              {achievements.map((achievement) => (
                <article
                  className={`achievement-card ${achievement.unlocked ? "unlocked" : ""}`}
                  key={achievement.code}
                >
                  <div className="achievement-badge">{achievement.icon}</div>
                  <span>{achievement.target === 1 ? "FIRST" : `${achievement.target} ${achievement.code === "MOMENTUM" ? "WORKOUTS" : "DAYS"}`}</span>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                  <small>
                    {achievement.unlocked ? "UNLOCKED" : `${achievement.progress} / ${achievement.target}`}
                  </small>
                </article>
              ))}
            </div>
          </section>

          {/* ======================================
              BOTTOM BANNER
          ====================================== */}

          <section className="motivation-banner">

            <img
              src="/dashboard-bottom-banner.jpg"
              alt="Fitness motivation"
            />

            <div className="motivation-overlay" />

            <div className="motivation-content">

              <span>
                MYFITNESS
              </span>

              <h2>
                Strong body.
                <br />
                <em>
                  Strong mind.
                </em>
              </h2>

              <p>
                Every rep is a vote for
                the person you want to become.
              </p>

              <button
                type="button"
                onClick={startWorkout}
              >
                Keep Going
                <b>
                  →
                </b>
              </button>

            </div>

            <div className="motivation-number">
              09
              <small>
                / 09
              </small>
            </div>

          </section>

          {/* ======================================
              FOOTER
          ====================================== */}

          <footer className="dashboard-footer">

            <div>
              <strong>
                MY<span>FITNESS</span>
              </strong>

              <p>
                Train smarter. Move stronger.
              </p>
            </div>

            <div className="footer-links">

              <button
                type="button"
                onClick={openProfile}
              >
                Profile
              </button>

              <button
                type="button"
                onClick={openBodyMetrics}
              >
                Body Metrics
              </button>

              <button
                type="button"
                onClick={openGoal}
              >
                Goal
              </button>

            </div>

            <span>
              09 / 09
            </span>

          </footer>

        </div>
      </main>

      {/* ==========================================
          AI SEARCH MODAL
      ========================================== */}

      {showSearch && (
        <div
          className="search-modal-backdrop"
          onClick={() =>
            setShowSearch(false)
          }
        >

          <div
            className="search-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="search-modal-top">

              <div className="search-modal-icon">
                ✦
              </div>

              <div>
                <span>
                  MYFITNESS AI
                </span>

                <h2>
                  What do you need?
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSearch(false)
                }
              >
                ×
              </button>

            </div>

            <div className="search-input-wrapper">

              <span>
                ⌕
              </span>

              <input
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search workout, nutrition, progress..."
              />

              <kbd>
                ESC
              </kbd>

            </div>

            <div className="search-results">

              {filteredSearch.length > 0 ? (
                filteredSearch.map(
                  (item) => (
                    <button
                      type="button"
                      key={item.section}
                      onClick={() =>
                        handleSearchSelect(
                          item.section
                        )
                      }
                    >
                      <span>
                        ✦
                      </span>

                      <div>
                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          Open {item.name}
                        </small>
                      </div>

                      <b>
                        →
                      </b>
                    </button>
                  )
                )
              ) : (
                <div className="no-search-result">
                  <span>
                    ◌
                  </span>

                  <strong>
                    Nothing found
                  </strong>

                  <p>
                    Try workout, nutrition,
                    profile or progress.
                  </p>
                </div>
              )}

            </div>
              
            <div className="search-modal-footer">
              <span>
                AI-powered fitness dashboard
              </span>

              <span>
                MYFITNESS
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;