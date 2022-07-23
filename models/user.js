const mongoose = require("mongoose");
const crypto = require("crypto");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      max: 15,
      unique: true,
      index: true,
      lowercase: true,
    },

    name: {
      type: String,
      trim: true,
      required: true,
      max: 40,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      max: 40,
      lowercase: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String, //how strong the hashing will be
    role: {
      type: String,
      default: "subscriber",
    },
    resetPasswordLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

//virtual field
//methods =>authenticate,encryptPassword,makeSalt

userSchema
  .virtual("password")
  //*taking the pw from fronend and hashing it to store in db
  .set(function (password) {
    //create temp var called password
    this._password = password;
    //generate salt
    this.salt = this.makeSalt();
    //encrypt password
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (incomingPassword) {
    return this.encryptPassword(incomingPassword) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};
//export user schema model

module.exports = mongoose.model("User", userSchema);
