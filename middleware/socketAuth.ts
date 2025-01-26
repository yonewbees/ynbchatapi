import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function authSocketUSER(socket: any, next: any) {
    try {
        const token:string | undefined = socket.handshake.auth?.token;

        if (!token) {
            const err = new Error("Authentication error: Missing token");
            return next(err);
        }

        // Verify the token
        // Find user with the provided token in the `access` table
        const userAccess = await prisma.access.findFirst({
                where : { token },
                select: {  userId:true , deletedAt:true }, // Include associated user details
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
}


module.exports =  authSocketUSER;
