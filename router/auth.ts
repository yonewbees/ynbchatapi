import bcrypt from "bcrypt";
import jwt from  'jsonwebtoken'
import { Router } from "express";
import { getUserByIdentifier, createDevice, createAccess, createUser } from "../models/models";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

router.post("/auth/login", async (req: any, res: any) => {
  try {
    const { userid, password } = req.body;
 
    // Retrieve the user
    const user: any = await getUserByIdentifier(userid);

    if (!user) {
      res.status(401).json({ error: "User does not exist" });
    }
    const isAuth = await bcrypt.compare(password, user.password);

    if (!isAuth) {
        res.status(401).json({ error: "Incorrect credentials" });
    }

    // Generate a JWT token
    const JWT_SECRET = process.env.SECRET_KEY || "test"
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });


    const userAgent = req.headers["user-agent"];
    const deviceInfo = {
      deviceId: `${userAgent.browser.name}-${userAgent.os.name}-${
        userAgent.device.type || "desktop"
      }`,
      deviceToken: "device-token-placeholder", // Replace with actual device token if available
      type: userAgent.device.type || "desktop",
    };

    const dev = await createDevice(
      user.id,
      deviceInfo.deviceId,
      deviceInfo.deviceToken,
      deviceInfo.type
    );

    await createAccess(
        user.id,
        dev.id,
        token,
    )
    res.json(token);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a user account
router.get("/new-account", async (req: any, res: any) => {
    try{
    const {email,username,passwd,full_name,phone} = req.body
   
    const newUser = await createUser(email,username,passwd,full_name, phone)

    res.json(newUser);
    }
    catch(err:any){
        res.status(500).json({ error: err.message });
    }
});


// Logout from the api
router.get("/logout", async (req: any, res: any) => {
    try{
    const {access:token} = req.body
    await prisma.access.update({
        where: { token },
        data: { deletedAt: new Date() },
    });

    res.json({"message":"Logout was successful!"});
    }
    catch(err:any){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
