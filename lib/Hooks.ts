import { useEffect, useState } from "react";
import { Tasks } from "./Types";
import axios from "axios";
import { useSession } from "next-auth/react";

interface BaseTasksType extends Pick<Tasks, 'id' | 'title' | 'min_freq_per_week'> {}

// Date utility function
const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function useGetTasks(curr_date: Date , refresh : boolean) {
    const [tasks, setTasks] = useState<Tasks[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const session =  useSession();


    const getTasks = async (): Promise<BaseTasksType[] | undefined> => {
        try {
            const resp = await axios.get(`/api/tasks?date=${curr_date}&id=${session?.data?.user.id}`);
            const tasks: BaseTasksType[] = resp.data.tasks; 
            return tasks;
        } catch (e) {
            console.error("Error fetching tasks:", e);
            setError("Failed to fetch tasks");
            return undefined;
        }
    }

    const getTasksStatus = async (): Promise<any[] | undefined> => {
        try {
            const dateStr = formatDateForAPI(curr_date);
            const resp = await axios.get(`/api/tasks/status?date=${dateStr}&id=${session?.data?.user.id}`);
            
            if (resp.data.success) {
                return resp.data.logs;
            } else {
                console.error("API returned success: false");
                return [];
            }
        } catch (e) {
            console.error("Error fetching task status:", e);
            setError("Failed to fetch task status");
            return undefined;
        }
    }

    const getTasksFreq = async (): Promise<any[] | undefined> => {
        try {
            const dateStr = formatDateForAPI(curr_date);
            const resp = await axios.get(`/api/tasks/freq?date=${dateStr}&id=${session?.data?.user.id}`);
            
            if (resp.data.success) {
                return resp.data.freq;
            } else {
                console.error("API returned success: false");
                return [];
            }
        } catch (e) {
            console.error("Error fetching task frequency:", e);
            setError("Failed to fetch task frequency");
            return undefined;
        }
    }

    // Function to update task status (you can export this for use in components)
    const updateTaskStatus = async (taskId: number, newStatus: boolean): Promise<boolean> => {
        try {
            const resp = await axios.post('/api/tasks/status?id=${session?.user.id}', {
                taskId: taskId,
                new_status: newStatus,
                curr_date: curr_date
            });
            
            if (resp.data.success) {
                // Refresh the tasks after update
                const [statusData, freqData] = await Promise.all([
                    getTasksStatus(),
                    getTasksFreq()
                ]);
                
                // Update tasks state with new data
                setTasks(prevTasks => 
                    prevTasks.map(task => {
                        if (task.id === taskId) {
                            const taskStatus = statusData?.find(s => s.taskId === task.id);
                            const taskFreq = freqData?.find(f => f.taskId === task.id);
                            
                            return {
                                ...task,
                                status: taskStatus?.curr_status ?? newStatus,
                                curr_freq: taskFreq?.frequency || 0
                            };
                        }
                        return task;
                    })
                );
                
                return true;
            }
            return false;
        } catch (e) {
            console.error("Error updating task status:", e);
            return false;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const [baseTasks, statusData, freqData] = await Promise.all([
                    getTasks(),
                    getTasksStatus(),
                    getTasksFreq()
                ]);

                if (baseTasks) {
                    const enrichedTasks: Tasks[] = baseTasks.map(task => {
                        // Find status for this task
                        const taskStatus = statusData?.find(s => s.taskId === task.id);
                        
                        // Find frequency for this task
                        const taskFreq = freqData?.find(f => f.taskId === task.id);
                        
                        return {
                            ...task,
                            status: taskStatus?.curr_status || false,
                            curr_freq: taskFreq?.frequency || 0
                        };
                    });
                    
                    setTasks(enrichedTasks);
                } else {
                    setTasks([]);
                }
            } catch (e) {
                console.error("Error in fetchData:", e);
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [curr_date,refresh]);

    console.log(tasks);

    return { 
        tasks, 
        loading, 
        error, 
    };
}