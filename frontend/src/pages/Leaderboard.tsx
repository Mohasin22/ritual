import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import { Trophy, Flame, Medal, Crown, TrendingUp } from "lucide-react";

// Mock API endpoint - GET /api/leaderboard
const leaderboardData = [
  { rank: 1, username: "Sarah", points: 2450, highestStreak: 45, avatar: "S" },
  { rank: 2, username: "Mike", points: 2180, highestStreak: 32, avatar: "M" },
  { rank: 3, username: "Emma", points: 1920, highestStreak: 28, avatar: "E" },
  { rank: 4, username: "You", points: 1350, highestStreak: 18, avatar: "A", isYou: true },
  { rank: 5, username: "Jake", points: 1280, highestStreak: 21, avatar: "J" },
  { rank: 6, username: "Olivia", points: 1150, highestStreak: 15, avatar: "O" },
  { rank: 7, username: "Noah", points: 980, highestStreak: 12, avatar: "N" },
  { rank: 8, username: "Ava", points: 850, highestStreak: 9, avatar: "V" },
];

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "rank-gold";
    case 2:
      return "rank-silver";
    case 3:
      return "rank-bronze";
    default:
      return "bg-muted text-foreground";
  }
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5" />;
    case 2:
      return <Medal className="w-5 h-5" />;
    case 3:
      return <Medal className="w-5 h-5" />;
    default:
      return rank;
  }
};

const Leaderboard = () => {
  return (
    <PageWrapper>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          Compete with the community. Rise through the ranks by completing your daily rituals.
        </p>
      </motion.div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
        {/* 2nd Place */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated p-6 text-center mt-8"
        >
          <div className="leaderboard-rank rank-silver mx-auto mb-4 w-12 h-12">
            <Medal className="w-5 h-5" />
          </div>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-xl font-bold text-white mx-auto mb-3">
            {leaderboardData[1].avatar}
          </div>
          <h3 className="font-semibold text-foreground">{leaderboardData[1].username}</h3>
          <p className="text-2xl font-display font-bold text-primary mt-1">
            {leaderboardData[1].points.toLocaleString()}
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
            <Flame className="w-4 h-4 text-streak-accent" />
            {leaderboardData[1].highestStreak} best
          </div>
        </motion.div>

        {/* 1st Place */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-6 text-center border-2 border-amber-200"
          style={{
            boxShadow: "0 8px 32px -8px rgba(234, 179, 8, 0.15)",
          }}
        >
          <div className="leaderboard-rank rank-gold mx-auto mb-4 w-14 h-14">
            <Crown className="w-7 h-7" />
          </div>
          <div className="w-18 h-18 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3" style={{ width: 72, height: 72 }}>
            {leaderboardData[0].avatar}
          </div>
          <h3 className="font-semibold text-lg text-foreground">{leaderboardData[0].username}</h3>
          <p className="text-3xl font-display font-bold text-primary mt-1">
            {leaderboardData[0].points.toLocaleString()}
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
            <Flame className="w-4 h-4 text-streak-accent" />
            {leaderboardData[0].highestStreak} best streak
          </div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-6 text-center mt-12"
        >
          <div className="leaderboard-rank rank-bronze mx-auto mb-4 w-10 h-10">
            <Medal className="w-4 h-4" />
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-lg font-bold text-white mx-auto mb-3">
            {leaderboardData[2].avatar}
          </div>
          <h3 className="font-semibold text-foreground">{leaderboardData[2].username}</h3>
          <p className="text-xl font-display font-bold text-primary mt-1">
            {leaderboardData[2].points.toLocaleString()}
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
            <Flame className="w-4 h-4 text-streak-accent" />
            {leaderboardData[2].highestStreak} best
          </div>
        </motion.div>
      </div>

      {/* Full Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-elevated overflow-hidden"
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">All Rankings</h2>
        </div>
        <div className="divide-y divide-border">
          {leaderboardData.map((user, index) => (
            <motion.div
              key={user.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className={`flex items-center gap-4 p-4 transition-colors ${
                user.isYou ? "bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className={`leaderboard-rank ${getRankStyle(user.rank)}`}>
                {getRankIcon(user.rank)}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white">
                {user.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{user.username}</span>
                  {user.isYou && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-medium rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Flame className="w-3 h-3 text-streak-accent" />
                  {user.highestStreak} day streak
                </div>
              </div>
              <div className="text-right">
                <span className="font-display text-xl font-bold text-foreground">{user.points.toLocaleString()}</span>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
              {user.rank <= 3 && (
                <TrendingUp className="w-5 h-5 text-success" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default Leaderboard;
