import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, AlertTriangle, X, Plus } from "lucide-react";
import { useState } from "react";

interface JunkItem {
  id: string;
  name: string;
  penalty: number;
  flags: string[];
}

const junkOptions: JunkItem[] = [
  { id: "burger", name: "Burger", penalty: 30, flags: ["High Fat", "High Sodium"] },
  { id: "pizza", name: "Pizza", penalty: 25, flags: ["High Carbs", "High Fat"] },
  { id: "fries", name: "Fries", penalty: 20, flags: ["Trans Fat", "High Sodium"] },
  { id: "soda", name: "Soda", penalty: 15, flags: ["High Sugar"] },
  { id: "candy", name: "Candy", penalty: 20, flags: ["High Sugar", "Empty Calories"] },
  { id: "icecream", name: "Ice Cream", penalty: 25, flags: ["High Sugar", "High Fat"] },
];

interface JunkTrackerProps {
  selectedJunk: string[];
  onAddJunk: (id: string) => void;
  onRemoveJunk: (id: string) => void;
}

const JunkTracker = ({ selectedJunk, onAddJunk, onRemoveJunk }: JunkTrackerProps) => {
  const [showSelector, setShowSelector] = useState(false);
  
  const totalPenalty = selectedJunk.reduce((sum, id) => {
    const item = junkOptions.find((j) => j.id === id);
    return sum + (item?.penalty || 0);
  }, 0);

  const selectedItems = selectedJunk.map((id) => junkOptions.find((j) => j.id === id)!).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-elevated-hover p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-warning" />
          </div>
          <h3 className="font-display text-lg font-semibold">Junk Intake</h3>
        </div>
        {totalPenalty > 0 && (
          <span className="points-badge points-negative">-{totalPenalty} pts</span>
        )}
      </div>

      {/* Selected Junk Items */}
      <AnimatePresence mode="popLayout">
        {selectedItems.length > 0 ? (
          <div className="space-y-2 mb-4">
            {selectedItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <span className="text-destructive font-semibold text-sm">-{item.penalty}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{item.name}</span>
                    <div className="flex gap-1.5 mt-1">
                      {item.flags.map((flag) => (
                        <span
                          key={flag}
                          className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive/80 rounded-full"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveJunk(item.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 mb-4 bg-success/5 rounded-xl border border-success/10"
          >
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-success" />
            </div>
            <p className="text-success font-medium">Clean eating today!</p>
            <p className="text-sm text-muted-foreground mt-1">No junk food logged</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Junk Button */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="w-full btn-secondary flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Log Junk Food
      </button>

      {/* Junk Selector */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-2">
              {junkOptions.map((item) => {
                const isSelected = selectedJunk.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isSelected) {
                        onRemoveJunk(item.id);
                      } else {
                        onAddJunk(item.id);
                      }
                    }}
                    disabled={isSelected}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-muted opacity-50"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-destructive font-medium">-{item.penalty} pts</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Impact Indicator */}
      {totalPenalty > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-destructive/5 border border-destructive/10 rounded-xl"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">
              Junk impact: <span className="font-bold">-{totalPenalty} points</span>
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Add Check icon for clean eating state
const Check = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default JunkTracker;
