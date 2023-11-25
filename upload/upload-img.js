const multer = require("multer");
const { mkdirp } = require("mkdirp");
const path = require('path');

const uploadImg = (type) => {
  const path = `./public/images/${type}`;
  mkdirp.sync(path);
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname);
    },
  });

  const upload = multer({
    storage: storage,
    limits:{
      fileSize: 1024 * 1024 * 1
    },
    fileFilter: function (req, file, cb) {
      const allowedTypes = ["png", "jpg", "jpeg"];
      const extentionF = file.originalname.split(".");
      const extention = extentionF[extentionF.length - 1];
      if (!allowedTypes.includes(extention)) {
        return cb(new Error("File type is not supported"));
      }
      cb(null, true);
    },
  }).single(type);
  return upload;
};

module.exports = {
  uploadImg,
};
