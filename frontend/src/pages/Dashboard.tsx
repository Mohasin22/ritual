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

  const [stepCount, setStepCount] = useState(8500);
  const stepGoal = 10000;

  const [dayWorkoutName, setDayWorkoutName] = useState("Rest Day");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedJunk, setSelectedJunk] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [workoutProgress, setWorkoutProgress] = useState(0);
  const [workoutPlan, setWorkoutPlan] = useState<Record<string, WorkoutDay>>({});

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
    } catch (err) {
      console.error("Error sending steps", err);
    }
  };

  /* ---------------- FETCH WORKOUT DATA ---------------- */
  useEffect(() => {
    if (!accessToken) return;

    fetch("http://localhost:8000/user/points-summary", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setTotalPoints(data.total_points || 0);
      });

    // Fetch workout plan for weekly display
    fetch("http://localhost:8000/user/workout-plan", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.workout_plan) {
          setWorkoutPlan(data.workout_plan);
        }
      });
  }, [accessToken]);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const currentDay = getDayOfWeek();

        const planRes = await fetch(
          "http://localhost:8000/user/workout-plan",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!planRes.ok) throw new Error("Workout plan fetch failed");

        const planData = await planRes.json();

        const completionRes = await fetch(
          "http://localhost:8000/user/workout-completion",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!completionRes.ok)
          throw new Error("Workout completion fetch failed");

        const completionData = await completionRes.json();

        const todaysPlan: WorkoutDay | undefined =
          planData.workout_plan?.[currentDay];

        if (todaysPlan) {
          setDayWorkoutName(
            todaysPlan.name?.trim() ? todaysPlan.name : "Rest Day"
          );

          const mappedExercises: Exercise[] = todaysPlan.exercises.map(
            (name, index) => {
              const id = `${currentDay}-${index}`;
              return {
                id,
                name,
                completed:
                  completionData.completed_exercises?.[id] ?? false,
              };
            }
          );

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
      } catch (err) {
        console.error("Error loading workout", err);
        setDayWorkoutName("Rest Day");
        setExercises([]);
        setWorkoutProgress(0);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
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

      await fetch("http://localhost:8000/user/workout-completion", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ completed_exercises: payload }),
      });
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

  useEffect(() => {
    setTotalPoints(Math.max(pointsGained - pointsDeducted, 0));
  }, [pointsGained, pointsDeducted]);

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

          <StepsTracker
            stepCount={stepCount}
            stepGoal={stepGoal}
            onStepCountChange={setStepCount}
          />

          <button
            onClick={submitSteps}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Save Steps
          </button>

          <WorkoutTracker
            exercises={exercises}
            onToggleExercise={handleToggleExercise}
            dayName={`${getDayOfWeek()[0].toUpperCase()}${getDayOfWeek().slice(
              1
            )} – ${dayWorkoutName}`}
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
