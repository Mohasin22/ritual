import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import { Flame, Calendar, Target, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";

// Streak data structure for proper tracking
interface DayData {
  date: string;
  completed: boolean;
  stepsCompleted: boolean;
  workoutCompleted: boolean;
  points: number;
}

// Mock API endpoint - GET /api/streaks
// This generates realistic streak data based on goal completion
const generateStreakData = (): DayData[] => {
  const data: DayData[] = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Higher completion rate on weekdays, slightly lower on weekends
    const baseRate = isWeekend ? 0.75 : 0.88;
    const random = Math.random();
    
    const stepsCompleted = random < baseRate;
    const workoutCompleted = random < (baseRate - 0.1);
    const completed = stepsCompleted && workoutCompleted;
    
    let points = 0;
    if (stepsCompleted) points += 100; // 10K steps
    if (workoutCompleted) points += 80; // 4 exercises

    data.push({
      date: date.toISOString().split("T")[0],
      completed,
      stepsCompleted,
      workoutCompleted,
      points,
    });
  }

  return data;
};

// Calculate streak statistics
const calculateStreakStats = (data: DayData[]) => {
  let currentStreak = 0;
  let highestStreak = 0;
  let tempStreak = 0;
  
  // Calculate highest streak
  for (const day of data) {
    if (day.completed) {
      tempStreak++;
      highestStreak = Math.max(highestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  // Calculate current streak (from end)
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].completed) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  const totalActiveDays = data.filter(d => d.completed).length;
  const totalPoints = data.reduce((sum, d) => sum + d.points, 0);
  
  return { currentStreak, highestStreak, totalActiveDays, totalPoints };
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Streaks = () => {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  
  const streakData = useMemo(() => generateStreakData(), []);
  const stats = useMemo(() => calculateStreakStats(streakData), [streakData]);

  // Organize data by weeks for calendar display
  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    let currentWeek: DayData[] = [];

    const firstDate = new Date(streakData[0].date);
    const startPadding = firstDate.getDay();

    // Add padding for first week alignment
    for (let i = 0; i < startPadding; i++) {
      currentWeek.push({ 
        date: "", 
        completed: false, 
        stepsCompleted: false, 
        workoutCompleted: false, 
        points: 0 
      });
    }

    for (const day of streakData) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [streakData]);

  // Get month labels with positions
  const monthLabels = useMemo(() => {
    const labels: { month: string; position: number }[] = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const validDay = week.find(d => d.date);
      if (validDay) {
        const month = new Date(validDay.date).getMonth();
        if (month !== currentMonth) {
          currentMonth = month;
          labels.push({ month: months[month], position: weekIndex });
        }
      }
    });
    
    return labels;
  }, [weeks]);

  const getStreakCellClass = (day: DayData) => {
    if (!day.date) return "invisible";
    if (day.completed) return "bg-success";
    if (day.stepsCompleted || day.workoutCompleted) return "bg-success/40";
    return "bg-muted";
  };

  return (
    <PageWrapper>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-streak-accent/10 rounded-2xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-streak-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Your Streak</h1>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          Every day counts. Build the habit, maintain the streak, become unstoppable.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-streak-accent/10 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-streak-accent" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Current Streak</span>
          </div>
          <p className="font-display text-2xl font-bold text-streak-accent">{stats.currentStreak} days</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Best Streak</span>
          </div>
          <p className="font-display text-2xl font-bold text-success">{stats.highestStreak} days</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Active Days</span>
          </div>
          <p className="font-display text-2xl font-bold text-primary">{stats.totalActiveDays}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-elevated p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Total Points</span>
          </div>
          <p className="font-display text-2xl font-bold text-accent">{stats.totalPoints.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Streak Calendar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="card-elevated p-6 overflow-x-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Activity Calendar</h2>
          {hoveredDay && hoveredDay.date && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {new Date(hoveredDay.date).toLocaleDateString("en-US", { 
                  month: "short", 
                  day: "numeric",
                  year: "numeric" 
                })}
              </span>
              {" — "}
              <span className={hoveredDay.completed ? "text-success" : "text-muted-foreground"}>
                {hoveredDay.completed ? `${hoveredDay.points} pts` : "Incomplete"}
              </span>
            </div>
          )}
        </div>

        {/* Month Labels */}
        <div className="flex gap-1 mb-2 ml-8 relative h-5">
          {monthLabels.map((label, i) => (
            <div 
              key={`${label.month}-${i}`}
              className="text-xs text-muted-foreground absolute"
              style={{ left: `${(label.position / weeks.length) * 100}%` }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex gap-1">
          {/* Day Labels */}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground mr-2 pt-0.5">
            <span className="h-3 leading-3">M</span>
            <span className="h-3 leading-3"></span>
            <span className="h-3 leading-3">W</span>
            <span className="h-3 leading-3"></span>
            <span className="h-3 leading-3">F</span>
            <span className="h-3 leading-3"></span>
            <span className="h-3 leading-3"></span>
          </div>

          {/* Weeks */}
          <div className="flex gap-0.5 flex-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: weekIndex * 0.003 }}
                    onMouseEnter={() => day.date && setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`streak-cell cursor-pointer ${getStreakCellClass(day)} hover:ring-1 hover:ring-primary/50`}
                    title={day.date ? `${day.date}: ${day.completed ? 'Completed' : 'Incomplete'}` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-4 mt-6 text-sm text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="streak-cell bg-muted" />
            <div className="streak-cell bg-success/40" />
            <div className="streak-cell bg-success" />
          </div>
          <span>More</span>
        </div>
      </motion.div>

      {/* Streak Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <div className="inline-flex items-center gap-4 px-6 py-4 card-elevated">
          <div className="w-12 h-12 bg-streak-accent/10 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-streak-accent" />
          </div>
          <div className="text-left">
            <p className="font-display text-lg font-semibold text-foreground">
              {stats.currentStreak >= 7 ? "You're on fire!" : "Keep building your streak!"}
            </p>
            <p className="text-sm text-muted-foreground">
              {stats.currentStreak >= 7
                ? `${stats.currentStreak} days strong. Don't break the chain!`
                : `Only ${7 - stats.currentStreak} more days to hit a week streak.`}
            </p>
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default Streaks;
