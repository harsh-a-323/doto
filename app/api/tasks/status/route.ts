import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Define types for better type safety
type TaskLog = {
    id: bigint;
    taskId: number;
    userId: number;
    curr_status: boolean;
    update_time: Date;
};

type TaskLogResponse = {
    id: number;
    taskId: number;
    curr_status: boolean;
    update_time: Date;
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const userId = searchParams.get('id');

        // Validate required parameters
        if (!dateParam) {
            return NextResponse.json(
                { error: "Date parameter is required" },
                { status: 400 }
            );
        }
        
        if (!userId) {
            return NextResponse.json(
                { error: "User ID parameter is required" },
                { status: 400 }
            );
        }

        // Validate date format
        const targetDate = new Date(dateParam);
        if (isNaN(targetDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        // Validate userId is numeric
        const userIdNum = parseInt(userId, 10);
        if (isNaN(userIdNum)) {
            return NextResponse.json(
                { error: "User ID must be a valid number" },
                { status: 400 }
            );
        }

        // Create start and end of day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get the latest status for each task on the specified date
        const logs: TaskLog[] = await prisma.taskslogs.findMany({
            where: {
                userId: userIdNum,
                update_time: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: {
                update_time: 'desc'
            }
        });

        // Get only the most recent entry for each task with proper typing
        const latestLogs: Record<number, TaskLog> = logs.reduce(
            (acc: Record<number, TaskLog>, log: TaskLog) => {
                if (!acc[log.taskId] || log.update_time > acc[log.taskId].update_time) {
                    acc[log.taskId] = log;
                }
                return acc;
            }, 
            {} as Record<number, TaskLog>
        );

        // Convert BigInt to Number for JSON serialization
        const result: TaskLogResponse[] = Object.values(latestLogs).map((log: TaskLog) => ({
            id: Number(log.id),
            taskId: log.taskId,
            curr_status: log.curr_status,
            update_time: log.update_time
        }));

        return NextResponse.json({
            success: true,
            logs: result,
            date: dateParam
        });

    } catch (error: unknown) {
        console.error('Error fetching task status:', error);
        
        // Better error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return NextResponse.json(
            { 
                error: "Failed to fetch task status",
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
}