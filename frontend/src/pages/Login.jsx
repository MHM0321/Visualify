import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
        const res = await axios.post("http://localhost:5001/api/users/login", {
            email,
            password
        });
        localStorage.setItem("token", res.data.token);
        toast.success("Successful Log in !");
        navigate("/home");
    }
    catch (error) {
        console.log("Error logging in");
        toast.error("Failed to Log in");
    }
  };

  return (
    <div className="bg-bc min-h-screen flex items-center justify-center">
      <div className="border border-sc rounded-2xl p-10 w-full max-w-md flex flex-col gap-6">

        <h1 className="text-white text-3xl font-bold text-center">Welcome Back</h1>
        <p className="text-gray-400 text-center text-sm">Log in to your account</p>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-bc border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sc"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-bc border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sc"
          />
        </div>

        <button
          onClick={handleLogin}
          className="bg-pm text-white rounded-xl py-3 font-semibold hover:opacity-90 transition"
        >
          Log In
        </button>

        <p className="text-gray-400 text-sm text-center">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-pm cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;