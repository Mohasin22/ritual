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

// Mock API endpoints - ready for FastAPI + Supabase integration
// POST /api/daily-log - Submit daily activity
// GET /api/today-plan - Fetch today's plan and current points

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
  const [stepCount, setStepCount] = useState(8500);
  const stepGoal = 10000;
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedJunk, setSelectedJunk] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

    const submitSteps = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await axios.post(
          "http://127.0.0.1:8000/activity/steps",
          null,
          {
            params: { steps: stepCount },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Backend response:", res.data);
      } catch (err) {
        console.error("Error sending steps", err);
      }
    };

  // Get current day of week
  const getDayOfWeek = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[new Date().getDay()];
  };

  // Fetch workout plan and completion status on mount
  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch workout plan
        const planResponse = await fetch(
          "http://localhost:8000/user/workout-plan",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!planResponse.ok) {
          throw new Error("Failed to fetch workout plan");
        }

        const planData = await planResponse.json();

        // Fetch completion status
        const completionResponse = await fetch(
          "http://localhost:8000/user/workout-completion",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!completionResponse.ok) {
          throw new Error("Failed to fetch workout completion");
        }

        const completionData = await completionResponse.json();

        // Get today's workout from the plan
        const currentDay = getDayOfWeek();
        const todaysPlan = planData.workout_plan[currentDay] as WorkoutDay | undefined;

        if (todaysPlan && todaysPlan.exercises.length > 0) {
          // Create exercises array from the plan
          const newExercises = todaysPlan.exercises.map((name: string, index: number) => {
            const exerciseId = `${currentDay}-${index}`;
            return {
              id: exerciseId,
              name: name,
              completed: completionData.completed_exercises[exerciseId] || false,
            };
          });

          setExercises(newExercises);
        } else {
          // Default exercises if no plan
          setExercises([
            { id: "1", name: "Push Ups (3 sets x 15)", completed: false },
            { id: "2", name: "Bench Press (4 sets x 12)", completed: false },
            { id: "3", name: "Chest Flyes (3 sets x 12)", completed: false },
            { id: "4", name: "Plank (3 x 1 min)", completed: false },
          ]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching workout data", err);
        // Fallback to default exercises
        setExercises([
          { id: "1", name: "Push Ups (3 sets x 15)", completed: false },
          { id: "2", name: "Bench Press (4 sets x 12)", completed: false },
          { id: "3", name: "Chest Flyes (3 sets x 12)", completed: false },
          { id: "4", name: "Plank (3 x 1 min)", completed: false },
        ]);
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [accessToken]);

  const handleToggleExercise = (id: string) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );

    // Save completion status to backend
    saveWorkoutCompletion();
  };

  const handleAddJunk = (id: string) => {
    setSelectedJunk((prev) => [...prev, id]);
  };

  const handleRemoveJunk = (id: string) => {
    setSelectedJunk((prev) => prev.filter((j) => j !== id));
  };

  const saveWorkoutCompletion = async () => {
    if (!accessToken) return;

    try {
      const completionData = exercises.reduce((acc, exercise) => {
        acc[exercise.id] = exercise.completed;
        return acc;
      }, {} as Record<string, boolean>);

      await fetch("http://localhost:8000/user/workout-completion", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          completed_exercises: completionData,
        }),
      });
    } catch (err) {
      console.error("Error saving workout completion", err);
    }
  };

  // Calculate points
  const stepPoints = Math.floor(stepCount / 1000) * 10;
  const workoutPoints = exercises.filter((e) => e.completed).length * 20;
  const pointsGained = stepPoints + workoutPoints;

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

  const totalPoints = Math.max(pointsGained - pointsDeducted, 0);

  // Calculate vitals
  const stepProgress = Math.round((stepCount / stepGoal) * 100);
  const workoutProgress = exercises.length > 0 ? Math.round(
    (exercises.filter((e) => e.completed).length / exercises.length) * 100
  ) : 0;
  const junkImpact: "low" | "medium" | "high" =
    pointsDeducted === 0 ? "low" : pointsDeducted < 50 ? "medium" : "high";

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
        {/* Left Column - Main Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyPlan />
          <StepsTracker
            stepCount={stepCount}
            stepGoal={stepGoal}
            onStepCountChange={setStepCount}
          />
          <button
            onClick={submitSteps}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Save Steps (Test)
          </button>
          <WorkoutTracker
            exercises={exercises}
            onToggleExercise={handleToggleExercise}
            dayName={getDayOfWeek().charAt(0).toUpperCase() + getDayOfWeek().slice(1)}
          />
          <JunkTracker
            selectedJunk={selectedJunk}
            onAddJunk={handleAddJunk}
            onRemoveJunk={handleRemoveJunk}
          />
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <PointsSummary
            totalPoints={totalPoints}
            pointsGained={pointsGained}
            pointsDeducted={pointsDeducted}
          />
          <VitalsPanel
            stepProgress={stepProgress}
            workoutProgress={workoutProgress}
            junkImpact={junkImpact}
            currentStreak={18}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
