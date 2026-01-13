import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Trophy, Flame, Medal, Crown, TrendingUp } from "lucide-react";

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
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/user/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      });
  }, []);

  // Top 3
  const top3 = leaderboard.slice(0, 3);
  // All others
  const rest = leaderboard.slice(3);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-500">Loading leaderboard...</p>
        </div>
      </PageWrapper>
    );
  }

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
        {top3[1] && (
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
              {top3[1].username[0]}
            </div>
            <h3 className="font-semibold text-foreground">{top3[1].username}</h3>
            <p className="text-2xl font-display font-bold text-primary mt-1">
              {top3[1].points.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
              <Flame className="w-4 h-4 text-streak-accent" />
              {top3[1].highest_streak} best
            </div>
          </motion.div>
        )}
        {/* 1st Place */}
        {top3[0] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated p-6 text-center border-2 border-amber-200"
            style={{ boxShadow: "0 8px 32px -8px rgba(234, 179, 8, 0.15)" }}
          >
            <div className="leaderboard-rank rank-gold mx-auto mb-4 w-14 h-14">
              <Crown className="w-7 h-7" />
            </div>
            <div className="w-18 h-18 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3" style={{ width: 72, height: 72 }}>
              {top3[0].username[0]}
            </div>
            <h3 className="font-semibold text-lg text-foreground">{top3[0].username}</h3>
            <p className="text-3xl font-display font-bold text-primary mt-1">
              {top3[0].points.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
              <Flame className="w-4 h-4 text-streak-accent" />
              {top3[0].highest_streak} best streak
            </div>
          </motion.div>
        )}
        {/* 3rd Place */}
        {top3[2] && (
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
              {top3[2].username[0]}
            </div>
            <h3 className="font-semibold text-foreground">{top3[2].username}</h3>
            <p className="text-xl font-display font-bold text-primary mt-1">
              {top3[2].points.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
              <Flame className="w-4 h-4 text-streak-accent" />
              {top3[2].highest_streak} best
            </div>
          </motion.div>
        )}
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
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className={`flex items-center gap-4 p-4 transition-colors ${
                index < 3 ? "bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <div className={`leaderboard-rank ${getRankStyle(index + 1)}`}>
                {getRankIcon(index + 1)}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white">
                {user.username[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{user.username}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Flame className="w-3 h-3 text-streak-accent" />
                  {user.highest_streak} day streak
                </div>
              </div>
              <div className="text-right">
                <span className="font-display text-xl font-bold text-foreground">{user.points.toLocaleString()}</span>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
              {index < 3 && (
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
