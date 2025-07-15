// hooks/useGetTasks.ts
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";

// Define the final shape of a task object for the frontend
export interface Task {
    id: number;
    title: string;
    description?: string | null;
    min_freq_per_week?: number | null;
    status: boolean;
    curr_freq: number;
}

// Date utility to format date as YYYY-MM-DD
const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export function useGetTasks(currentDate: Date, refresh: boolean) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        // Ensure we don't fetch data until the session is loaded
        if (!session?.user?.id) {
            // Not loading, just waiting for session
            setLoading(false); 
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const dateStr = formatDateForAPI(currentDate);
                const response = await axios.get(`/api/tasks`, {
                    params: {
                        date: dateStr,
                        id: session.user.id
                    }
                });

                if (response.data.success) {
                    setTasks(response.data.tasks);
                } else {
                    throw new Error(response.data.error || "API returned success: false");
                }
            } catch (err) {
                console.error("Error fetching enriched tasks:", err);
                const axiosError = err as AxiosError<{ error: string }>;
                const message = axiosError.response?.data?.error || "Failed to fetch tasks.";
                setError(message);
                setTasks([]); // Clear tasks on error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Dependency array ensures this runs when date, session, or refresh trigger changes
    }, [currentDate, session, refresh]);

    return { tasks, loading, error };
}