import { motion } from "framer-motion";
import { Dumbbell, Check } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  completed: boolean;
}

interface WorkoutTrackerProps {
  exercises: Exercise[];
  onToggleExercise: (id: string) => void;
}

const WorkoutTracker = ({ exercises, onToggleExercise }: WorkoutTrackerProps) => {
  const completedCount = exercises.filter((e) => e.completed).length;
  const pointsEarned = completedCount * 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-elevated-hover p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-display text-lg font-semibold">Today's Workout</h3>
        </div>
        <span className="points-badge points-positive">+{pointsEarned} pts</span>
      </div>

      {/* Day Label */}
      <div className="mb-4">
        <span className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long" })} — Chest Day
        </span>
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        {exercises.map((exercise, index) => (
          <motion.button
            key={exercise.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => onToggleExercise(exercise.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
              exercise.completed
                ? "bg-success/5 border border-success/20"
                : "bg-muted/50 border border-transparent hover:border-border hover:bg-muted"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                exercise.completed
                  ? "bg-success text-white"
                  : "bg-background border-2 border-border"
              }`}
            >
              {exercise.completed && <Check className="w-4 h-4" />}
            </div>
            <span
              className={`font-medium text-left ${
                exercise.completed ? "text-success line-through" : "text-foreground"
              }`}
            >
              {exercise.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Workout Progress</span>
          <span className="font-semibold text-foreground">
            {completedCount}/{exercises.length} completed
          </span>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / exercises.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WorkoutTracker;
