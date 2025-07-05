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
        if (!userId ) {
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

        // Create start and end of day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get the latest status for each task on the specified date
        const logs = await prisma.taskslogs.findMany({
            where: {
                userId : Number(userId),
                update_time: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: {
                update_time: 'desc'
            }
        });

        // Get only the most recent entry for each task
        const latestLogs = logs.reduce((acc, log) => {
            if (!acc[log.taskId] || log.update_time > acc[log.taskId].update_time) {
                acc[log.taskId] = log;
            }
            return acc;
        }, {} as Record<number, any>);

        // Convert BigInt to Number for JSON serialization
        const result = Object.values(latestLogs).map(log => ({
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

    } catch (e) {
        console.error('Error fetching task status:', e);
        return NextResponse.json(
            { error: "Failed to fetch task status" },
            { status: 500 }
        );
    }
}