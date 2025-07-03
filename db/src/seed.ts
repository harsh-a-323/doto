import { PrismaClient } from "E:/dev/personal_habbit_tracker/db/src/generated/prisma";
import bcrypt from 'bcrypt'

const prisma = new PrismaClient();

async function Seeder() {
    try {
        const d = new Date();
        const date = new Date( d.setFullYear(1990,1,1));

        // const removeTasks = await prisma.tasks.deleteMany();
        const hashedPassword = await bcrypt.hash("12345678@doto",10);
        const createUser = await prisma.users.create({
            data : {
                email : "12345678@example.com",
                name : "Harsh Arora",
                accountProvider : "credentials",
                password : hashedPassword
            },
            select : {
                id : true
            }
        })
         const task1 = await prisma.tasks.create({
            data :{
                userId : createUser.id,
                title : "Hit the Gym",
                min_freq_per_week : 4,
                creation_time :  date,
                endDate : new Date(3000,12,31)
            }
        })

        const task2 = await prisma.tasks.create({
            
            data : {
                userId : createUser.id,
                title : "DSA 5x Ques",
                min_freq_per_week : 6,
                creation_time : date,
                endDate : new Date(3000,12,31)
            }
        })
        if (task1 && task2){
            console.log("Tasks created successfully")
        }
    }
    catch(e){
        console.error(e);
    }

}
Seeder();