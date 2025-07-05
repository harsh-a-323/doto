import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest){
    const body = await request.json();
    if(!(body.title && body.min_freq_per_week && body.userId)){
        return NextResponse.json({
            success : false,
            message : "Provide all required fields."
        })
    }
    else {
        try{
            const resp = await prisma.tasks.create({data : {
                title :  body.title,
                min_freq_per_week :  body.min_freq_per_week > 7 ? 7 : body.min_freq_per_week,
                creation_time : body.creation_time || new Date(),
                endDate : body.endDate || new Date(3000,12,31),
                userId : Number(body.userId)
            }})
            return NextResponse.json({
                success : true,
                message : "task created successfully"
            })
        }catch(e){
            // console.log(e);
            return NextResponse.json({
                success : false,
                message : "Error creating task."
            })
        }
    }
}
