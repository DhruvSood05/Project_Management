import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  console.log("Token received :", token);

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded token :", decodedToken);

    const user = await User.findById(decodedToken?._id).select(
      "-passowrd -refreshtoken -emailVerificationToken -emailVerificationExpiry",
    );
    console.log("User found:", user);

    if (!user) {
      throw new ApiError(401, "Invalid access token user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});
