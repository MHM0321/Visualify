import mongoose from 'mongoose'

const screenSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        name: { type: String, required: true },
        order: { type: Number, required: true },
        content: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    { timestamps: true },
)

const Screen = mongoose.model("Screen", screenSchema);
export default Screen;