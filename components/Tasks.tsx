'use client'
import { useEffect, useState } from "react"
import Task_Card from "./Task_card";
import { useGetTasks } from "@/lib/Hooks";

export default function Task({curr_date , AddTaskOverlay}:{curr_date : Date , AddTaskOverlay : boolean}){
    const getWeek = (date : Date)=>{
        const start = new Date(date);
        const end = new Date(date);
        const day = start.getDay();
        let diff = start.getDate() - day;
        start.setDate(diff);
        diff = end.getDate() +(6-end.getDay());
        end.setDate(diff);
        return {startDate : start, endDate : end};
    }
    
    const [weekend, setWeekend] = useState<{startDate : Date, endDate : Date}>(getWeek(curr_date));
    
    // Use the hook directly, don't store its result in state
    const { tasks, loading, error } =  useGetTasks(curr_date,AddTaskOverlay);
    
    useEffect(()=>{
        setWeekend(getWeek(curr_date));
    },[curr_date,AddTaskOverlay])
    
    // Handle loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center items-center p-8">
                    <div>Loading tasks...</div>
                </div>
            </div>
        );
    }
    
    // Handle error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center items-center p-8">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between px-4 gap-10">
                <div>
                    {   
                        curr_date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <div>
                    {
                        weekend.startDate.toLocaleDateString('en-US',{ 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                        })
                        + " - " +
                        weekend.endDate.toLocaleDateString('en-US',{ 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                        })
                    }
                </div>
            </div>
            <div className="space-y-4">
                {/* Remove this hardcoded example if you don't need it */}
                {/* <Task_Card task={{title : "Task 1" , min_freq_per_week : 4, id : 1 ,status : false}} date={curr_date}/> */}
                
                {tasks.map(task => (
                    <Task_Card 
                        key={task.id} 
                        task={task} 
                        date={curr_date}
                    />
                ))}
            </div>
        </div>
    )
}