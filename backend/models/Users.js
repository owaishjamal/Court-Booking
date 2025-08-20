const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures email is unique
      lowercase: true, // Converts email to lowercase
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // User is not verified by default
    },

    role: {
      type: String,
      enum: ["manager", "customer"], // Role can only be 'manager' or 'customer'
      default: "customer", // Default role is 'customer'
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },

  { timestamps: true }
); // Adds createdAt and updatedAt fields

UserSchema.statics.findAndValidate = async function (email, password) {
  const foundUser = await this.findOne({ email });

  if (!foundUser) {
    return null;
  }

  if (foundUser.password === password) {
    return foundUser;
  }

  return null;
};

module.exports = mongoose.model("User", UserSchema);
