import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Define types for better type safety
type Task = {
    id: number;
    userId: number;
    title: string;
    description?: string;
    creation_time: Date;
    endDate: Date;
    // Add other fields as per your schema
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const userId = searchParams.get('id');

        // Validate required parameters
        if (!dateParam) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Date parameter is required"
                },
                { status: 400 }
            );
        }
        
        if (!userId) {
            return NextResponse.json(
                { 
                    success: false,
                    error: "User ID parameter is required" 
                },
                { status: 400 }
            );
        }

        // Validate date format
        const targetDate = new Date(dateParam);
        if (isNaN(targetDate.getTime())) {
            return NextResponse.json(
                { 
                    success: false,
                    error: "Invalid date format" 
                },
                { status: 400 }
            );
        }

        // Validate userId is numeric
        const userIdNum = parseInt(userId, 10);
        if (isNaN(userIdNum)) {
            return NextResponse.json(
                { 
                    success: false,
                    error: "User ID must be a valid number" 
                },
                { status: 400 }
            );
        }

        // Fetch tasks with proper typing
        const tasks: Task[] = await prisma.tasks.findMany({
            where: {
                userId: userIdNum,
                creation_time: {
                    lte: targetDate
                },
                endDate: {
                    gte: targetDate
                }
            }
        });

        return NextResponse.json({
            success: true,
            tasks: tasks
        });

    } catch (error: unknown) {
        console.error('Error fetching tasks:', error);
        
        // Better error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return NextResponse.json(
            { 
                success: false,
                error: "Failed to fetch tasks",
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
    // Note: Removed finally block with prisma.$disconnect() as it's not recommended in serverless environments
}