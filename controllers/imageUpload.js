const imageUpload = require("../models/imageUpload");
const slugify = require("slugify");
const formidable = require("formidable");
const uuidv4 = require("uuid/v4");
const AWS = require("aws-sdk");
const fs = require("fs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

//s3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACESS_KEY,
  region: process.env.AWS_REGION,
});

//*image was uploaded as form data
// exports.create = (req, res) => {

//     let form = new formidable.IncomingForm();
//         form.parse(req, (err, fields, files) => {
//             if (err) {
//                 return res.status(400).json({
//                     error: 'Image could not upload'
//                 });
//             }
//             // console.table({err, fields, files})
//             const { name, content } = fields;
//             const { image } = files;

//             const slug = slugify(name);
//             let uploadImage = new imageUpload({ name, content, slug });

//             if (image.size > 2000000) {
//                 return res.status(400).json({
//                     error: 'Image should be less than 2mb'
//                 });
//             }
//             // upload image to s3
//             const params = {
//                 Bucket: 'mygallerybricks',
//                 Key: `images/${uuidv4()}`,
//                 Body: fs.readFileSync(image.path),
//                 ACL: 'public-read',
//                 ContentType: `image/jpg`
//             };

//             s3.upload(params, (err, data) => {
//                 if (err) {
//                     console.log(err);
//                     res.status(400).json({ error: 'Upload to s3 failed' });
//                 }
//                 console.log('AWS UPLOAD RES DATA', data);
//                 category.image.url = data.Location;
//                 category.image.key = data.Key;

//                 // save to db
//                 uploadImage.save((err, success) => {
//                     if (err) {
//                         console.log(err);
//                         res.status(400).json({ error: 'Duplicate category' });
//                     }
//                     return res.json(success);
//                 });
//             });
//         });
//     };

exports.create = (req, res) => {
  const { name, image, content } = req.body;
  console.log({ name, image, content });
  // image data
  const base64Data = new Buffer.from(
    image.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const type = image.split(";")[0].split("/")[1];

  const slug = slugify(name);
  let Uploadimg = new imageUpload({ name, content, slug });

  const params = {
    Bucket: "mygallerybricks",
    Key: `images/${uuidv4()}.${type}`,
    Body: base64Data,
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: `image/${type}`,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).json({ error: "Upload to s3 failed" });
    }
    console.log("AWS UPLOAD RES DATA", data);
    Uploadimg.image.url = data.Location;
    Uploadimg.image.key = data.Key;
    // posted by
    Uploadimg.postedBy = req.user._id;

    // save to db
    Uploadimg.save((err, success) => {
      if (err) {
        console.log(err);
        res.status(400).json({ error: "Duplicate category" });
      }
      return res.json(success);
    });
  });
};

exports.list = (req, res) => {
  console.log(req.body);
  const { token } = req.body;
  console.log("token:", token);

  //checking for duplicate emails
  const { _id } = jwt.decode(token);
  // console.log(req.user._id)
  imageUpload.find({ postedBy: _id }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: " could not Find Images",
      });
    }
    res.json(data);
  });
};

// imageUpload.find({}).exec((err, data) => {
//     if (err) {
//         return res.status(400).json({
//             error: 'Categories could not load'
//         });
//     }
//     res.json(data);
// });

exports.remove = (req, res) => {
  const { slug } = req.params;
console.log(slug)
imageUpload.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: "Could not delete category",
      });
    }
    // remove the existing image from s3 before uploading new/updated one
    const deleteParams = {
      Bucket: "mygallerybricks",
      Key: `images/${data.image.key}`,
    };

    s3.deleteObject(deleteParams, function (err, data) {
      if (err) console.log("S3 DELETE ERROR DUING", err);
      else console.log("S3 DELETED DURING", data); // deleted
    });

    res.json({
      message: "Category deleted successfully",
    });
  });
};
