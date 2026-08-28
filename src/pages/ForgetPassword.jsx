import { useState } from "react";
import { Link } from "react-router-dom";
import {BASE_URI} from "../config/api";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const response = await fetch(
        `${BASE_URI}/api/forgetpassword`,
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
        toast.error(data.message);
        return;
      }
      toast.success(data.message);
    } catch(err){
      toast.error("Server error");
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