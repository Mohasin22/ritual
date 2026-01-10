import { motion } from "framer-motion";
import { Activity, Target, Flame, Heart } from "lucide-react";

interface VitalsPanelProps {
  stepProgress: number;
  workoutProgress: number;
  junkImpact: "low" | "medium" | "high";
  currentStreak: number;
}

const VitalsPanel = ({ stepProgress, workoutProgress, junkImpact, currentStreak }: VitalsPanelProps) => {
  const impactColor = {
    low: "text-success",
    medium: "text-warning",
    high: "text-destructive",
  };

  const impactBg = {
    low: "bg-success/5",
    medium: "bg-warning/5",
    high: "bg-destructive/5",
  };

  const impactBorder = {
    low: "border-success/20",
    medium: "border-warning/20",
    high: "border-destructive/20",
  };

  const vitals = [
    {
      icon: Target,
      label: "Steps Goal",
      value: `${stepProgress}%`,
      color: stepProgress >= 100 ? "text-success" : "text-primary",
      bg: stepProgress >= 100 ? "bg-success/5" : "bg-primary/5",
      border: stepProgress >= 100 ? "border-success/20" : "border-primary/20",
    },
    {
      icon: Activity,
      label: "Workout",
      value: `${workoutProgress}%`,
      color: workoutProgress >= 100 ? "text-success" : "text-accent",
      bg: workoutProgress >= 100 ? "bg-success/5" : "bg-accent/5",
      border: workoutProgress >= 100 ? "border-success/20" : "border-accent/20",
    },
    {
      icon: Heart,
      label: "Junk Impact",
      value: junkImpact.toUpperCase(),
      color: impactColor[junkImpact],
      bg: impactBg[junkImpact],
      border: impactBorder[junkImpact],
    },
    {
      icon: Flame,
      label: "Streak",
      value: `${currentStreak} days`,
      color: "text-streak-accent",
      bg: "bg-streak-accent/5",
      border: "border-streak-accent/20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-elevated p-6"
    >
      <h3 className="font-display text-lg font-semibold mb-6">Daily Vitals</h3>

      <div className="grid grid-cols-2 gap-3">
        {vitals.map((vital, index) => {
          const Icon = vital.icon;
          return (
            <motion.div
              key={vital.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`${vital.bg} ${vital.border} border rounded-xl p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${vital.color}`} />
                <span className="text-xs text-muted-foreground font-medium">{vital.label}</span>
              </div>
              <span className={`font-display text-xl font-bold ${vital.color}`}>
                {vital.value}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default VitalsPanel;
