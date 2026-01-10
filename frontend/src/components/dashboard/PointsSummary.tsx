import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface PointsSummaryProps {
  totalPoints: number;
  pointsGained: number;
  pointsDeducted: number;
}

const AnimatedCounter = ({ value, duration = 1 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = (duration * 1000) / end;
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const PointsSummary = ({ totalPoints, pointsGained, pointsDeducted }: PointsSummaryProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-display text-lg font-semibold">Today's Points</h2>
      </div>

      {/* Main Points Display */}
      <div className="text-center mb-8">
        <span className="font-display text-5xl font-bold text-foreground">
          <AnimatedCounter value={totalPoints} />
        </span>
        <p className="text-muted-foreground mt-2 text-sm">points earned today</p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success/5 rounded-xl p-4 border border-success/10">
          <div className="flex items-center gap-2 text-success mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Gained</span>
          </div>
          <span className="font-display text-xl font-bold text-success">
            +<AnimatedCounter value={pointsGained} />
          </span>
        </div>

        <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/10">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">Deducted</span>
          </div>
          <span className="font-display text-xl font-bold text-destructive">
            -<AnimatedCounter value={pointsDeducted} />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PointsSummary;
