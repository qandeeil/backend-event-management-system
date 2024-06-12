"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthorizeToken {
    constructor() {
        this.authorize = (req, res, next) => {
            try {
                const authHeader = req.headers["authorization"];
                if (!authHeader) {
                    return res.status(401).json("Unauthorized: No token provided");
                }
                const token = authHeader.split(" ")[1];
                if (!token) {
                    return res.status(401).json("Unauthorized: No token provided");
                }
                const secretOrPublicKey = process.env.SECRET_KEY_TOKEN;
                if (!secretOrPublicKey) {
                    throw new Error("Secret key is not defined");
                }
                jsonwebtoken_1.default.verify(token, secretOrPublicKey, (err, decoded) => {
                    if (err) {
                        return res.status(401).json({
                            authorization: "You no longer have the permissions to complete this action",
                        });
                    }
                    req.user = decoded;
                    next();
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error authorizing token:", error.message);
                    res.status(500).json({ message: error.message });
                }
                else {
                    console.error("Unknown error authorizing token");
                    res.status(500).json({ message: "Unknown error" });
                }
            }
        };
        this.generateAccessCreateAccount = (req, res) => {
            try {
                if (req.query.account_type !== "individual" &&
                    req.query.account_type !== "business") {
                    return res.status(400).json({
                        message: "Invalid account type provided. It must be either 'individual' or 'business'.",
                    });
                }
                const payload = {
                    account_type: req.query.account_type,
                };
                const secretOrPrivateKey = process.env.SECRET_KEY_TOKEN;
                if (!secretOrPrivateKey) {
                    throw new Error("Secret key is not defined");
                }
                const options = {
                    expiresIn: "5m",
                };
                const token = jsonwebtoken_1.default.sign(payload, secretOrPrivateKey, options);
                res.status(200).json(token);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error generating token:", error.message);
                    res.status(500).json({ message: error.message });
                }
                else {
                    console.error("Unknown error generating token");
                    res.status(500).json({ message: "Unknown error" });
                }
            }
        };
        this.generateUserToken = (user) => {
            const payload = {
                user,
            };
            const secretOrPrivateKey = process.env.SECRET_KEY_TOKEN;
            if (!secretOrPrivateKey) {
                throw new Error("Secret key is not defined");
            }
            const token = jsonwebtoken_1.default.sign(payload, secretOrPrivateKey, {
                expiresIn: "5m",
            });
            return token;
        };
    }
}
exports.default = AuthorizeToken;
