import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['editor', 'viewer'], default: 'viewer' },
        joinedAt: { type: Date, default: Date.now }
    },
    { _id: false },
)

const projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        members: { type: [memberSchema], default: [] }
    },
    { timestamps: true },
)

const Project = mongoose.model("Project", projectSchema);
export default Project;