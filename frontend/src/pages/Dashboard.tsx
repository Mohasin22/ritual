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
import { JUNK_MENU } from "@/data/junkMenu";
import { HARM_LEVEL_RULES } from "@/data/junkHelpers";
import { CheckCircle } from "lucide-react";

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

  interface JunkLog {
  itemId: string;
  quantity: number;
  timestamp: string;
}
  useEffect(() => {
  const saved = localStorage.getItem("junkLogs");
  if (saved) {
    setJunkLogs(JSON.parse(saved));
  }
}, []);

interface LoggedJunk {
  id: string;
  itemId: string;
  quantity: number;
  timestamp: string;
}

const [junkLogs, setJunkLogs] = useState<LoggedJunk[]>([]);




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

const calculateJunkPenalty = (logs: JunkLog[]) => {
  const today = new Date().toISOString().split("T")[0];
  const levelCount: Record<number, number> = {};

  logs
    .filter(l => l.timestamp.startsWith(today))
    .forEach(log => {
      const item = JUNK_MENU.foods.find(f => f.id === log.itemId);
      if (!item) return;

      levelCount[item.harm_level] =
        (levelCount[item.harm_level] || 0) + log.quantity;
    });

  let penalty = 0;
  Object.entries(levelCount).forEach(([lvl, count]) => {
    const rule = HARM_LEVEL_RULES[Number(lvl)];
    const extra = Math.max(0, count - rule.free);
    penalty += extra * rule.penalty;
  });

  return penalty;
};

const today = new Date().toISOString().split("T")[0];

const todaysJunk = junkLogs.filter((j) =>
  j.timestamp.startsWith(today)
);

  /* ---------------- POINT CALCULATION ---------------- */

  const stepPoints = (() => {
    if (savedStepCount < 6000) return 0;
    let points = 30;
    const additional = Math.min(savedStepCount, 10000) - 6000;
    points += Math.floor(additional / 1000) * 5;
    return Math.min(points, 50);
  })();

  const workoutPoints = exercises.filter(e => e.completed).length * 20;

  

  const junkPenaltyToday = calculateJunkPenalty(junkLogs);

  const pointsGained = stepPoints + workoutPoints;
  const finalPoints = Math.max(pointsGained - junkPenaltyToday, 0);

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

    
    const junkPts = junkPenaltyToday;

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
      
      {/* LEFT: MAIN CONTENT */}
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

        <div className="card-elevated p-4">
  <h3 className="font-display font-semibold mb-3">
    Today’s Junk
  </h3>

  {todaysJunk.length === 0 ? (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
      <CheckCircle className="w-5 h-5 text-emerald-600" />
      <p className="text-sm text-emerald-700 font-medium">
        No junk logged today 🎉
      </p>
    </div>
  ) : (
    <div className="space-y-2">
      {todaysJunk.map((log) => {
        const item = JUNK_MENU.foods.find(
          (f) => f.id === log.itemId
        );
        if (!item) return null;

        return (
          <div
            key={log.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40"
          >
            <span className="text-sm font-medium">
              {item.name}
            </span>
            <span className="text-sm text-muted-foreground">
              ×{log.quantity}
            </span>
          </div>
        );
      })}
    </div>
  )}
</div>

      </div>

      {/* RIGHT: SIDEBAR */}
      <div className="space-y-6">
        <PointsSummary
          totalPoints={totalPoints}
          pointsGained={pointsGained}
          pointsDeducted={junkPenaltyToday}
          todayPoints={finalPoints}
        />

        <VitalsPanel
          stepProgress={Math.round((savedStepCount / stepGoal) * 100)}
          workoutProgress={workoutProgress}
          junkImpact={
            junkPenaltyToday === 0
              ? "low"
              : junkPenaltyToday < 50
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
