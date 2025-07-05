import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Define types for better type safety
type TaskLog = {
    taskId: number;
    update_time: Date;
    curr_status: boolean;
};

type TaskFrequency = {
    taskId: number;
    frequency: number;
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

        // Calculate week boundaries
        const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        const weekStart = new Date(targetDate);
        weekStart.setDate(targetDate.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(targetDate);
        weekEnd.setDate(targetDate.getDate() + (6 - dayOfWeek));
        weekEnd.setHours(23, 59, 59, 999);

        // Get all completed tasks for the week
        const weeklyLogs: TaskLog[] = await prisma.taskslogs.findMany({
            where: {
                userId: userIdNum,
                update_time: {
                    gte: weekStart,
                    lte: weekEnd
                },
                curr_status: true // Only count completed tasks
            },
            select: {
                taskId: true,
                update_time: true,
                curr_status: true
            }
        });

        // Group by task and count unique days
        const taskFrequency: Record<number, Set<string>> = weeklyLogs.reduce(
            (acc: Record<number, Set<string>>, log: TaskLog) => {
                const taskId = log.taskId;
                const logDate = log.update_time.toDateString();
                
                if (!acc[taskId]) {
                    acc[taskId] = new Set<string>();
                }
                acc[taskId].add(logDate);
                
                return acc;
            }, 
            {} as Record<number, Set<string>>
        );

        // Convert to frequency count with proper typing
        const freq: TaskFrequency[] = Object.entries(taskFrequency).map(([taskIdStr, dateSet]) => ({
            taskId: parseInt(taskIdStr, 10),
            frequency: (dateSet as Set<string>).size
        }));

        return NextResponse.json({
            success: true,
            freq: freq,
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            targetDate: dateParam
        });

    } catch (error: unknown) {
        console.error('Error fetching task frequency:', error);
        
        // Better error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return NextResponse.json(
            { 
                error: "Failed to fetch task frequency",
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
}