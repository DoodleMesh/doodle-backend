"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = middleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
function middleware(req, res, next) {
    var _a;
    const token = (_a = req.headers['authorization']) !== null && _a !== void 0 ? _a : "";
    console.log(req.headers);
    console.log(req);
    const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
    if (decoded) {
        // @ts-ignore
        req.userId = decoded.userId;
        next();
    }
    else {
        res.status(403).json({
            message: "Unauthorized"
        });
    }
}
