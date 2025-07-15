// app/api/tasks/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Define return type for clarity
type EnrichedTask = {
    id: number;
    title: string;
    description?: string | null;
    min_freq_per_week?: number | null;
    status: boolean;
    curr_freq: number;
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const userId = searchParams.get('id');

        // 1. Validate required parameters
        if (!dateParam || !userId) {
            return NextResponse.json({ error: "Date and User ID parameters are required" }, { status: 400 });
        }

        const targetDate = new Date(dateParam);
        const userIdNum = parseInt(userId, 10);

        if (isNaN(targetDate.getTime()) || isNaN(userIdNum)) {
            return NextResponse.json({ error: "Invalid date or User ID format" }, { status: 400 });
        }

        // 2. Define date ranges
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const dayOfWeek = targetDate.getDay();
        const weekStart = new Date(targetDate);
        weekStart.setDate(targetDate.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        // 3. Fetch all data concurrently
        const [baseTasks, dailyLogs, weeklyLogs] = await Promise.all([
            // Get all tasks active on the target date
            prisma.tasks.findMany({
                where: {
                    userId: userIdNum,
                    creation_time: { lte: targetDate },
                    endDate: { gte: targetDate }
                },
                select: {
                    id: true,
                    title: true,
                    min_freq_per_week: true
                }
            }),
            // Get all logs for the target day to determine final status
            prisma.taskslogs.findMany({
                where: {
                    userId: userIdNum,
                    update_time: { gte: startOfDay, lte: endOfDay }
                },
                orderBy: { update_time: 'asc' } // Get logs in order to find the last one
            }),
            // Get all completed logs for the week to calculate frequency
            prisma.taskslogs.findMany({
                where: {
                    userId: userIdNum,
                    update_time: { gte: weekStart, lte: endOfDay }, // Use endOfDay to include today
                    curr_status: true
                },
                select: { taskId: true, update_time: true }
            })
        ]);

        // 4. Process the fetched data
        const statusMap = dailyLogs.reduce((acc, log) => {
            acc.set(log.taskId, log.curr_status);
            return acc;
        }, new Map<number, boolean>());

        const frequencyMap = weeklyLogs.reduce((acc, log) => {
            const dateString = log.update_time.toDateString();
            if (!acc.has(log.taskId)) {
                acc.set(log.taskId, new Set());
            }
            acc.get(log.taskId)!.add(dateString);
            return acc;
        }, new Map<number, Set<string>>());
        
        // 5. Combine data into a single response
        const enrichedTasks: EnrichedTask[] = baseTasks.map(task => ({
            ...task,
            min_freq_per_week: task.min_freq_per_week,
            status: statusMap.get(task.id) || false,
            curr_freq: frequencyMap.get(task.id)?.size || 0
        }));

        return NextResponse.json({
            success: true,
            tasks: enrichedTasks
        });

    } catch (error: unknown) {
        console.error('Error fetching tasks:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            {
                error: "Failed to fetch tasks",
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
}