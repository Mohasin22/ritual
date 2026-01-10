import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import PointsSummary from "@/components/dashboard/PointsSummary";
import StepsTracker from "@/components/dashboard/StepsTracker";
import WorkoutTracker from "@/components/dashboard/WorkoutTracker";
import JunkTracker from "@/components/dashboard/JunkTracker";
import VitalsPanel from "@/components/dashboard/VitalsPanel";
import WeeklyPlan from "@/components/dashboard/WeeklyPlan";

// Mock API endpoints - ready for FastAPI + Supabase integration
// POST /api/daily-log - Submit daily activity
// GET /api/today-plan - Fetch today's plan and current points

const Dashboard = () => {
  const [stepCount, setStepCount] = useState(8500);
  const stepGoal = 10000;

  const [exercises, setExercises] = useState([
    { id: "1", name: "Push Ups (3 sets x 15)", completed: true },
    { id: "2", name: "Bench Press (4 sets x 12)", completed: true },
    { id: "3", name: "Chest Flyes (3 sets x 12)", completed: false },
    { id: "4", name: "Plank (3 x 1 min)", completed: false },
  ]);

  const [selectedJunk, setSelectedJunk] = useState<string[]>([]);

  const handleToggleExercise = (id: string) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const handleAddJunk = (id: string) => {
    setSelectedJunk((prev) => [...prev, id]);
  };

  const handleRemoveJunk = (id: string) => {
    setSelectedJunk((prev) => prev.filter((j) => j !== id));
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
  const workoutProgress = Math.round(
    (exercises.filter((e) => e.completed).length / exercises.length) * 100
  );
  const junkImpact: "low" | "medium" | "high" =
    pointsDeducted === 0 ? "low" : pointsDeducted < 50 ? "medium" : "high";

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
          <WorkoutTracker
            exercises={exercises}
            onToggleExercise={handleToggleExercise}
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
