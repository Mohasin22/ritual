import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  LogOut,
  Mail,
  Calendar,
} from "lucide-react";

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type Day = (typeof daysOfWeek)[number];

type WorkoutDay = {
  name: string;
  exercises: string[];
};

export default function Profile() {
  const { user, logout, isAuthenticated, accessToken } = useAuth();
  const navigate = useNavigate();

  const [selectedDay, setSelectedDay] = useState<Day>("monday");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [workoutPlan, setWorkoutPlan] = useState<Record<Day, WorkoutDay>>({
    monday: { name: "Chest", exercises: ["Bench Press", "Push Ups"] },
    tuesday: { name: "Legs", exercises: ["Squats"] },
    wednesday: { name: "Back", exercises: [] },
    thursday: { name: "Shoulders", exercises: [] },
    friday: { name: "Arms", exercises: [] },
    saturday: { name: "", exercises: [] },
    sunday: { name: "", exercises: [] },
  });

  /* -------- SAVE WORKOUT PLAN -------- */

  const handleSaveWorkoutPlan = async () => {
    setError("");
    setSuccess("");

    try {
      await api.put(
        "/user/workout-plan",
        { workout_plan: workoutPlan },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setSuccess("Workout plan saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save workout plan");
    }
  };

  /* -------- FETCH WORKOUT PLAN -------- */

  useEffect(() => {
    if (!accessToken) return;

    const fetchWorkoutPlan = async () => {
      try {
        const res = await api.get("/user/workout-plan", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.data.workout_plan && Object.keys(res.data.workout_plan).length > 0) {
          setWorkoutPlan((prev) => ({ ...prev, ...res.data.workout_plan }));
        }
      } catch (err) {
        console.error("Workout plan fetch failed", err);
      }
    };

    fetchWorkoutPlan();
  }, [accessToken]);

  /* -------- AUTH GUARD -------- */

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials =
    user.username
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const joinDate = new Date(user.created_at || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* -------- EXERCISE HANDLERS -------- */

  const addExercise = () => {
    setWorkoutPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        exercises: [...prev[selectedDay].exercises, ""],
      },
    }));
  };

  const updateExercise = (index: number, value: string) => {
    const updated = [...workoutPlan[selectedDay].exercises];
    updated[index] = value;

    setWorkoutPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        exercises: updated,
      },
    }));
  };

  const removeExercise = (index: number) => {
    setWorkoutPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        exercises: prev[selectedDay].exercises.filter((_, i) => i !== index),
      },
    }));
  };

  /* -------- UI -------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 pt-24 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your workout plan</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-purple-200">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg font-bold">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{user.username}</h2>
                <div className="flex items-center text-gray-600 mb-2"><Mail className="h-4 w-4 mr-2" />{user.email}</div>
                <div className="flex items-center text-gray-600"><Calendar className="h-4 w-4 mr-2" />Joined {joinDate}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Workout Plan</CardTitle>
            <CardDescription>Select a day and manage exercises</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value as Day)} className="w-full border rounded-md px-3 py-2 capitalize">
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>

            <Input placeholder="Workout name (Chest / Legs / etc.)" value={workoutPlan[selectedDay].name} onChange={(e) => setWorkoutPlan((prev) => ({ ...prev, [selectedDay]: { ...prev[selectedDay], name: e.target.value } }))} className="font-semibold" />

            <div className="space-y-2">
              {workoutPlan[selectedDay].exercises.length === 0 && (
                <p className="text-sm text-gray-500 italic">No exercises added yet</p>
              )}

              {workoutPlan[selectedDay].exercises.map((exercise, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={exercise} placeholder="Exercise name" onChange={(e) => updateExercise(index, e.target.value)} />
                  <Button variant="outline" onClick={() => removeExercise(index)}>✕</Button>
                </div>
              ))}
            </div>

            <Button variant="ghost" className="text-purple-600" onClick={addExercise}>+ Add Exercise</Button>

            <Button onClick={handleSaveWorkoutPlan} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">Save Workout Plan</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
