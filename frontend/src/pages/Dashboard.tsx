import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import PointsSummary from "@/components/dashboard/PointsSummary";
import StepsTracker from "@/components/dashboard/StepsTracker";
import WorkoutTracker from "@/components/dashboard/WorkoutTracker";
import JunkTracker from "@/components/dashboard/JunkTracker";
import VitalsPanel from "@/components/dashboard/VitalsPanel";
import WeeklyPlan from "@/components/dashboard/WeeklyPlan";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

/* ---------------- TYPES ---------------- */

interface Exercise {
  id: string;
  name: string;
  completed: boolean;
}

interface WorkoutDay {
  name: string;
  exercises: string[];
}

/* ---------------- COMPONENT ---------------- */

const Dashboard = () => {
  const { accessToken } = useAuth();

  /* ---------------- STATE ---------------- */

  const [stepCount, setStepCount] = useState(() => {
    const saved = localStorage.getItem("stepCount");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [savedStepCount, setSavedStepCount] = useState(stepCount);
  const stepGoal = 10000;

  const [dayWorkoutName, setDayWorkoutName] = useState("Rest Day");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedJunk, setSelectedJunk] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalPoints, setTotalPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);

  const [workoutProgress, setWorkoutProgress] = useState(0);
  const [workoutPlan, setWorkoutPlan] = useState<Record<string, WorkoutDay>>({});
  const [currentStreak, setCurrentStreak] = useState(0);

  /* ---------------- HELPERS ---------------- */

  const getDayOfWeek = () => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[new Date().getDay()];
  };

  const calculateStepPoints = (steps: number) => {
  if (steps < 6000) return 0;
  let points = 30;
  const additional = Math.min(steps, 10000) - 6000;
  points += Math.floor(additional / 1000) * 5;
  return Math.min(points, 50);
};
  /* ---------------- POINT CALCULATION ---------------- */

  const stepPoints = (() => {
    if (savedStepCount < 6000) return 0;
    let points = 30;
    const additional = Math.min(savedStepCount, 10000) - 6000;
    points += Math.floor(additional / 1000) * 5;
    return Math.min(points, 50);
  })();

  const workoutPoints = exercises.filter(e => e.completed).length * 20;

  const junkPenalties: Record<string, number> = {
    burger: 30,
    pizza: 25,
    fries: 20,
    soda: 15,
    candy: 20,
    icecream: 25,
  };

  const pointsDeducted = selectedJunk.reduce(
    (sum, id) => sum + (junkPenalties[id] || 0),
    0
  );

  const pointsGained = stepPoints + workoutPoints;
  const finalPoints = Math.max(pointsGained - pointsDeducted, 0);

  /* ---------------- FETCH DASHBOARD ---------------- */

  useEffect(() => {
    if (!accessToken) return;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/user/dashboard-summary", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await res.json();

        if (data.workout_plan) setWorkoutPlan(data.workout_plan);

        const today = getDayOfWeek();
        const todaysPlan = data.workout_plan?.[today];

        if (todaysPlan) {
          setDayWorkoutName(todaysPlan.name || "Rest Day");
          const mapped = todaysPlan.exercises.map(
            (name: string, index: number) => ({
              id: `${today}-${index}`,
              name,
              completed: data.completed_exercises?.[`${today}-${index}`] ?? false,
            })
          );
          setExercises(mapped);
        }

        setTotalPoints(data.points_summary?.total_points || 0);
        setTodayPoints(data.points_summary?.today_points || 0);
        setCurrentStreak(data.current_streak || 0);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [accessToken]);

  /* ---------------- SAVE DAY (ONLY PLACE THAT SAVES) ---------------- */

  const saveWorkoutCompletion = async (
    exercisesToSave: Exercise[],
    pointsToSave: number
  ) => {
    if (!accessToken) return;

    const payload = exercisesToSave.reduce<Record<string, boolean>>(
      (acc, ex) => {
        acc[ex.id] = ex.completed;
        return acc;
      },
      {}
    );

    await fetch("http://localhost:8000/user/workout-completion", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        completed_exercises: payload,
        points: pointsToSave,
      }),
    });
  };

  const submitSteps = async () => {
  try {
    // ✅ calculate points FIRST from current stepCount
    const stepPts = calculateStepPoints(stepCount);
    const workoutPts = exercises.filter(e => e.completed).length * 20;

    const junkPts = selectedJunk.reduce(
      (sum, id) => sum + (junkPenalties[id] || 0),
      0
    );

    const pointsGainedNow = stepPts + workoutPts;
    const finalPointsNow = Math.max(pointsGainedNow - junkPts, 0);

    // ✅ send steps
    await axios.post(
      "http://127.0.0.1:8000/activity/steps",
      null,
      {
        params: { steps: stepCount },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // ✅ update saved steps AFTER calculation
    setSavedStepCount(stepCount);
    localStorage.setItem("stepCount", stepCount.toString());

    // ✅ save correct points
    await saveWorkoutCompletion(exercises, finalPointsNow);

    // ✅ update UI immediately
    setTodayPoints(finalPointsNow);

    window.dispatchEvent(new Event("refresh-leaderboard"));
  } catch (err) {
    console.error("Save failed", err);
  }
};


  /* ---------------- UI HANDLERS ---------------- */

  const handleToggleExercise = (id: string) => {
    setExercises(prev => {
      const updated = prev.map(e =>
        e.id === id ? { ...e, completed: !e.completed } : e
      );

      const completed = updated.filter(e => e.completed).length;
      setWorkoutProgress(
        updated.length > 0
          ? Math.round((completed / updated.length) * 100)
          : 0
      );

      return updated;
    });
  };

  const handleAddJunk = (id: string) =>
    setSelectedJunk(prev => [...prev, id]);

  const handleRemoveJunk = (id: string) =>
    setSelectedJunk(prev => prev.filter(j => j !== id));

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-500">Loading your workout...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeeklyPlan workoutPlan={workoutPlan} />

          <StepsTracker
            stepCount={stepCount}
            stepGoal={stepGoal}
            onStepCountChange={setStepCount}
          />

          <button
            onClick={submitSteps}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Save Day
          </button>

          <WorkoutTracker
            exercises={exercises}
            onToggleExercise={handleToggleExercise}
            dayName={`${getDayOfWeek()} – ${dayWorkoutName}`}
          />

          <JunkTracker
            selectedJunk={selectedJunk}
            onAddJunk={handleAddJunk}
            onRemoveJunk={handleRemoveJunk}
          />
        </div>

        <div className="space-y-6">
          <PointsSummary
            totalPoints={totalPoints}
            pointsGained={pointsGained}
            pointsDeducted={pointsDeducted}
            todayPoints={todayPoints}
          />
          <VitalsPanel
            stepProgress={Math.round((savedStepCount / stepGoal) * 100)}
            workoutProgress={workoutProgress}
            junkImpact={
              pointsDeducted === 0
                ? "low"
                : pointsDeducted < 50
                ? "medium"
                : "high"
            }
            currentStreak={currentStreak}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
