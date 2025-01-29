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
exports.getDeviceInfo = getDeviceInfo;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = require("express");
const models_1 = require("../models/models");
const client_1 = require("@prisma/client");
const ua_parser_js_1 = require("ua-parser-js");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Get Data from useragent
function getDeviceInfo(userAgentString, token) {
    const parser = (0, ua_parser_js_1.UAParser)(userAgentString);
    const { browser, cpu, device } = parser;
    return {
        deviceId: `${browser.name || "unknown-browser"}-${cpu.is('arm') ? "arm" : "unknown-cpu"}-${device.vendor ? device.vendor : "unknown-vendor"} - ${device.model ? device.model : "unknown-device"}`,
        deviceToken: token, // Pass the token directly
        type: device.is('mobile') ? "mobile" : "desktop", // Fallback to desktop if type is undefined
    };
}
router.post("/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Retrieve the user
        const user = yield (0, models_1.getUserByIdentifier)(username);
        console.log('found user', user);
        if (!user) {
            return res.status(401).json({ error: "User does not exist" });
        }
        const isAuth = yield bcrypt_1.default.compare(password, user.password);
        if (!isAuth) {
            return res.status(401).json({ error: "Incorrect credentials" });
        }
        // Generate a JWT token
        const JWT_SECRET = process.env.SECRET_KEY || "test";
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        // Get login device data
        const userAgent = req.headers["user-agent"];
        const deviceInfo = getDeviceInfo(userAgent, token);
        // Save device login data
        const dev = yield (0, models_1.createDevice)(user.id, deviceInfo.deviceId, deviceInfo.deviceToken, deviceInfo.type);
        yield (0, models_1.createAccess)(user.id, dev.id, token);
        return res.json({ access: token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
}));
// Create a user account
router.post("/new-account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password, full_name, phone } = req.body;
        const newUser = yield (0, models_1.createUser)(email, username, password, full_name, phone);
        return res.json(newUser);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}));
// Logout from the api
router.post("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { access: token } = req.body;
        yield prisma.access.update({
            where: { token },
            data: { deletedAt: new Date() },
        });
        return res.json({ "message": "Logout was successful!" });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}));
module.exports = router;
