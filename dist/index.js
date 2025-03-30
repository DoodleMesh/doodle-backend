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
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const { CreateRoomSchema, SigninSchema, CreateUserSchema } = require("./type");
// const { prismaClient } = require("@repo/db/client")
const cors_1 = __importDefault(require("cors"));
const { PrismaClient } = require("@prisma/client");
const prismaClient = new PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        });
        return;
    }
    try {
        const user = yield prismaClient.user.create({
            data: {
                email: (_a = parsedData.data) === null || _a === void 0 ? void 0 : _a.username,
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user === null || user === void 0 ? void 0 : user.id
        }, config_1.JWT_SECRET);
        res.json({
            token
        });
        res.json({
            token
        });
    }
    catch (e) {
        res.status(411).json({
            message: "User already exists with this username"
        });
    }
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hello");
    console.log(req.body);
    const parsedData = SigninSchema.safeParse(req.body);
    console.log(parsedData);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        });
        return;
    }
    try {
        const user = yield prismaClient.user.findFirst({
            where: {
                email: req.body.username,
                password: req.body.password
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user === null || user === void 0 ? void 0 : user.id
        }, config_1.JWT_SECRET);
        res.json({
            token
        });
    }
    catch (e) {
        console.log(e);
    }
}));
app.post("/room", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    console.log("creating room");
    console.log(parsedData);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        });
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;
    try {
        const room = yield prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        });
        res.json({
            roomId: room.id
        });
    }
    catch (e) {
        res.status(411).json({
            message: "Room already exists with this name"
        });
    }
}));
app.get("/chats/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = Number(req.params.roomId);
    console.log(roomId);
    const messages = yield prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 1000
    });
    res.json({
        messages
    });
}));
app.get("/allrooms", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield prismaClient.room.findMany();
    res.json({
        rooms
    });
}));
app.get("/room/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const room = yield prismaClient.room.findFirst({
        where: {
            slug
        }
    });
    res.json({
        room
    });
}));
app.listen(3002);
