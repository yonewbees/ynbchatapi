import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Middleware to check if user is authenticated
export async function routeAuth(req: Request | any, res: Response, next: NextFunction){
    const authHeader:string |undefined = req.headers.authorization;
    const excludedPaths = ['/auth/login','/new-account']

    // Skip authentication for excluded routes
    if ( excludedPaths.includes(req.path)) {
        return next(); 
    }

    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    // "Bearer <token>" format
    const token:string = authHeader.split(" ")[1]; 

    try {
        // Find user with the provided token in the `access` table
        const userAccess = await prisma.access.findFirst({
             where : { token },
             select: {  userId:true , deletedAt:true }, // Include associated user details
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
    } catch (error:any) {
        return res.status(401).json({ error: `Authentication Error: ${error.message}` });
    }
};

module.exports = routeAuth
