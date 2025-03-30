import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { middleware } from "./middleware";
const {CreateRoomSchema, SigninSchema, CreateUserSchema} = require("./type");
// const { prismaClient } = require("@repo/db/client")
import cors from "cors";
const { PrismaClient } = require("@prisma/client")
const prismaClient = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors())

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        const token = jwt.sign({
            userId: user?.id
        }, JWT_SECRET);
        res.json({
            token
        })
        res.json({
            token
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})

app.post("/signin", async (req, res) => {
    console.log("Hello")
    console.log(req.body)
    const parsedData = SigninSchema.safeParse(req.body);
    console.log(parsedData);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
    const user = await prismaClient.user.findFirst({
        where: {
            email: req.body.username,
            password: req.body.password
        }
    })
    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET);
    res.json({
        token
    })
}catch(e){
    console.log(e);
}

})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    console.log("creating room");
    console.log(parsedData);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/chats/:roomId", async (req,res) => {
    const roomId = Number(req.params.roomId);
    console.log(roomId);
    const messages = await prismaClient.chat.findMany({
        where:{
            roomId: roomId
        },
        orderBy:{
            id: "desc"
        },
        take: 1000
    });

    res.json({
        messages
    })
});

app.get("/allrooms", middleware, async(req,res) => {
    const rooms = await prismaClient.room.findMany();
    res.json({
        rooms
    })
})

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})


app.listen(3002);