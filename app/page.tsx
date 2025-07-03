'use client'

import AddTask from "@/components/AddTaskOverlay";
import { Calendar } from "@/components/Calendar";
import Navbar from "@/components/Navbar";
import Tasks from "@/components/Tasks";
import { useState } from "react";

export default function Home(){
  const [curr_date,setCurrDate] = useState(new Date());
  const [AddTaskOverlay,setTaskoverlay] = useState(false);
  // console.log(curr_date);
  return (
    <div className="bg-zinc-50 min-h-screen overflow-hidden">
      {AddTaskOverlay && <AddTask curr_date={curr_date} setTaskoverlay={setTaskoverlay}/>}
      <Navbar setTaskoverlay = {setTaskoverlay}/>
      <div className="grid grid-cols-5 min-h-screen">
        <div className="col-span-5 lg:col-span-2 mx-2 p-6 overflow-y-auto">
          <Calendar selectedDate={curr_date} onDateSelect={setCurrDate} className="min-w-full"/>
        </div>
        <div className="col-span-5 lg:col-span-3 p-6 overflow-y-auto">
          <Tasks curr_date={curr_date} AddTaskOverlay={AddTaskOverlay}/>
        </div>
      </div>
    </div>
  )
}