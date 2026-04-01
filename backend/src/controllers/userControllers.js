import User from "../models/User.js";
import bcrypt from "bcrypt";

export async function getAllUsers(_, res) {
    try
    {
        const u = await User.find().sort({createdAt:-1});
        res.status(200).json(u);
    }
    catch (error)
    {
        console.log("Error in getAllUsers controller", error);
        res.status(500).json("Internal Server Error");
    }
};

export const createUser = async(req, res) => {
    try
    {
        const {name, email, password, avatarUrl} = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({name, email, passwordHash, avatarUrl});
        await newUser.save();
        res.status(201).json(newUser);
    }
    catch (error)
    {
        console.log("Error in createUser controller", error);
        res.status(500).json("Internal Server Error");
    }
};