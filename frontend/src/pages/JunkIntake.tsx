import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import {
  UtensilsCrossed,
  Plus,
  X,
  Trash2,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import { JUNK_MENU } from "@/data/junkMenu";
import { HARM_LEVEL_RULES } from "@/data/junkHelpers";
import api from "@/api";
import { useAuth } from "@/context/AuthContext";

/* ---------------- TYPES ---------------- */

interface LoggedJunk {
  id: string;
  itemId: string;
  timestamp: string;
  quantity: number;
}

/* ---------------- HELPERS ---------------- */

const getHealthImpact = (harmLevel: number): "low" | "medium" | "high" => {
  if (harmLevel === 3) return "high";
  if (harmLevel === 2) return "medium";
  return "low";
};

const impactColors = {
  low: "bg-emerald-50 border-emerald-200 text-emerald-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  high: "bg-rose-50 border-rose-200 text-rose-700",
};

/* ---------------- COMPONENT ---------------- */

const JunkIntake = () => {
  const { accessToken } = useAuth();

  const [junkLimits, setJunkLimits] = useState<Record<string, number>>({});

  const [loggedJunk, setLoggedJunk] = useState<LoggedJunk[]>(() => {
    const saved = localStorage.getItem("junkLogs");
    return saved ? JSON.parse(saved) : [];
  });

  const [quantity, setQuantity] = useState<Record<string, number>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [filterImpact, setFilterImpact] = useState<"all" | "high" | "medium" | "low">("all");
  const [totalPenaltyToday, setTotalPenaltyToday] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  /* -------- SYNC TO LOCALSTORAGE -------- */

  useEffect(() => {
    localStorage.setItem("junkLogs", JSON.stringify(loggedJunk));
  }, [loggedJunk]);

  /* -------- PENALTY CALCULATION -------- */

  useEffect(() => {
    const levelCount: Record<number, number> = {};

    loggedJunk
      .filter((l) => l.timestamp.startsWith(today))
      .forEach((log) => {
        const item = JUNK_MENU.foods.find((f) => f.id === log.itemId);
        if (!item) return;

        levelCount[item.harm_level] = (levelCount[item.harm_level] || 0) + log.quantity;
      });

    let penalty = 0;

    Object.entries(levelCount).forEach(([lvl, count]) => {
      const rule = HARM_LEVEL_RULES[Number(lvl)];
      if (!rule) return;

      const impact = getHealthImpact(Number(lvl));
      const freeLimit = junkLimits[impact] ?? rule.free;
      const extra = Math.max(0, count - freeLimit);
      penalty += extra * rule.penalty;
    });

    setTotalPenaltyToday(penalty);
  }, [loggedJunk, today, junkLimits]);

  /* -------- FETCH JUNK LIMITS FROM BACKEND -------- */

  useEffect(() => {
    if (!accessToken) return;

    const fetchJunkLimits = async () => {
      try {
        const res = await api.get("/user/junk-limits", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const mapped: Record<string, number> = {};
        res.data.limits.forEach((l: any) => {
          mapped[l.junk_type] = l.max_quantity;
        });

        setJunkLimits(mapped);
      } catch (err) {
        console.error("Failed to load junk limits", err);
      }
    };

    fetchJunkLimits();
  }, [accessToken]);

  /* -------- ACTIONS -------- */

  const handleAddJunk = (itemId: string) => {
    const qty = quantity[itemId] || 1;

    setLoggedJunk((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${itemId}`,
        itemId,
        quantity: qty,
        timestamp: new Date().toISOString(),
      },
    ]);

    setQuantity((prev) => ({ ...prev, [itemId]: 1 }));
  };

  const handleRemoveJunk = (id: string) => {
    setLoggedJunk((prev) => prev.filter((l) => l.id !== id));
  };

  const handleClearToday = () => {
    setLoggedJunk((prev) => prev.filter((l) => !l.timestamp.startsWith(today)));
  };

  /* -------- DERIVED DATA -------- */

  const todaysJunk = loggedJunk.filter((l) => l.timestamp.startsWith(today));

  const categories = [...new Set(JUNK_MENU.foods.map((f) => f.category))];

  const filteredFoods =
    filterImpact === "all"
      ? JUNK_MENU.foods
      : JUNK_MENU.foods.filter((f) => getHealthImpact(f.harm_level) === filterImpact);

  const todayLevelCount: Record<number, number> = {};

  todaysJunk.forEach((log) => {
    const item = JUNK_MENU.foods.find((f) => f.id === log.itemId);
    if (!item) return;

    todayLevelCount[item.harm_level] = (todayLevelCount[item.harm_level] || 0) + log.quantity;
  });

  /* -------- UI -------- */

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-warning" />
              </div>
              <h1 className="font-display text-3xl font-bold">Junk Intake</h1>
            </div>
            <p className="text-muted-foreground">Log what you ate today. Penalty applies only after allowance.</p>
          </div>

          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Today’s Intake</h2>
              {todaysJunk.length > 0 && (
                <button onClick={handleClearToday} className="px-3 py-1 text-sm bg-destructive/10 text-destructive rounded-lg">
                  <Trash2 className="w-4 h-4 inline mr-1" /> Clear
                </button>
              )}
            </div>

            {todaysJunk.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <p className="text-emerald-700 font-medium">No junk eaten today 🎉</p>
              </div>
            ) : (
              <AnimatePresence>
                {todaysJunk.map((log) => {
                  const item = JUNK_MENU.foods.find((f) => f.id === log.itemId);
                  if (!item) return null;

                  return (
                    <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex justify-between items-center p-3 mb-2 border rounded-xl">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {log.quantity}</p>
                      </div>
                      <button onClick={() => handleRemoveJunk(log.id)}>
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {categories.map((category) => (
            <div key={category} className="card-elevated">
              <button onClick={() => setExpandedCategory(expandedCategory === category ? null : category)} className="w-full p-6 flex justify-between items-center">
                <h3 className="font-display text-lg font-bold">{category}</h3>
                <ChevronDown />
              </button>

              {expandedCategory === category && (
                <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                  {filteredFoods
                    .filter((f) => f.category === category)
                    .map((item) => {
                      const impact = getHealthImpact(item.harm_level);
                      return (
                        <div key={item.id} className={`p-4 rounded-xl border ${impactColors[impact]}`}>
                          <p className="font-semibold">{item.name}</p>
                          <div className="text-xs text-muted-foreground mb-2 space-y-1">
                            {item.allowed_frequency && <p className="font-medium text-foreground/80">Allowed: {item.allowed_frequency}</p>}
                            {item.reason && <p className="italic">{item.reason}</p>}
                          </div>
                          <div className="flex gap-2">
                            <input type="number" min={1} value={quantity[item.id] || 1} onChange={(e) => setQuantity((p) => ({ ...p, [item.id]: Number(e.target.value) }))} className="w-12 border rounded text-center" />
                            <button onClick={() => handleAddJunk(item.id)} className="flex-1 bg-destructive/10 text-destructive rounded-lg">
                              <Plus className="w-4 h-4 inline" /> Log
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-display font-bold">Today’s Junk Impact</h3>
            </div>

            <p className="text-4xl font-bold text-destructive">-{totalPenaltyToday} pts</p>
            <p className="text-xs text-muted-foreground mt-2">Penalty applies only after allowance per danger level.</p>
          </div>

          <div className="card-elevated p-6 mt-4">
            <h3 className="font-display font-bold mb-4">Junk Allowance Today</h3>

            <div className="space-y-3">
              {Object.entries(HARM_LEVEL_RULES)
                .filter(([, rule]) => rule.free !== Infinity)
                .map(([levelStr, rule]) => {
                  const level = Number(levelStr);
                  const used = todayLevelCount[level] || 0;
                  const remaining = Math.max(rule.free - used, 0);

                  const label = level === 3 ? "High Impact" : level === 2 ? "Medium Impact" : "Low Impact";

                  return (
                    <div key={level} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                      </div>

                      <span className={`text-sm font-bold ${remaining > 0 ? "text-success" : "text-destructive"}`}>
                        {remaining > 0 ? `${remaining} left` : "Penalty applies"}
                      </span>
                    </div>
                  );
                })}
            </div>

            <p className="text-xs text-muted-foreground mt-4">Items of the same impact level share allowance.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default JunkIntake;
