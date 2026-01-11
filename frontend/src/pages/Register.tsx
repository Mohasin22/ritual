import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, register, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    if (!email || !username || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      await register(email, username, password);
      // Navigation will be handled by the useEffect above watching isAuthenticated
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    }
  };

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Passwords match", met: password === confirmPassword && password.length > 0 },
    { label: "Username at least 3 characters", met: username.length >= 3 },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">R</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ritual</h1>
          <p className="text-gray-500">Start your transformation journey</p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-lg rounded-xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-600">
              Join our community and start building healthy habits
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 ml-2">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-white border border-gray-300 rounded-lg px-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-white border border-gray-300 rounded-lg px-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-white border border-gray-300 rounded-lg px-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-white border border-gray-300 rounded-lg px-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
              </div>

              {/* Requirements Checklist */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Requirements:</p>
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {req.met ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className={req.met ? "text-green-700 font-medium" : "text-gray-600"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !allRequirementsMet}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600 font-medium">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Link to="/login">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition"
                >
                  Sign In
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-8">
          By creating an account, you agree to our <span className="text-blue-600 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
