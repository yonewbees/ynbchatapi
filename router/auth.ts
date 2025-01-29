import bcrypt from "bcrypt";
import jwt from  'jsonwebtoken'
import { Router } from "express";
import { getUserByIdentifier, createDevice, createAccess, createUser } from "../models/models";
import { PrismaClient } from '@prisma/client';
import { UAParser } from 'ua-parser-js';

const prisma = new PrismaClient();
const router = Router();

// Get Data from useragent
export function getDeviceInfo(userAgentString: string | undefined, token: string) {
  const parser = UAParser(userAgentString);
  const { browser, cpu, device } = parser
  return {
    deviceId: `${browser.name || "unknown-browser"}-${cpu.is('arm') ? "arm" : "unknown-cpu"}-${device.vendor ? device.vendor : "unknown-vendor"} - ${device.model ? device.model : "unknown-device"}`,
    deviceToken: token, // Pass the token directly
    type: device.is('mobile') ? "mobile" : "desktop", // Fallback to desktop if type is undefined
  };
}

router.post("/auth/login", async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    
    // Retrieve the user
    const user: any = await getUserByIdentifier(username);

    console.log('found user',user)

    if (!user) {
      return res.status(401).json({ error: "User does not exist" });
    }
    const isAuth = await bcrypt.compare(password, user.password);

    if (!isAuth) {
      return  res.status(401).json({ error: "Incorrect credentials" });
    }

    // Generate a JWT token
    const JWT_SECRET = process.env.SECRET_KEY || "test"
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    // Get login device data
    const userAgent = req.headers["user-agent"]; 
    const deviceInfo = getDeviceInfo(userAgent,token)
    // Save device login data
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
    return res.json({ access:token});
  } catch (error: any) {
    console.log(error)
    return res.status(500).json({ error: error.message });
  }
});

// Create a user account
router.post("/new-account", async (req: any, res: any) => {
    try{
    const {email,username,password,full_name,phone} = req.body
    const newUser = await createUser(email,username,password,full_name, phone)
    return res.json(newUser);
    }
    catch(err:any){
      return  res.status(500).json({ error: err.message });
    }
});


// Logout from the api
router.post("/logout", async (req: any, res: any) => {
    try{
    const {access:token} = req.body
    await prisma.access.update({
        where: { token },
        data: { deletedAt: new Date() },
    });

    return res.json({"message":"Logout was successful!"});
    }
    catch(err:any){
      return  res.status(500).json({ error: err.message });
    }
});

module.exports = router;
