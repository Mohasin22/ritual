import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import { Flame, Calendar, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarDay {
  date: string;
  points: number;
  completed: boolean;
}

const Streaks = () => {
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalActiveDays, setTotalActiveDays] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);
  const navigate = useNavigate();

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const isMobile = useIsMobile();
  const isDesktop = !isMobile;

  const [yearCalendars, setYearCalendars] = useState<{ [month: number]: CalendarDay[] }>({});

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/user/streak-calendar?month=${selectedMonth + 1}&year=${selectedYear}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        const data = await res.json();
        setCalendar(data.calendar || []);
        setCurrentStreak(data.currentStreak || 0);
        setLongestStreak(data.longestStreak || 0);
        setTotalActiveDays(data.totalActiveDays || 0);
        setTotalPoints(data.totalPoints || 0);
      } catch (e) {
        // Optionally show an error toast
      }
    };
    fetchCalendar();
  }, [selectedMonth, selectedYear, navigate]);

  useEffect(() => {
    if (!isDesktop) return;
    const fetchAllMonths = async () => {
      const newYearCalendars: { [month: number]: CalendarDay[] } = {};
      for (let m = 0; m < 12; m++) {
        const res = await fetch(
          `http://localhost:8000/user/streak-calendar?month=${m + 1}&year=${selectedYear}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        const data = await res.json();
        newYearCalendars[m] = data.calendar || [];
      }
      setYearCalendars(newYearCalendars);
    };
    fetchAllMonths();
  }, [isDesktop, selectedYear, navigate]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const getMonthCalendar = (month: number, calendarData: CalendarDay[]) => {
    const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
    const firstDay = new Date(selectedYear, month, 1);
    const startDay = firstDay.getDay(); // 0=Sun, 1=Mon, ...
    const weekStart = (startDay + 6) % 7;
    const days: CalendarDay[] = [];
    for (let i = 0; i < weekStart; i++) {
      days.push({ date: "", completed: false, points: 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(selectedYear, month, d).toISOString().slice(0, 10);
      const found = calendarData.find((c) => c.date === dateStr);
      days.push(
        found || { date: dateStr, completed: false, points: 0 }
      );
    }
    while (days.length % 7 !== 0) {
      days.push({ date: "", completed: false, points: 0 });
    }
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const getStreakCellClass = (day: CalendarDay) => {
    if (!day.date) return "invisible";
    if (day.completed) return "bg-success";
    return "bg-muted";
  };

  // Desktop: show a range of 3 months, with navigation
  const [monthStart, setMonthStart] = useState(0); // 0=Jan, 3=Apr, 6=Jul, 9=Oct
  const handlePrevMonthRange = () => {
    setMonthStart((prev) => (prev - 3 + 12) % 12);
  };
  const handleNextMonthRange = () => {
    setMonthStart((prev) => (prev + 3) % 12);
  };

  return (
    <PageWrapper>
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
          <p className="font-display text-2xl font-bold text-streak-accent">{currentStreak} days</p>
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
          <p className="font-display text-2xl font-bold text-success">{longestStreak} days</p>
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
          <p className="font-display text-2xl font-bold text-primary">{totalActiveDays}</p>
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
          <p className="font-display text-2xl font-bold text-accent">{totalPoints.toLocaleString()}</p>
        </motion.div>
      </div>

      {isDesktop ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-6 overflow-x-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Activity Calendar</h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonthRange} className="px-2 py-1 text-xs rounded hover:bg-muted">&lt;</button>
              <span className="font-medium text-foreground">
                {months[monthStart]} - {months[(monthStart+2)%12]} {selectedYear}
              </span>
              <button onClick={handleNextMonthRange} className="px-2 py-1 text-xs rounded hover:bg-muted">&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {months.slice(monthStart, monthStart+3).map((monthName, idx) => {
              const m = monthStart + idx;
              const monthWeeks = getMonthCalendar(m, yearCalendars[m] || []);
              // Find max week length for grid rows
              const maxRows = monthWeeks.length;
              return (
                <div key={m} className="mb-2">
                  <div className="font-semibold text-center mb-1 text-base">{monthName}</div>
                  <div className={`grid grid-cols-8 gap-x-1`} style={{minWidth:'max-content'}}>
                    {/* Weekday labels */}
                    <div></div>
                    {["M","T","W","T","F","S","S"].map((d,i)=>(
                      <span key={i} className="block text-xs text-muted-foreground text-center h-5 leading-5">{d}</span>
                    ))}
                    {/* Calendar grid */}
                    {monthWeeks.map((week, weekIndex) => (
                      <>
                        <div key={`rowlabel-${weekIndex}`}></div>
                        {week.map((day, dayIndex) => (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={`streak-cell w-7 h-7 rounded-full mx-auto ${!day.date ? "invisible" : day.completed ? "bg-success" : "bg-muted"}`}
                            title={day.date ? `${day.date}: ${day.completed ? day.points + ' pts' : 'Inactive'}` : ''}
                          />
                        ))}
                      </>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-4 mt-6 text-sm text-muted-foreground">
            <span>Inactive</span>
            <div className="flex gap-1">
              <div className="streak-cell w-7 h-7 rounded-full bg-muted" />
              <div className="streak-cell w-7 h-7 rounded-full bg-success" />
            </div>
            <span>Active</span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-6 overflow-x-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Activity Calendar</h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="px-2 py-1 text-xs rounded hover:bg-muted">&lt;</button>
              <span className="font-medium text-foreground">
                {months[selectedMonth]} {selectedYear}
              </span>
              <button onClick={handleNextMonth} className="px-2 py-1 text-xs rounded hover:bg-muted">&gt;</button>
            </div>
          </div>
          <div className={`grid grid-cols-8 gap-x-1`} style={{minWidth:'max-content'}}>
            {/* Weekday labels */}
            <div></div>
            {["M","T","W","T","F","S","S"].map((d,i)=>(
              <span key={i} className="block text-xs text-muted-foreground text-center h-5 leading-5">{d}</span>
            ))}
            {/* Calendar grid */}
            {getMonthCalendar(selectedMonth, calendar).map((week, weekIndex) => (
              <>
                <div key={`rowlabel-${weekIndex}`}></div>
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: weekIndex * 0.003 }}
                    onMouseEnter={() => day.date && setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`streak-cell w-7 h-7 rounded-full mx-auto cursor-pointer ${getStreakCellClass(day)} hover:ring-1 hover:ring-primary/50`}
                    title={day.date ? `${day.date}: ${day.completed ? day.points + ' pts' : 'Inactive'}` : ''}
                  />
                ))}
              </>
            ))}
          </div>
          <div className="flex items-center justify-end gap-4 mt-6 text-sm text-muted-foreground">
            <span>Inactive</span>
            <div className="flex gap-1">
              <div className="streak-cell w-7 h-7 rounded-full bg-muted" />
              <div className="streak-cell w-7 h-7 rounded-full bg-success" />
            </div>
            <span>Active</span>
          </div>
        </motion.div>
      )}

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
              {currentStreak >= 7 ? "You're on fire!" : "Keep building your streak!"}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentStreak >= 7
                ? `${currentStreak} days strong. Don't break the chain!`
                : `Only ${7 - currentStreak} more days to hit a week streak.`}
            </p>
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default Streaks;
