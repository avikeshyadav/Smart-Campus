import React, { useMemo, useState } from "react";
import { Search, UserRound, MoreVertical } from "lucide-react";

const residents=Array.from({length:24},(_,i)=>({name:["Aman Kumar","Rohan Singh","Aditya Raj","Vikas Kumar"][i%4],roll:`23BCA${101+i}`,room:101+(i%10),bed:(i%3)+1,floor:i%2?"1st Floor":"Ground Floor",course:"BCA",status:"Active"}));

export default function Residents(){
 const [q,setQ]=useState("");
 const list=useMemo(()=>residents.filter(r=>`${r.name}${r.roll}${r.room}`.toLowerCase().includes(q.toLowerCase())),[q]);
 return <section className="p-6"><div className="flex justify-between"><div><h2 className="text-2xl font-bold">Residents Directory</h2><p className="text-sm text-slate-500 mt-1">Students currently allocated to hostel rooms.</p></div><button className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">+ Add Resident</button></div>
 <div className="mt-5 rounded-xl border border-slate-800 bg-[#071022] overflow-hidden"><div className="p-4 border-b border-slate-800 flex items-center gap-2"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} className="bg-transparent outline-none w-full" placeholder="Search resident, roll number or room..."/></div>
 <table className="w-full text-sm"><thead className="bg-[#0b1529] text-slate-500"><tr>{["Resident","Roll No.","Room","Bed","Floor","Course","Status",""].map(x=><th className="text-left p-4" key={x}>{x}</th>)}</tr></thead><tbody>{list.slice(0,15).map((r,i)=><tr className="border-t border-slate-800" key={i}><td className="p-4 flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-slate-700 grid place-items-center"><UserRound size={16}/></div><b>{r.name}</b></td><td className="p-4 text-slate-400">{r.roll}</td><td className="p-4">{r.room}</td><td className="p-4">Bed {r.bed}</td><td className="p-4 text-slate-400">{r.floor}</td><td className="p-4 text-slate-400">{r.course}</td><td className="p-4 text-emerald-400">{r.status}</td><td className="p-4"><MoreVertical size={18}/></td></tr>)}</tbody></table></div>
 </section>
}
