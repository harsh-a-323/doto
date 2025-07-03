"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("E:/dev/personal_habbit_tracker/db/src/generated/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new prisma_1.PrismaClient();
function Seeder() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const d = new Date();
            const date = new Date(d.setFullYear(1990, 1, 1));
            // const removeTasks = await prisma.tasks.deleteMany();
            const hashedPassword = yield bcrypt_1.default.hash("12345678@doto", 10);
            const createUser = yield prisma.users.create({
                data: {
                    email: "12345678@example.com",
                    name: "Harsh Arora",
                    accountProvider: "credentials",
                    password: hashedPassword
                },
                select: {
                    id: true
                }
            });
            const task1 = yield prisma.tasks.create({
                data: {
                    userId: createUser.id,
                    title: "Hit the Gym",
                    min_freq_per_week: 4,
                    creation_time: date,
                    endDate: new Date(3000, 12, 31)
                }
            });
            const task2 = yield prisma.tasks.create({
                data: {
                    userId: createUser.id,
                    title: "DSA 5x Ques",
                    min_freq_per_week: 6,
                    creation_time: date,
                    endDate: new Date(3000, 12, 31)
                }
            });
            if (task1 && task2) {
                console.log("Tasks created successfully");
            }
        }
        catch (e) {
            console.error(e);
        }
    });
}
Seeder();
