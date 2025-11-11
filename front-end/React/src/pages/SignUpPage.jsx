import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import "./custom_css/onemorestep.css";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData?.user?.id ?? null;

      // insert profile row into "users" table (name -> username, email -> email)
      const userRow = { name: username, email };
      if (userId) userRow.id = userId; // include auth id if you use it as PK

      const { data: insertData, error: insertError } = await supabase
        .from("users")
        .insert([userRow]);

      if (insertError) {
        // keep signup success but inform user that profile save failed
        console.warn("Failed to save profile to users table:", insertError);
        setError("Account created but failed to save profile. Please contact support.");
      } else {
        console.log("Saved profile:", insertData);
      }

      alert("✅ Account created! Check your email for verification link.");
      navigate("/login");
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err?.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-300 to-green-100 animate-fade-in p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-6 text-center animate-fade-up">
        <div className="bg-yellow-400 rounded-t-2xl -m-6 mb-6 py-4 shadow-sm">
          <h1 className="text-green-800 text-2xl font-bold">Sign Up</h1>
        </div>

        <p className="text-gray-600 mb-6">Create an account</p>

        <form onSubmit={handleSignUp} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Enter your username"
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm your password"
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="green-btn w-full py-3 font-semibold text-white rounded-lg shadow-md transition-transform hover:scale-105 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center space-x-2">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="text-gray-500 text-sm">Or With</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <div className="flex justify-center space-x-5 mb-4">
          <button className="bg-white border border-gray-300 rounded-full p-2 shadow hover:shadow-lg transition">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
          </button>
          <button className="bg-white border border-gray-300 rounded-full p-2 shadow hover:shadow-lg transition">
            <img
              src="https://www.svgrepo.com/show/448224/facebook.svg"
              alt="Facebook"
              className="w-6 h-6"
            />
          </button>
        </div>

        <p className="text-sm text-gray-700">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-700 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;