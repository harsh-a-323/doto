'use client'
import axios from "axios"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export default function AddTask({
    setTaskoverlay,
    curr_date
}: {
    curr_date: Date
    setTaskoverlay: (displayOverlay: boolean) => void
}) {
    const [title, setTitle] = useState<string>("")
    const [freq, setFreq] = useState<number>(1)
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isVisible, setIsVisible] = useState(false)
    const [isExiting, setIsExiting] = useState(false)
    const session = useSession();

    console.log(startDate, " ", endDate);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 200)
        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(() => {
            setTaskoverlay(false)
        }, 300) // Match the animation duration
    }

    // Helper function to format date for input
    const formatDateForInput = (date: Date | undefined): string => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    }

    const handleAddTask = async () => {
        startDate!.setHours(0,0,0,0);
        endDate!.setHours(0,0,0,0);
        const task: AddTask = {
            title: title,
            min_freq_per_week: freq,
            creation_time: startDate || new Date(),
            end_date: endDate || new Date(3000,12,31)
        }

        const d = new Date(task.creation_time)
        d.setHours(0, 0, 0, 0)

        try {
            // console.log("sending req")
            
            const resp = await axios.post("/api/tasks/create", {
                userId: session?.data?.user.id,
                title: task.title,
                min_freq_per_week: task.min_freq_per_week,
                creation_time: task.creation_time,
                endDate: task.end_date
            })
            if (resp.data.success) {
                handleClose()
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className={`fixed inset-0 backdrop-blur-[3px] min-h-screen flex items-center justify-end p-4 transition-all duration-300 ease-in-out ${
            isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}>
            <div className={`bg-white rounded-xl flex flex-col gap-6 p-6 w-full max-w-md h-full shadow-lg transition-transform duration-300 ease-in-out ${
                isExiting 
                    ? 'transform translate-x-full' 
                    : isVisible 
                        ? 'transform translate-x-0' 
                        : 'transform translate-x-full'
            }`}>
                <div className="flex justify-end">
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                    >
                        ×
                    </button>
                </div>
                <div className="flex flex-col gap-3">
                    <label htmlFor="title" className="block text-xl font-medium">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="py-2.5 sm:py-3 px-4 block w-full border border-gray-400 rounded-lg sm:text-sm"
                        placeholder="Hit the Gym"
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <label htmlFor="freq" className="block text-xl font-medium">Frequency per Week</label>
                    <input
                        type="number"
                        id="freq"
                        value={freq}
                        onChange={e => setFreq(Number(e.target.value))}
                        className="py-2.5 sm:py-3 px-4 block w-full border border-gray-400 rounded-lg sm:text-sm"
                        placeholder="7"
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <label htmlFor="startDate" className="block text-xl font-medium">Start Date</label>
                    <input
                        type="date"
                        id="startDate"
                        value={formatDateForInput(startDate)}
                        onChange={e => setStartDate(new Date(e.target.value))}
                        className="py-2.5 sm:py-3 px-4 block w-full border border-gray-400 rounded-lg sm:text-sm"
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <label htmlFor="endDate" className="block text-xl font-medium">End Date</label>
                    <input
                        type="date"
                        id="endDate"
                        value={formatDateForInput(endDate)}
                        onChange={e => setEndDate(new Date(e.target.value))}
                        className="py-2.5 sm:py-3 px-4 block w-full border border-gray-400 rounded-lg sm:text-sm"
                    />
                </div>
                <button
                    onClick={handleAddTask}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
                >
                    Add Task
                </button>
            </div>
        </div>
    )
}

interface AddTask {
    title: string,
    min_freq_per_week: number,
    creation_time: Date,
    start_date?: Date,
    end_date?: Date
}