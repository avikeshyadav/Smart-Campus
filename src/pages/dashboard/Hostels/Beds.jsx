    import React, { useState } from "react";
    import { BedDouble, Search } from "lucide-react";

    const beds=Array.from({length:30},(_,i)=>({room:101+i,bed:1+(i%3),student:i%4===0?"Aman Kumar":i%4===1?"Rohan Singh":i%4===2?"Aditya Raj":"",status:i%4===3?"Vacant":"Occupied"}));

    export default function Beds(){
    const [q,setQ]=useState("");
    const filtered=beds.filter(x=>String(x.room).includes(q)||x.student.toLowerCase().includes(q.toLowerCase()));
    return <section className="p-6"><div className="flex justify-between"><div><h2 className="text-2xl font-bold">Bed Management</h2><p className="text-sm text-slate-500 mt-1">Track all 270 beds and their current assignments.</p></div></div>
    <div className="grid md:grid-cols-4 gap-3 mt-5">{[["Total Beds","270"],["Occupied","216"],["Vacant","54"],["Maintenance","0"]].map(x=><div className="p-4 rounded-xl border border-slate-800 bg-[#071022]" key={x[0]}><BedDouble className="text-cyan-300"/><div className="text-xs text-slate-500 mt-2">{x[0]}</div><div className="text-2xl font-bold">{x[1]}</div></div>)}</div>
    <div className="mt-5 rounded-xl border border-slate-800 bg-[#071022] p-4"><div className="flex items-center gap-2 w-full md:w-96 bg-[#0a1428] border border-slate-700 rounded-lg px-3"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} className="bg-transparent outline-none py-2 text-sm w-full" placeholder="Search room or resident"/></div></div>
    <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">{filtered.map((b,i)=><div key={i} className="p-4 rounded-xl border border-slate-800 bg-[#091226]"><div className="flex justify-between"><b>Room {b.room}</b><span className={`text-xs ${b.status==="Vacant"?"text-amber-400":"text-emerald-400"}`}>{b.status}</span></div><div className="mt-4 flex items-center gap-3"><BedDouble className="text-cyan-300"/><div><div className="text-sm">Bed {b.bed}</div><div className="text-xs text-slate-500">{b.student||"Available for allocation"}</div></div></div></div>)}</div>
    </section>
    }
