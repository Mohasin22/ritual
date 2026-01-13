import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import {
  UtensilsCrossed,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Plus,
  X,
  Trash2,
  ChevronDown,
} from "lucide-react";

interface JunkItem {
  id: string;
  name: string;
  penalty: number;
  flags: string[];
  category: string;
  healthImpact: "low" | "medium" | "high";
}

interface LoggedJunk {
  id: string;
  itemId: string;
  itemName: string;
  penalty: number;
  timestamp: string;
  quantity: number;
}

const junkDatabase: JunkItem[] = [
  {
    id: "burger",
    name: "Burger",
    penalty: 30,
    flags: ["High Fat", "High Sodium"],
    category: "Fast Food",
    healthImpact: "high",
  },
  {
    id: "pizza",
    name: "Pizza",
    penalty: 25,
    flags: ["High Carbs", "High Fat"],
    category: "Fast Food",
    healthImpact: "high",
  },
  {
    id: "fries",
    name: "Fries",
    penalty: 20,
    flags: ["Trans Fat", "High Sodium"],
    category: "Sides",
    healthImpact: "high",
  },
  {
    id: "soda",
    name: "Soda",
    penalty: 15,
    flags: ["High Sugar"],
    category: "Beverages",
    healthImpact: "medium",
  },
  {
    id: "candy",
    name: "Candy",
    penalty: 20,
    flags: ["High Sugar", "Empty Calories"],
    category: "Sweets",
    healthImpact: "high",
  },
  {
    id: "icecream",
    name: "Ice Cream",
    penalty: 25,
    flags: ["High Sugar", "High Fat"],
    category: "Sweets",
    healthImpact: "high",
  },
  {
    id: "chips",
    name: "Chips",
    penalty: 18,
    flags: ["Trans Fat", "High Sodium"],
    category: "Snacks",
    healthImpact: "medium",
  },
  {
    id: "donut",
    name: "Donut",
    penalty: 22,
    flags: ["High Sugar", "Trans Fat"],
    category: "Sweets",
    healthImpact: "high",
  },
  {
    id: "frappuccino",
    name: "Frappuccino",
    penalty: 18,
    flags: ["High Sugar", "Caffeine"],
    category: "Beverages",
    healthImpact: "medium",
  },
  {
    id: "hotdog",
    name: "Hot Dog",
    penalty: 20,
    flags: ["Processed", "High Sodium"],
    category: "Fast Food",
    healthImpact: "medium",
  },
];

const JunkIntake = () => {
  const [loggedJunk, setLoggedJunk] = useState<LoggedJunk[]>(() => {
    const saved = localStorage.getItem("loggedJunk");
    return saved ? JSON.parse(saved) : [];
  });
  const [quantity, setQuantity] = useState<Record<string, number>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Fast Food");
  const [filterImpact, setFilterImpact] = useState<"all" | "high" | "medium" | "low">("all");
  const [totalPenaltyToday, setTotalPenaltyToday] = useState(0);

  // Calculate today's junk intake
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const todaysPenalty = loggedJunk
      .filter((item) => item.timestamp.startsWith(today))
      .reduce((sum, item) => sum + item.penalty * item.quantity, 0);
    setTotalPenaltyToday(todaysPenalty);
  }, [loggedJunk]);

  const handleAddJunk = (item: JunkItem) => {
    const qty = quantity[item.id] || 1;
    const newLog: LoggedJunk = {
      id: `${Date.now()}-${item.id}`,
      itemId: item.id,
      itemName: item.name,
      penalty: item.penalty,
      timestamp: new Date().toISOString(),
      quantity: qty,
    };
    setLoggedJunk((prev) => {
      const updated = [...prev, newLog];
      localStorage.setItem("loggedJunk", JSON.stringify(updated));
      return updated;
    });
    setQuantity((prev) => ({ ...prev, [item.id]: 1 }));
  };

  const handleRemoveJunk = (id: string) => {
    setLoggedJunk((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("loggedJunk", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setLoggedJunk((prev) => {
      const updated = prev.filter((item) => !item.timestamp.startsWith(today));
      localStorage.setItem("loggedJunk", JSON.stringify(updated));
      return updated;
    });
  };

  const categories = [...new Set(junkDatabase.map((j) => j.category))];
  const today = new Date().toISOString().split("T")[0];
  const todaysJunk = loggedJunk.filter((item) => item.timestamp.startsWith(today));

  const filteredDatabase =
    filterImpact === "all"
      ? junkDatabase
      : junkDatabase.filter((item) => item.healthImpact === filterImpact);

  const getHealthImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-amber-600 bg-amber-50";
      case "low":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getHealthImpactBg = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500/10";
      case "medium":
        return "bg-amber-500/10";
      case "low":
        return "bg-yellow-500/10";
      default:
        return "bg-gray-500/10";
    }
  };

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-warning" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">Junk Intake Tracker</h1>
            </div>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Track your junk food consumption and see the impact on your daily points
            </p>
          </motion.div>

          {/* Today's Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-foreground">Today's Intake</h2>
              {todaysJunk.length > 0 && (
                <button
                  onClick={handleClearToday}
                  className="px-3 py-1 text-sm bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Today
                </button>
              )}
            </div>

            {todaysJunk.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {todaysJunk.map((log) => {
                    const item = junkDatabase.find((j) => j.id === log.itemId);
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/10 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getHealthImpactBg(item?.healthImpact || "")}`}>
                            <span className="text-sm font-bold text-destructive">
                              -{log.penalty * log.quantity}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{log.itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {log.quantity} × {log.penalty} pts
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveJunk(log.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-destructive" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-8 bg-success/5 rounded-xl border border-success/10">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UtensilsCrossed className="w-6 h-6 text-success" />
                </div>
                <p className="text-success font-medium">Clean eating today!</p>
                <p className="text-sm text-muted-foreground mt-1">No junk food logged</p>
              </div>
            )}
          </motion.div>

          {/* Filter by Health Impact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 flex-wrap"
          >
            {(["all", "high", "medium", "low"] as const).map((impact) => (
              <button
                key={impact}
                onClick={() => setFilterImpact(impact)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterImpact === impact
                    ? impact === "all"
                      ? "bg-primary text-white"
                      : impact === "high"
                      ? "bg-red-500 text-white"
                      : impact === "medium"
                      ? "bg-amber-500 text-white"
                      : "bg-yellow-500 text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {impact.charAt(0).toUpperCase() + impact.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Junk Items by Category */}
          {categories.map((category, idx) => {
            const categoryItems = filteredDatabase.filter((j) => j.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-elevated"
              >
                <button
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === category ? null : category
                    )
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {category}
                  </h3>
                  <motion.div
                    animate={{
                      rotate: expandedCategory === category ? 180 : 0,
                    }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedCategory === category && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border px-6 pb-6 pt-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {categoryItems.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-xl border border-border hover:border-primary/50 transition-all ${getHealthImpactBg(item.healthImpact)}`}
                          >
                            <div className="mb-3">
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <p className="text-sm text-destructive font-bold">
                                -{item.penalty} pts
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.flags.map((flag) => (
                                <span
                                  key={flag}
                                  className="text-xs px-2 py-0.5 bg-foreground/10 text-foreground/70 rounded-full"
                                >
                                  {flag}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${getHealthImpactColor(item.healthImpact)}`}
                              >
                                {item.healthImpact} Impact
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={quantity[item.id] || 1}
                                onChange={(e) =>
                                  setQuantity((prev) => ({
                                    ...prev,
                                    [item.id]: Math.max(
                                      1,
                                      parseInt(e.target.value) || 1
                                    ),
                                  }))
                                }
                                className="w-12 px-2 py-1 border border-border rounded text-sm text-center"
                              />
                              <button
                                onClick={() => handleAddJunk(item)}
                                className="flex-1 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Plus className="w-4 h-4" />
                                Log
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Total Penalty Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Today's Impact
              </h3>
            </div>
            <div className="mb-4">
              <p className="text-muted-foreground text-sm mb-1">Points Lost</p>
              <p className="text-4xl font-bold text-destructive">
                -{totalPenaltyToday}
              </p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-destructive to-destructive/50"
                style={{
                  width: `${Math.min((totalPenaltyToday / 150) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalPenaltyToday > 100
                ? "High impact - consider reducing intake"
                : totalPenaltyToday > 50
                ? "Moderate impact - be mindful"
                : "Low impact - keep it up!"}
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated p-6"
          >
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Items Today</span>
                </div>
                <span className="font-bold text-foreground">{todaysJunk.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    This Week
                  </span>
                </div>
                <span className="font-bold text-foreground">
                  {
                    loggedJunk.filter((item) => {
                      const itemDate = new Date(item.timestamp);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return itemDate >= weekAgo;
                    }).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Avg per Item
                  </span>
                </div>
                <span className="font-bold text-foreground">
                  {todaysJunk.length > 0
                    ? Math.round(totalPenaltyToday / todaysJunk.length)
                    : 0}{" "}
                  pts
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elevated p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Pro Tip</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each junk item deducts points from your daily total. Plan your meals
              carefully to maximize your score. High-impact items cost 25-30 points!
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default JunkIntake;
