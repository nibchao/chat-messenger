const mongoose = require("mongoose");

const roomSchema = mongoose.Schema(
    {
        name: {
        type: String,
        required: true,
        },
    },
    {
        timestamps: true,
    },
    {
        messageHistory: [{
            type: String
        }]
    },
);

module.exports = mongoose.model("Room", roomSchema);