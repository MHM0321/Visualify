import Project from "../models/Project.js";

export const getUserProjects = async(req,res) => {
    try {
        const projects = await Project.find({owner: req.params.id}).sort({createdAt:-1});
        if(projects.length === 0) {return res.status(404).json({message: "No Projects Found"});}

        res.status(200).json(projects);
    }
    catch (error) {
        console.log("Error in getUserProjects controller", error);
        res.status(500).json("Internal Server Error");
    }
};

export async function createUserProject(req,res) {
    try {
        const { name, members } = req.body;
        const owner = req.params.id;

        // members should be an array of { userId, role }
        // validate roles just in case
        const sanitizedMembers = Array.isArray(members)
            ? members
                .filter(m => m.userId && ['editor', 'viewer'].includes(m.role))
                .map(m => ({ userId: m.userId, role: m.role }))
            : [];

        const newProject = new Project({ name, owner, members: sanitizedMembers });
        await newProject.save();
        res.status(201).json(newProject);
    }
    catch (error) {
        console.log("Error in createUserProject controller", error);
        res.status(500).json("Internal Server Error");        
    }
};