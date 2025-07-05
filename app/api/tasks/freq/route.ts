import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const userId = searchParams.get('id');

        if (!dateParam) {
            return NextResponse.json(
                { error: "Date parameter is required" },
                { status: 400 }
            );
        }
        if (!userId) {
            return NextResponse.json(
                { error: "user Id parameter is required" },
                { status: 400 }
            );
        }

        const targetDate = new Date(dateParam);
        
        if (isNaN(targetDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
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
        const weeklyLogs = await prisma.taskslogs.findMany({
            where: {
                userId: Number(userId),
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
        const taskFrequency = weeklyLogs.reduce((acc: Record<number, Set<string>>, log: { taskId: number; update_time: Date; curr_status: boolean }) => {
            const taskId = log.taskId;
            const logDate = log.update_time.toDateString(); // Get just the date part
            
            if (!acc[taskId]) {
                acc[taskId] = new Set();
            }
            acc[taskId].add(logDate);
            
            return acc;
        }, {} as Record<number, Set<string>>);

        // Convert to frequency count
        const freq = Object.entries(taskFrequency).map(([taskId, dateSet]) => ({
            taskId: parseInt(taskId),
            frequency: dateSet.size
        }));

        return NextResponse.json({
            success: true,
            freq: freq,
            weekStart: weekStart.toISOString().split('T')[0], // Just send date part
            weekEnd: weekEnd.toISOString().split('T')[0],     // Just send date part
            targetDate: dateParam
        });

    } catch (e) {
        console.error('Error fetching task frequency:', e);
        return NextResponse.json(
            { error: "Failed to fetch task frequency" },
            { status: 500 }
        );
    }
}