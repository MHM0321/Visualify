import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async() => {
    try {
      const res = await axios.post("http://192.168.10.6:5001/api/users/signin", {
            name,
            email,
            password
        });
        toast.success("Successfully Account Created !");
        navigate("/");
    } catch (error) {
      console.log("Error Signing in");
      toast.error("Failed to Sign in");
    }
  };

  return (
    <div className="bg-bc min-h-screen flex items-center justify-center">
      <div className="border border-sc rounded-2xl p-10 w-full max-w-md flex flex-col gap-6">

        <h1 className="text-white text-3xl font-bold text-center">Create Account</h1>
        <p className="text-gray-400 text-center text-sm">Join and start building</p>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-transparent border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-transparent border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-transparent border border-sc rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pm"
          />
        </div>

        <button
          onClick={handleSignup}
          className="bg-pm text-white rounded-xl py-3 font-semibold hover:opacity-90 transition"
        >
          Sign Up
        </button>

        <p className="text-gray-400 text-sm text-center">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/')}
            className="text-pm cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>

      </div>
    </div>
  );
};

export default Signup;