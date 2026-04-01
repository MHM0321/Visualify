import Screen from "../models/Screen.js";

export async function getProjectScreens(req, res) {
    try {
        const screens = await Screen.find({projectId: req.params.id}).sort({createdAt: -1});
        if(screens.length === 0) {return res.status(404).json({message: "No Screens Found"});}

        res.status(200).json(screens);
    }
    catch (error) {
        console.log("Error in createUser controller", error);
        res.status(500).json("Internal Server Error");        
    }
}

export const createProjectScreen = async(req, res) => {
    try {
        const {name} = req.body;
        const projectId = req.params.id;
        const screenCount = await Screen.countDocuments({ projectId });

        const newScreen = new Screen({name, projectId, order: screenCount + 1});
        await newScreen.save();
        res.status(201).json(newScreen);
    }
    catch (error) {
        console.log("Error in createUser controller", error);
        res.status(500).json("Internal Server Error");        
    }
}