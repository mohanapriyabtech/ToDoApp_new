const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const taskSchema = new mongoose.Schema(
  {
    task: { type: String, lowercase: true, minLength: 3 },
    taskDescription: { type: String },
    status: { type: String, default: "Pending" },
    taskSendBy: { type: ObjectId, ref: "userdetails" },
    comment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tasks", taskSchema);
