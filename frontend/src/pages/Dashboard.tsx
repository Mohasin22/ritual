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

interface Exercise {
  id: string;
  name: string;
  completed: boolean;
}

interface WorkoutDay {
  name: string;
  exercises: string[];
}

const Dashboard = () => {
  const { accessToken } = useAuth();

  const [stepCount, setStepCount] = useState(() => {
    // Persist stepCount in localStorage
    const saved = localStorage.getItem("stepCount");
    return saved ? parseInt(saved, 10) : 8500;
  });
  const [savedStepCount, setSavedStepCount] = useState(stepCount);
  const stepGoal = 10000;

  const [dayWorkoutName, setDayWorkoutName] = useState("Rest Day");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedJunk, setSelectedJunk] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [workoutProgress, setWorkoutProgress] = useState(0);
  const [workoutPlan, setWorkoutPlan] = useState<Record<string, WorkoutDay>>({});
  const [currentStreak, setCurrentStreak] = useState(0);

  /* ---------------- DAY HELPERS ---------------- */

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

  /* ---------------- STEPS ---------------- */

  const submitSteps = async () => {
    try {
      // Send steps twice (jugad)
      await axios.post(
        "http://127.0.0.1:8000/activity/steps",
        null,
        {
          params: { steps: stepCount },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      await axios.post(
        "http://127.0.0.1:8000/activity/steps",
        null,
        {
          params: { steps: stepCount },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSavedStepCount(stepCount);
      localStorage.setItem("stepCount", stepCount.toString());
      // Save workout completion with current exercises and points after saving steps
      await saveWorkoutCompletion(exercises);
      // Notify leaderboard to refresh
      window.dispatchEvent(new Event("refresh-leaderboard"));
    } catch (err) {
      console.error("Error sending steps", err);
    }
  };

  /* ---------------- FETCH WORKOUT DATA ---------------- */
  useEffect(() => {
    if (!accessToken) return;
    const fetchDashboardSummary = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/user/dashboard-summary", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error("Dashboard summary fetch failed");
        const data = await res.json();
        // Set workout plan
        if (data.workout_plan) setWorkoutPlan(data.workout_plan);
        // Set today's exercises
        const currentDay = getDayOfWeek();
        const todaysPlan = data.workout_plan?.[currentDay];
        if (todaysPlan) {
          setDayWorkoutName(todaysPlan.name?.trim() ? todaysPlan.name : "Rest Day");
          const mappedExercises = todaysPlan.exercises.map((name: string, index: number) => {
            const id = `${currentDay}-${index}`;
            return {
              id,
              name,
              completed: data.completed_exercises?.[id] ?? false,
            };
          });
          setExercises(mappedExercises);
          const completedExercises = mappedExercises.filter((e) => e.completed).length;
          setWorkoutProgress(
            mappedExercises.length > 0
              ? Math.round((completedExercises / mappedExercises.length) * 100)
              : 0
          );
        } else {
          setDayWorkoutName("Rest Day");
          setExercises([]);
          setWorkoutProgress(0);
        }
        // Set points
        if (data.points_summary) {
          setTotalPoints(data.points_summary.total_points || 0);
        }
        // Set streak if available (optional, if you want to use it)
        // setCurrentStreak(...)
      } catch (err) {
        console.error("Error loading dashboard summary", err);
        setDayWorkoutName("Rest Day");
        setExercises([]);
        setWorkoutProgress(0);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardSummary();
  }, [accessToken]);

  /* ---------------- SAVE COMPLETION ---------------- */

  const saveWorkoutCompletion = async (updated: Exercise[]) => {
    if (!accessToken) return;

    try {
      const payload = updated.reduce<Record<string, boolean>>(
        (acc, ex) => {
          acc[ex.id] = ex.completed;
          return acc;
        },
        {}
      );

      // Save only the final points for the day
      await fetch("http://localhost:8000/user/workout-completion", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          completed_exercises: payload,
          points: finalPoints,
        }),
      });
      // Notify leaderboard to refresh
      window.dispatchEvent(new Event("refresh-leaderboard"));
    } catch (err) {
      console.error("Failed to save completion", err);
    }
  };

  const handleToggleExercise = (id: string) => {
    setExercises((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, completed: !e.completed } : e
      );
      saveWorkoutCompletion(updated);
      const completedExercises = updated.filter((e) => e.completed).length;
      setWorkoutProgress(
        updated.length > 0
          ? Math.round((completedExercises / updated.length) * 100)
          : 0
      );
      return updated;
    });
  };

  /* ---------------- JUNK ---------------- */

  const handleAddJunk = (id: string) => {
    setSelectedJunk((prev) => [...prev, id]);
  };

  const handleRemoveJunk = (id: string) => {
    setSelectedJunk((prev) => prev.filter((j) => j !== id));
  };

  /* ---------------- POINTS ---------------- */
  // Point calculation logic
  // Steps points: 0 points below 6k, 30 points at 6k, +5 for each 1k steps up to 10k (max 50)
  const stepPoints = (() => {
    if (savedStepCount < 6000) return 0;
    let points = 30;
    const additionalSteps = Math.min(savedStepCount, 10000) - 6000;
    points += Math.floor(additionalSteps / 1000) * 5;
    return Math.min(points, 50);
  })();
  
  const workoutPoints = exercises.filter((e) => e.completed).length * 20;
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

  useEffect(() => {
    setTotalPoints(finalPoints);
  }, [finalPoints]);

  const stepProgress = Math.round((stepCount / stepGoal) * 100);

  const junkImpact: "low" | "medium" | "high" =
    pointsDeducted === 0
      ? "low"
      : pointsDeducted < 50
      ? "medium"
      : "high";

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-500">
            Loading your workout...
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeeklyPlan workoutPlan={workoutPlan} />
          <div>
            <StepsTracker
              stepCount={stepCount}
              stepGoal={stepGoal}
              onStepCountChange={setStepCount}
            />
            <button
              onClick={submitSteps}
              className="px-4 py-2 bg-green-500 text-white rounded-lg mt-2"
            >
              Save Steps
            </button>
          </div>
          <WorkoutTracker
            exercises={exercises}
            onToggleExercise={handleToggleExercise}
            dayName={`${getDayOfWeek()[0].toUpperCase()}${getDayOfWeek().slice(1)} – ${dayWorkoutName}`}
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
          />
          <VitalsPanel
            stepProgress={Math.round((savedStepCount / stepGoal) * 100)}
            workoutProgress={workoutProgress}
            junkImpact={junkImpact}
            currentStreak={currentStreak}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
