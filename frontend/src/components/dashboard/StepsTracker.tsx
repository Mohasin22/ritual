import { motion } from "framer-motion";
import { Footprints } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface StepsTrackerProps {
  stepCount: number;
  stepGoal: number;
  onStepCountChange: (value: number) => void;
}

const StepsTracker = ({ stepCount, stepGoal, onStepCountChange }: StepsTrackerProps) => {
  const progress = Math.min((stepCount / stepGoal) * 100, 100);
  const pointsEarned = Math.floor(stepCount / 1000) * 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-elevated-hover p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Footprints className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">Steps Today</h3>
        </div>
        <span className="points-badge points-positive">+{pointsEarned} pts</span>
      </div>

      {/* Progress Ring */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
              animate={{ strokeDashoffset: 251.2 - (progress / 100) * 251.2 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-3xl font-bold text-foreground">{stepCount.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">/ {stepGoal.toLocaleString()}</span>
          </div>
          <p className="text-muted-foreground text-sm">steps completed</p>
        </div>
      </div>

      {/* Slider Input */}
      <div className="space-y-3">
        <label className="text-sm text-muted-foreground">Log your steps</label>
        <Slider
          value={[stepCount]}
          onValueChange={(value) => onStepCountChange(value[0])}
          max={15000}
          step={100}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>15,000</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StepsTracker;
