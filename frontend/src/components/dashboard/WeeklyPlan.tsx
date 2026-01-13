import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export interface WorkoutDay {
  name: string;
  exercises: string[];
}

interface WeeklyPlanProps {
  workoutPlan: Record<string, WorkoutDay>;
}

const daysOfWeek = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

const WeeklyPlan = ({ workoutPlan }: WeeklyPlanProps) => {
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1; // Adjust for Mon-Sun

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold">Weekly Plan</h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((item, index) => {
          const workoutDay = workoutPlan[item.key];
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className={`flex flex-col items-center p-3 rounded-xl text-center transition-all ${
                index === adjustedToday
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50"
              }`}
            >
              <span
                className={`text-xs font-semibold mb-2 ${
                  index === adjustedToday ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`text-xs font-medium truncate w-full ${
                  index === adjustedToday ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {workoutDay?.name?.trim() ? workoutDay.name : "Rest Day"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WeeklyPlan;
