import { useState } from "react";
import DashboardShell from "../DashboardShell";
import{BASE_URI} from "../../../config/api";
const VerifyStudent = () => {

  const [image,setImage]=useState(null);
  const [result,setResult]=useState(null);

  const verify = async ()=>{

    const formData = new FormData();

    formData.append("image",image);

    const res = await fetch(`${BASE_URI}/students/verify`,{
      method:"POST",
      body:formData
    });

    const data = await res.json();

    setResult(data);

  };

  return (
    <DashboardShell title="Verify Student">
    <div className="p-6 rounded-xl bg-slate-900 text-white">

      <h2 className="text-2xl mb-5">
        Verify Student
      </h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e)=>setImage(e.target.files[0])}
      />

      <button
        onClick={verify}
        className="bg-green-600 px-5 py-2 rounded ml-3"
      >
        Verify
      </button>

      {result && (

        <div className="mt-5">

          {result.verified ? (

            <>
              <h3 className="text-green-400 text-xl">
                Verified
              </h3>

              <p>Name : {result.name}</p>

              <p>ID : {result.student_id}</p>

              <p>Confidence : {result.confidence}%</p>

            </>

          ) : (

            <h3 className="text-red-500">
              Face Not Matched
            </h3>

          )}

        </div>

      )}

    </div>
    </DashboardShell>

  );

};

export default VerifyStudent;