import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export async function getUserByLogin(req, res) {
    try
    {
        const u = await User.findOne({email: req.body.email});

        if(!u) {return res.status(404).json("Email not found");}

        const isMatch = await bcrypt.compare(req.body.password, u.password);
        if(!isMatch) {return res.status(401).json("Incorrect Password");}

        const token = jwt.sign(
            { id: u._id, name: u.name},
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({token});
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

        const newUser = new User({name, email, password: passwordHash, avatarUrl});
        await newUser.save();
        res.status(201).json(newUser);
    }
    catch (error)
    {
        console.log("Error in createUser controller", error);
        res.status(500).json("Internal Server Error");
    }
};

export const googleAuthSuccess = (req, res) => {
    try {
        // Generate the token exactly like your manual login[cite: 8]
        const token = jwt.sign(
            { id: req.user._id, name: req.user.name },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Redirect back to the frontend with the token in the URL
        // The frontend will need to grab this token and save it to localStorage
        const frontendURL = "https://visualify.boxloid0321321.workers.dev/home";
        res.redirect(`${frontendURL}?token=${token}`);
    } catch (error) {
        console.log("Error in googleAuthSuccess controller", error);
        res.status(500).json("Internal Server Error");
    }
};