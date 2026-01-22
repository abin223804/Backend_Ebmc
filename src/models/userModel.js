import mongoose from "mongoose";

/**
 * ======================
 * USER SCHEMA
 * ======================
 */
const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["SalesStaff","ComplianceOfficer","Owner"],
      default: "SalesStaff",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    country: String,
    state: String,
    street: String,
    city: String,
    zipcode: String,

    trn: {
      type: String,
      unique: true,
      sparse: true,
    },

    creditLimit: {
      type: Number,
      default: 0,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);



// import mongoose from "mongoose";

// /**
//  * ======================
//  * SESSION SUB-SCHEMA
//  * ======================
//  */
// const sessionSchema = new mongoose.Schema(
//   {
//     refreshTokenHash: {
//       type: String,
//       required: true,
//     },

//     expiresAt: {
//       type: Date,
//       required: true,
//     },

//     ipAddress: {
//       type: String,
//     },

//     userAgent: {
//       type: String,
//     },

//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { _id: true }
// );

// /**
//  * ======================
//  * USER SCHEMA
//  * ======================
//  */
// const userSchema = new mongoose.Schema(
//   {
//     role: {
//       type: String,
      
//      enum: ["SalesStaff","ComplianceOfficer","Owner"],
//      default:"SalesStaff",
//       required: true,
//     },

//     companyName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       index: true,
//     },

//     country: String,
//     state: String,
//     street: String,
//     city: String,
//     zipcode: String,

//     trn: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },

//     creditLimit: {
//       type: Number,
//       default: 0,
//     },

//     passwordHash: {
//       type: String,
//       required: true,
//     },

//     isBlocked: {
//       type: Boolean,
//       default: false,
//     },

//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },

//     /**
//      * ======================
//      * SESSION TRACKING
//      * ======================
//      */
//     sessions: {
//       type: [sessionSchema],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);