"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
}
exports.default = errorHandler;
