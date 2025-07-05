import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest){
    try {
        const body : {userId : number, taskId : number, new_status : boolean, curr_date : Date | string } = await request.json();

        // Ensure we have a proper Date object
        const currentDate = new Date(body.curr_date);
        
        // Validate the date
        if (isNaN(currentDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid date provided" },
                { status: 400 }
            );
        }

        // Create start and end of day properly
        const startOfDay = new Date(currentDate);
        startOfDay.setHours(0, 0, 0, 0); // Set to start of day

        const endOfDay = new Date(currentDate);
        endOfDay.setHours(23, 59, 59, 999); // Set to end of day

        console.log('Date range for deletion:', {
            taskId: body.taskId,
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString(),
            originalDate: body.curr_date
        });

        // Delete previous logs for the same task on the same day
        const deletePrevLogs = await prisma.taskslogs.deleteMany({
            where: {
                taskId: body.taskId,
                update_time: {
                    gte: startOfDay,
                    lte: endOfDay  // Changed from 'lt' to 'lte' to include end of day
                }
            }
        });

        console.log(`Deleted ${deletePrevLogs.count} previous logs`);

        // Create new log entry
        const log = await prisma.taskslogs.create({
            data: {
                userId : Number(body.userId),
                taskId: body.taskId,
                curr_status: body.new_status,
                update_time: currentDate // Use current timestamp instead of provided date
                // Or if you want to use the provided date:
                // update_time: currentDate
            }
        });

        console.log('Created new log:', log);

        return NextResponse.json({
            success: true,
            deletedCount: deletePrevLogs.count,
            newLog: {
                id: Number(log.id), // Convert BigInt to Number
                taskId: log.taskId,
                status: log.curr_status,
                timestamp: log.update_time
            }
        });

    } catch (e) {
        console.error('Error in POST /api/tasks/status:', e);
        return NextResponse.json(
            { 
                error: "Unable to update task status",
                details: e instanceof Error ? e.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}