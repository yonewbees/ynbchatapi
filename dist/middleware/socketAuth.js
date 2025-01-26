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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function authSocketUSER(socket, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
            if (!token) {
                const err = new Error("Authentication error: Missing token");
                return next(err);
            }
            // Verify the token
            // Find user with the provided token in the `access` table
            const userAccess = yield prisma.access.findFirst({
                where: { token },
                select: { userId: true, deletedAt: true }, // Include associated user details
            });
            if (!userAccess || userAccess.deletedAt) {
                const err = new Error("Authentication error: Invalid token");
                return next(err);
            }
            // Attach the user to the socket object
            socket.user = userAccess;
            next();
        }
        catch (error) {
            next(new Error("Authentication error"));
        }
    });
}
exports.default = authSocketUSER;
