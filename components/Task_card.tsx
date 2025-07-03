'use client'
import { Tasks } from "@/lib/Types";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Task_Card({ task, date }: { task: Tasks, date: Date }) {
    const [isChecked, setIsChecked] = useState(task.status);
    const [taskfreq, setTaskfreq] = useState(task.curr_freq ?? 0);
    const [isLoading, setIsLoading] = useState(false);
    const curr_date = new Date(date);
    const now_date = new Date();
    curr_date.setHours(now_date.getHours(),now_date.getMinutes(),now_date.getSeconds());
    const server =  useSession();

    async function handleChangeCheckbox() {
        const newChecked = !isChecked;
        setIsChecked(newChecked);
        setTaskfreq(prev => newChecked ? prev + 1 : prev - 1);
        setIsLoading(true);
        // console.log("Date sent : ",curr_date);
        try {
            const resp = await fetch("/api/tasks/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId : server?.data?.user.id,
                    taskId: task.id,
                    new_status: newChecked,
                    curr_date: curr_date
                })
            });

            if (!resp.ok) {
                throw new Error("Failed to update task");
            }
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert state if update fails
            setIsChecked(!newChecked);
            setTaskfreq(prev => newChecked ? prev - 1 : prev + 1);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex justify-between items-center border-gray-200 rounded-lg border p-5 m-3 bg-white">
            <div className="inline-flex items-center">
                <label className="flex items-center cursor-pointer relative" htmlFor={`check-${task.id}`}>
                    <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isLoading}
                        className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800 disabled:opacity-50"
                        id={`check-${task.id}`}
                        onChange={handleChangeCheckbox}
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"
                            stroke="currentColor" strokeWidth="1">
                            <path fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"></path>
                        </svg>
                    </span>
                </label>
                <label className="cursor-pointer ml-2 text-slate-600 text-sm" htmlFor={`check-${task.id}`}>
                    {task.title}
                </label>
            </div>
            <div>
                {!isLoading && <div className="ml-2 text-s text-gray-500">{taskfreq}/{task.min_freq_per_week}</div>}
                {isLoading && <span className="ml-2 text-s text-gray-500">0/{task.min_freq_per_week}</span>}
            </div>
        </div>
    );
}
