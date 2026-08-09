import { useState } from "react";
import { Link } from "react-router-dom";
import {BASE_URI} from "../config/api";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {

      const response = await fetch(
        `${BASE_URI}/forgetpassword`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            email
          })
        }
      );


      const data = await response.json();
      if(!response.ok){
        setError(data.message);
        return;
      }
      setMessage(data.message);
    } catch(err){
      setError("Server error");
    }

  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8">

        <h1 className="text-3xl text-center text-cyan-400 font-bold">
          Forgot Password
        </h1>


        <form 
          onSubmit={handleSubmit}
          className="space-y-4 mt-6"
        >

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full rounded-lg bg-slate-800 px-4 py-3"
          />


          {
            error &&
            <p className="text-red-400">{error}</p>
          }


          {
            message &&
            <p className="text-green-400">{message}</p>
          }


          <button
            className="w-full rounded-full bg-cyan-500 py-3"
          >
            Send Reset Link
          </button>


        </form>


        <Link 
          to="/login"
          className="block text-center mt-5 text-cyan-400"
        >
          Back Login
        </Link>


      </div>

    </div>
  );
};


export default ForgotPassword;