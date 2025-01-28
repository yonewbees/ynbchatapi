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
exports.routeAuth = routeAuth;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Middleware to check if user is authenticated
function routeAuth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        const excludedPaths = ['/auth/login', '/new-account'];
        // Skip authentication for excluded routes
        if (excludedPaths.includes(req.path)) {
            return next();
        }
        if (!authHeader) {
            return res.status(401).json({ error: "Unauthorized: Missing token" });
        }
        // "Bearer <token>" format
        const token = authHeader.split(" ")[1];
        try {
            // Find user with the provided token in the `access` table
            const userAccess = yield prisma.access.findFirst({
                where: { token },
                select: { userId: true, deletedAt: true }, // Include associated user details
            });
            if (!userAccess || userAccess.deletedAt) {
                return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
            }
            // Attach user details to the request for use in the route handlers
            req.user = {
                id: userAccess.userId,
                // is_active: userAccess.users.is_active,
            };
            next(); // Proceed to the next middleware or route handler
        }
        catch (error) {
            return res.status(401).json({ error: `Authentication Error: ${error.message}` });
        }
    });
}
;
module.exports = routeAuth;
