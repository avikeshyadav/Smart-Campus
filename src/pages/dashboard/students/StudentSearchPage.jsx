import React, { useRef, useState } from "react";
import DashboardShell from "../DashboardShell";

import {
  Camera,
  Search,
  UserRound,
  CheckCircle,
  ScanFace,
} from "lucide-react";


const StudentSearchPage = () => {


  const videoRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);

  const [student, setStudent] = useState(null);



  // Start Camera

  const startCamera = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video:true,
        });


      videoRef.current.srcObject = stream;

      setCameraOn(true);


    } catch(error){

      console.log(error);

    }

  };




  // Demo Face Search

  const searchFace = () => {


    // yaha backend face API call hoga

    setStudent({

      name:"Rahul Sharma",

      id:"STU-10245",

      class:"10th A",

      attendance:"94%",

      status:"Active",

      accuracy:"98.7%",

      image:
      "https://i.pravatar.cc/300?img=12"

    });


  };




return (

<DashboardShell title="Face Student Search">


<div className="space-y-6">


{/* Header */}

<div
className="
rounded-2xl
border
border-slate-800
bg-slate-900/90
p-6
"
>

<div className="flex items-center gap-3">

<div
className="
rounded-xl
bg-cyan-500/10
p-3
text-cyan-400
"
>

<ScanFace size={28}/>

</div>


<div>

<h2
className="
text-2xl
font-semibold
text-white
"
>

Face Recognition Search

</h2>


<p className="text-sm text-slate-400">

Search student using live camera face detection

</p>


</div>


</div>


</div>







<div
className="
grid
gap-6
xl:grid-cols-3
"
>





{/* CAMERA SECTION */}


<div
className="
xl:col-span-2
rounded-2xl
border
border-slate-800
bg-slate-900
p-5
"
>


<div
className="
mb-4
flex
items-center
justify-between
"
>


<h3
className="
text-lg
font-semibold
text-white
"
>

Live Camera

</h3>


<div
className="
flex
gap-2
"
>


<button

onClick={startCamera}

className="
flex
items-center
gap-2
rounded-xl
bg-cyan-500
px-4
py-2
text-sm
font-semibold
text-white
hover:bg-cyan-600
"

>

<Camera size={18}/>

Start

</button>



<button

onClick={searchFace}

className="
flex
items-center
gap-2
rounded-xl
border
border-cyan-500
px-4
py-2
text-sm
text-cyan-400
hover:bg-cyan-500/10
"

>

<Search size={18}/>

Search Face

</button>



</div>


</div>





<div
className="
relative
overflow-hidden
rounded-2xl
bg-black
"
>


<video

ref={videoRef}

autoPlay

playsInline

className="
h-[420px]
w-full
object-cover
"

/>





{/* Face Scan Box */}

<div
className="
absolute
left-1/2
top-1/2
h-56
w-56
-translate-x-1/2
-translate-y-1/2
rounded-3xl
border-4
border-cyan-400
shadow-[0_0_40px_#22d3ee]
"
>


<div
className="
absolute
left-0
top-0
h-5
w-5
border-l-4
border-t-4
border-white
"
/>


<div
className="
absolute
right-0
top-0
h-5
w-5
border-r-4
border-t-4
border-white
"
/>


<div
className="
absolute
bottom-0
left-0
h-5
w-5
border-b-4
border-l-4
border-white
"
/>


<div
className="
absolute
bottom-0
right-0
h-5
w-5
border-b-4
border-r-4
border-white
"
/>


</div>




</div>


</div>








{/* STUDENT DETAILS */}


<div
className="
rounded-2xl
border
border-slate-800
bg-slate-900
p-5
"
>


<h3
className="
mb-5
text-lg
font-semibold
text-white
"
>

Student Details

</h3>



{
student ? (

<div
className="
space-y-5
"
>


<div
className="
flex
items-center
gap-4
"
>

<img

src={student.image}

className="
h-24
w-24
rounded-2xl
object-cover
border
border-cyan-500
"

/>


<div>

<h4
className="
text-xl
font-bold
text-white
"
>

{student.name}

</h4>


<p className="text-sm text-slate-400">

ID: {student.id}

</p>


</div>


</div>





<div className="space-y-3">


<Detail
title="Class"
value={student.class}
/>


<Detail
title="Attendance"
value={student.attendance}
/>


<Detail
title="Status"
value={student.status}
/>


<Detail
title="Face Match"
value={student.accuracy}
/>



</div>



<div
className="
flex
items-center
gap-2
rounded-xl
bg-green-500/10
p-3
text-green-400
"
>

<CheckCircle size={18}/>

Face Verified

</div>



</div>


):(


<div
className="
flex
h-72
flex-col
items-center
justify-center
text-center
text-slate-400
"
>


<UserRound
size={50}
className="mb-3"
/>


<p>

Waiting for face detection...

</p>


</div>


)

}



</div>






</div>


</div>


</DashboardShell>

);

};




const Detail = ({title,value}) => (

<div
className="
flex
justify-between
rounded-xl
bg-slate-950
px-4
py-3
"
>

<span className="text-slate-400">

{title}

</span>


<span className="font-semibold text-white">

{value}

</span>


</div>

);



export default StudentSearchPage;