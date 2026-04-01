import Project from "../models/Project.js";

export const getUserProjects = async(req,res) => {
    try {
        const projects = await Project.find({owner: req.params.id}).sort({createdAt:-1});
        if(projects.length === 0) {return res.status(404).json({message: "No Projects Found"});}

        res.status(200).json(projects);
    }
    catch (error) {
        console.log("Error in createUser controller", error);
        res.status(500).json("Internal Server Error");
    }
};

export async function createUserProject(req,res) {
    try {
        const {name} = req.body;
        const owner = req.params.id;
        const newProject = new Project({name, owner});
        await newProject.save();
        res.status(201).json(newProject);
    }
    catch (error) {
        console.log("Error in createUser controller", error);
        res.status(500).json("Internal Server Error");        
    }
};