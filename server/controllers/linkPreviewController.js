const linkPreviewService = require(
    "../services/linkPreviewService"
);

const getLinkPreview = async (req, res, next) => {
    try {
        const { url } = req.query;

        if (!url || typeof url !== "string") {
            return res.status(400).json({
                message: "URL is required"
            });
        }

        if (url.length > 2048) {
            return res.status(400).json({
                message: "URL is too long"
            });
        }

        const preview =
            await linkPreviewService.getLinkPreview(url);

        return res.json(preview);

    } catch (error) {
        if (
            error.name === "LinkPreviewError" ||
            error instanceof linkPreviewService.LinkPreviewError
        ) {
            if (error.statusCode === 422) {
                return res.status(204).send();
            }

            return res
                .status(error.statusCode || 400)
                .json({
                    message: error.message
                });
        }

        if (error.code === "ECONNABORTED") {
            return res.status(504).json({
                message: "Link preview request timed out"
            });
        }

        if (
            error.code === "ENOTFOUND" ||
            error.code === "ECONNREFUSED" ||
            error.code === "EHOSTUNREACH"
        ) {
            return res.status(502).json({
                message: "Unable to reach target website"
            });
        }

        next(error);
    }
};

module.exports = {
    getLinkPreview
};