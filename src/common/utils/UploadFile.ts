import multer from "multer";
const path = require("path");

class UploadFile {
  private storage: multer.StorageEngine;

  constructor(dirPath: string) {
    this.storage = multer.diskStorage({
      destination: (
        req: any,
        file: any,
        cb: (error: Error | null, destination: string) => void
      ) => {
        cb(null, path.join(dirPath));
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
