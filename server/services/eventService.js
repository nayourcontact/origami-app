const Event = require("../models/Event");

function getMediaType(file) {
    if (!file) return "";

    if (file.mimetype.startsWith("image/")) return "image";
    if (file.mimetype.startsWith("video/")) return "video";

    return "";
}

function getFileUrl(req, file) {
    if (!file) return "";

    return `${req.protocol}://${req.get("host")}/uploads/events/${file.filename}`;
}

async function getAllEvents() {
    return Event.find().sort({ eventDate: 1 });
}

async function createEvent(data, files, req) {
    const coverImage = files?.coverImage?.[0] || null;
    const galleryFiles = files?.gallery || [];

    const event = new Event({
        title: data.title,
        location: data.location,
        eventDate: data.eventDate,
        ticketPrice: data.ticketPrice || "",
        description: data.description || "",
        coverImageUrl: getFileUrl(req, coverImage),
        gallery: galleryFiles.map((file) => ({
            url: getFileUrl(req, file),
            type: getMediaType(file),
        })),
    });

    return event.save();
}

async function addGalleryMedia(eventId, files, req) {
    const event = await Event.findById(eventId);

    if (!event) {
        throw new Error("Esemény nem található.");
    }

    const items = files.map((file) => ({
        url: getFileUrl(req, file),
        type: getMediaType(file),
    }));

    event.gallery.push(...items);

    return event.save();
}

async function deleteEvent(eventId) {
    return Event.findByIdAndDelete(eventId);
}

module.exports = {
    getAllEvents,
    createEvent,
    addGalleryMedia,
    deleteEvent,
};