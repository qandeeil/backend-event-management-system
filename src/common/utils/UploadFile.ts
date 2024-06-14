import multer from "multer";
const path = require("path");

class UploadFile {
  private storage: multer.StorageEngine;
  private dir = path.join("public/profile_image");

  constructor() {
    console.log(">> dir: ", this.dir);
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
