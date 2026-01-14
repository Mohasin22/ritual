import { Plus, X, UtensilsCrossed } from "lucide-react";

/* ----------------------------------------
   TYPES
---------------------------------------- */

interface JunkTrackerProps {
  selectedJunk: string[];
  onAddJunk: (id: string) => void;
  onRemoveJunk: (id: string) => void;
}

/* ----------------------------------------
   DASHBOARD JUNK MENU (LIGHTWEIGHT)
   (NOT the full junk system)
---------------------------------------- */

const DASHBOARD_JUNK_ITEMS = [
  { id: "lays", name: "Lays / Chips" },
  { id: "coke", name: "Regular Coke" },
  { id: "pizza", name: "Pizza" },
  { id: "biryani", name: "Biryani" },
];

/* ----------------------------------------
   COMPONENT
---------------------------------------- */

const JunkTracker = ({
  selectedJunk,
  onAddJunk,
  onRemoveJunk,
}: JunkTrackerProps) => {
  return (
    <div className="card-elevated p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
          <UtensilsCrossed className="w-5 h-5 text-warning" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">
          Junk Tracker
        </h3>
      </div>

      {/* Junk Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {DASHBOARD_JUNK_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onAddJunk(item.id)}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition"
          >
            <span className="text-sm font-medium">{item.name}</span>
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Selected Junk */}
      {selectedJunk.length > 0 ? (
        <div className="space-y-2">
          {selectedJunk.map((id, index) => {
            const item = DASHBOARD_JUNK_ITEMS.find(j => j.id === id);
            return (
              <div
                key={`${id}-${index}`}
                className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10"
              >
                <span className="text-sm text-foreground">
                  {item?.name ?? id}
                </span>
                <button
                  onClick={() => onRemoveJunk(id)}
                  className="p-1 hover:bg-destructive/10 rounded"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-3">
          No junk logged today
        </div>
      )}
    </div>
  );
};

export default JunkTracker;
