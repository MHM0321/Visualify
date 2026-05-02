import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from "react-hot-toast";
import { API } from '../config';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
    // Redirects the user to the backend Google Auth trigger[cite: 13]
    window.location.href = `${API}/api/users/google`;
  };

  const handleLogin = async () => {
    try {
        if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(email.trim())) {
          toast.error("Please use a valid @gmail.com address for email/password login.");
          return;
        }
        const res = await axios.post(`${API}/api/users/login`, {
            email,
            password
        });
        localStorage.setItem("token", res.data.token);
        toast.success("Successful Log in !");
        navigate("/home");
    }
    catch (error) {
        console.log("Error logging in");
        toast.error(error?.response?.data || "Failed to Log in");
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

        <button
          onClick={handleGoogleLogin}
          className="bg-white text-black border border-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
        >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
          Continue with Google
        </button>
        
      </div>
    </div>
  );
};

export default Login;