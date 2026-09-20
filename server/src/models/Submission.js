const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },

        intern: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        submissionUrl: {
            type: String,
            trim: true
        },

        notes: {
            type: String,
            trim: true
        },

        feedback: {
            type: String,
            trim: true
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        reviewStatus: {
            type: String,
            enum: ["pending", "approved", "revision-required"],
            default: "pending"
        },

        submittedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Submission", submissionSchema);