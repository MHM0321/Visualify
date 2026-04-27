import Project from "../models/Project.js";
import User from "../models/User.js";

export const getUserProjects = async(req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.params.id },
        { 'members.userId': req.params.id }
      ]
    }).sort({ createdAt: -1 });
    if (projects.length === 0) return res.status(404).json({ message: "No Projects Found" });
    res.status(200).json(projects);
  } catch (error) {
    console.log("Error in getUserProjects controller", error);
    res.status(500).json("Internal Server Error");
  }
};

export async function createUserProject(req, res) {
  try {
    const { name, members } = req.body;
    const owner = req.params.id;
    const sanitizedMembers = Array.isArray(members)
      ? members.filter(m => m.userId && ['editor', 'viewer'].includes(m.role))
                .map(m => ({ userId: m.userId, role: m.role }))
      : [];
    const newProject = new Project({ name, owner, members: sanitizedMembers });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.log("Error in createUserProject controller", error);
    res.status(500).json("Internal Server Error");
  }
}

export async function addProjectMember(req, res) {
  try {
    const { userId, role } = req.body;
    const projectId = req.params.id;

    if (!['editor', 'viewer'].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Don't add owner
    if (project.owner.toString() === userId)
      return res.status(400).json({ message: "User is the project owner" });

    // Update or add member
    const existing = project.members.find(m => m.userId.toString() === userId);
    if (existing) {
      existing.role = role;
    } else {
      project.members.push({ userId, role });
    }

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    console.log("Error in addProjectMember controller", error);
    res.status(500).json("Internal Server Error");
  }
}

export async function getProjectRole(req, res) {
  try {
    const { projectId, userId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() === userId)
      return res.status(200).json({ role: 'editor' });

    const member = project.members.find(m => m.userId.toString() === userId);
    if (!member) return res.status(403).json({ message: "Not a member" });

    res.status(200).json({ role: member.role });
  } catch (error) {
    console.log("Error in getProjectRole controller", error);
    res.status(500).json("Internal Server Error");
  }
}

export async function addProjectMembers(req, res) {
  try {
    const { members } = req.body;
    const projectId = req.params.id;

    if (!Array.isArray(members) || members.length === 0)
      return res.status(400).json({ message: "No members provided" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    for (const { userId, role } of members) {
      if (!['editor', 'viewer'].includes(role)) continue;
      if (project.owner.toString() === userId) continue;
      const existing = project.members.find(m => m.userId.toString() === userId);
      if (existing) { existing.role = role; }
      else { project.members.push({ userId, role }); }
    }

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    console.log("Error in addProjectMembers controller", error);
    res.status(500).json("Internal Server Error");
  }
}