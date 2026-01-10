import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { 
  Footprints, 
  Dumbbell, 
  UtensilsCrossed, 
  Flame, 
  Zap, 
  AlertTriangle,
  Trophy,
  Target,
  ArrowRight
} from "lucide-react";

interface RuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  points: string;
  isPositive: boolean;
  delay?: number;
}

const RuleCard = ({ icon, title, description, points, isPositive, delay = 0 }: RuleCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.4 }}
      className="card-elevated-hover p-6"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
        isPositive ? "bg-success/10" : "bg-destructive/10"
      }`}>
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{description}</p>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
        isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}>
        {isPositive ? "+" : "-"}{points}
      </div>
    </motion.div>
  );
};

const Rules = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <PageWrapper>
      {/* Header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">The Ritual Rules</h1>
        </div>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Understanding how points work is the first step to mastering your rituals.
        </p>
      </motion.div>

      {/* Earning Points Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Earn Points</h2>
            <p className="text-muted-foreground text-sm">Complete rituals to gain points</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <RuleCard
            icon={<Footprints className="w-6 h-6 text-primary" />}
            title="Steps Goal"
            description="Walk your way to fitness. Every 1,000 steps brings you closer to your goal and earns you points."
            points="10 pts per 1K steps"
            isPositive
            delay={0.1}
          />
          <RuleCard
            icon={<Dumbbell className="w-6 h-6 text-accent" />}
            title="Workout Completion"
            description="Complete each exercise in your daily workout plan. Consistency is key to building strength."
            points="20 pts per exercise"
            isPositive
            delay={0.2}
          />
          <RuleCard
            icon={<Flame className="w-6 h-6 text-streak-accent" />}
            title="Streak Bonus"
            description="Maintain your daily streak to unlock bonus multipliers. The longer your streak, the bigger the reward."
            points="5x multiplier at 30 days"
            isPositive
            delay={0.3}
          />
          <RuleCard
            icon={<Target className="w-6 h-6 text-success" />}
            title="Perfect Day"
            description="Hit 100% on both steps and workout for the day to earn a Perfect Day bonus."
            points="50 bonus pts"
            isPositive
            delay={0.4}
          />
        </div>
      </motion.div>

      {/* Penalty Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Penalties</h2>
            <p className="text-muted-foreground text-sm">Unhealthy habits cost you points</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <RuleCard
            icon={<UtensilsCrossed className="w-6 h-6 text-destructive" />}
            title="Junk Food Intake"
            description="Each junk food item deducts points based on nutritional impact. High sugar and trans fats cost the most."
            points="15-30 pts per item"
            isPositive={false}
            delay={0.1}
          />
          <RuleCard
            icon={<Flame className="w-6 h-6 text-destructive" />}
            title="Broken Streak"
            description="Missing a day resets your streak multiplier and deducts points. Protect your streak at all costs."
            points="100 pts + multiplier reset"
            isPositive={false}
            delay={0.2}
          />
        </div>
      </motion.div>

      {/* Point Values Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-elevated p-8"
      >
        <h2 className="font-display text-xl font-bold mb-6 text-foreground">Point Values Reference</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Earning */}
          <div>
            <h3 className="text-success font-semibold mb-4 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> Earning Points
            </h3>
            <div className="space-y-2">
              {[
                { action: "1,000 Steps", points: "+10" },
                { action: "Complete 1 Exercise", points: "+20" },
                { action: "Perfect Day Bonus", points: "+50" },
                { action: "7-Day Streak Bonus", points: "+100" },
                { action: "30-Day Streak Multiplier", points: "5x" },
              ].map((item) => (
                <div key={item.action} className="flex justify-between items-center py-2.5 border-b border-border">
                  <span className="text-muted-foreground text-sm">{item.action}</span>
                  <span className="font-semibold text-success">{item.points}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Penalties */}
          <div>
            <h3 className="text-destructive font-semibold mb-4 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> Penalties
            </h3>
            <div className="space-y-2">
              {[
                { action: "Burger", points: "-30" },
                { action: "Pizza (slice)", points: "-25" },
                { action: "Fries", points: "-20" },
                { action: "Soda", points: "-15" },
                { action: "Breaking Streak", points: "-100" },
              ].map((item) => (
                <div key={item.action} className="flex justify-between items-center py-2.5 border-b border-border">
                  <span className="text-muted-foreground text-sm">{item.action}</span>
                  <span className="font-semibold text-destructive">{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <p className="text-muted-foreground mb-4">Ready to start your ritual?</p>
        <a href="/" className="btn-primary inline-flex items-center gap-2">
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </a>
      </motion.div>
    </PageWrapper>
  );
};

export default Rules;
