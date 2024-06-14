import multer from "multer";
const path = require("path");

class UploadFile {
  private storage: multer.StorageEngine;
  private dir = path.join(
    process.env.NODE_ENV === "development"
      ? "public/profile_image"
      : "dist/public/profile_image"
  );

  constructor() {
    this.storage = multer.diskStorage({
      destination: (
        req: any,
        file: any,
        cb: (error: Error | null, destination: string) => void
      ) => {
        cb(null, this.dir);
      },
      filename: (
        req: any,
        file: { originalname: string },
        cb: (error: Error | null, filename: string) => void
      ) => {
        cb(null, Date.now() + "-" + file.originalname);
      },
    });
  }

  public uploadImage() {
    return multer({ storage: this.storage });
  }
}

export default UploadFile;
