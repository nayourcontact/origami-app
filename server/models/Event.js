const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        eventDate: { type: Date, required: true },
        ticketPrice: { type: String, default: "" },
        description: { type: String, default: "" },

        coverImageUrl: { type: String, default: "" },

        gallery: [
            {
                url: { type: String, required: true },
                type: {
                    type: String,
                    enum: ["image", "video"],
                    required: true,
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);