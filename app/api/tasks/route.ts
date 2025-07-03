import { PrismaClient } from "@/db/src/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const client = new PrismaClient();

export async function GET(request: NextRequest){
    try{
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const userId = searchParams.get('id');
        if(!dateParam){
            return NextResponse.json({
                success : false,
                message : "Provide the date."
            })
        }
        if (!userId ) {
            return NextResponse.json(
                { error: "user Id parameter is required" },
                { status: 400 }
            );
        }

        const tasks = await client.tasks.findMany({where : {
            userId :  Number(userId),
            creation_time : {
                lte : new Date(dateParam) 
            },
            endDate : {
                gte : new Date(dateParam)
            }
        }});
        
            return NextResponse.json({
                tasks
            })
    }catch(e){
         console.error(e);
        return NextResponse.json(
            { error: "Failed to fetch tasks" },
            { status: 500 }
        );
    }finally{
        client.$disconnect();
    }
}