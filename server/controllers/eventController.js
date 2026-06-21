const eventService = require("../services/eventService");

async function getEvents(req, res) {
    try {
        const events = await eventService.getAllEvents();
        res.json(events);
    } catch (err) {
        console.error("Események lekérése hiba:", err);
        res.status(500).json({ message: "Nem sikerült lekérni az eseményeket." });
    }
}

async function createEvent(req, res) {
    try {
        const { title, location, eventDate } = req.body;

        if (!title || !location || !eventDate) {
            return res.status(400).json({
                message: "Cím, helyszín és dátum megadása kötelező.",
            });
        }

        const event = await eventService.createEvent(req.body, req.files, req);

        res.status(201).json(event);
    } catch (err) {
        console.error("Esemény mentése hiba:", err);
        res.status(500).json({ message: "Nem sikerült elmenteni az eseményt." });
    }
}

async function uploadGallery(req, res) {
    try {
        if (!req.files || !req.files.length) {
            return res.status(400).json({ message: "Nincs feltöltött fájl." });
        }

        const event = await eventService.addGalleryMedia(
            req.params.id,
            req.files,
            req
        );

        res.json(event);
    } catch (err) {
        console.error("Galéria feltöltés hiba:", err);
        res.status(500).json({ message: err.message || "Nem sikerült feltölteni a galériát." });
    }
}

async function deleteEvent(req, res) {
    try {
        await eventService.deleteEvent(req.params.id);
        res.json({ message: "Esemény törölve." });
    } catch (err) {
        console.error("Esemény törlése hiba:", err);
        res.status(500).json({ message: "Nem sikerült törölni az eseményt." });
    }
}

module.exports = {
    getEvents,
    createEvent,
    uploadGallery,
    deleteEvent,
};