const axios = require("axios");
const cheerio = require("cheerio");
const dns = require("dns").promises;
const net = require("net");
const http = require("http");
const https = require("https");

const MAX_REDIRECTS = 5;
const MAX_CONTENT_LENGTH = 2 * 1024 * 1024; // 2 MB
const REQUEST_TIMEOUT = 5000;

class LinkPreviewError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = "LinkPreviewError";
        this.statusCode = statusCode;
    }
}

/**
 * IPv4 cím privát / lokális / speciális tartományban van-e.
 */
const isPrivateIPv4 = (ip) => {
    const parts = ip.split(".").map(Number);

    if (
        parts.length !== 4 ||
        parts.some(part => Number.isNaN(part) || part < 0 || part > 255)
    ) {
        return true;
    }

    const [a, b] = parts;

    return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 100 && b >= 64 && b <= 127) ||
        a >= 224
    );
};

/**
 * IPv6 cím privát / lokális / speciális tartományban van-e.
 */
const isPrivateIPv6 = (ip) => {
    const normalized = ip.toLowerCase();

    return (
        normalized === "::" ||
        normalized === "::1" ||
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe8") ||
        normalized.startsWith("fe9") ||
        normalized.startsWith("fea") ||
        normalized.startsWith("feb") ||
        normalized.startsWith("::ffff:127.") ||
        normalized.startsWith("::ffff:10.") ||
        normalized.startsWith("::ffff:192.168.") ||
        normalized.startsWith("::ffff:169.254.")
    );
};

const isPrivateIp = (ip) => {
    const version = net.isIP(ip);

    if (version === 4) {
        return isPrivateIPv4(ip);
    }

    if (version === 6) {
        return isPrivateIPv6(ip);
    }

    return true;
};

/**
 * URL formai és protokoll ellenőrzése.
 */
const validateUrl = (rawUrl) => {
    let parsedUrl;

    try {
        parsedUrl = new URL(rawUrl);
    } catch {
        throw new LinkPreviewError("Invalid URL");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new LinkPreviewError(
            "Only HTTP and HTTPS URLs are allowed"
        );
    }

    // username:password@host tiltása
    if (parsedUrl.username || parsedUrl.password) {
        throw new LinkPreviewError(
            "URLs containing credentials are not allowed"
        );
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    if (
        hostname === "localhost" ||
        hostname.endsWith(".localhost") ||
        hostname === "localhost.localdomain"
    ) {
        throw new LinkPreviewError(
            "Local addresses are not allowed"
        );
    }

    // Nem akarjuk, hogy pl. :3000, :27017 stb. belső szolgáltatásokat
    // próbáljon elérni.
    if (
        parsedUrl.port &&
        parsedUrl.port !== "80" &&
        parsedUrl.port !== "443"
    ) {
        throw new LinkPreviewError(
            "Only ports 80 and 443 are allowed"
        );
    }

    return parsedUrl;
};

/**
 * DNS feloldás + minden kapott IP ellenőrzése.
 */
const resolveSafeAddress = async (hostname) => {
    // Ha eleve IP címet kaptunk
    if (net.isIP(hostname)) {
        if (isPrivateIp(hostname)) {
            throw new LinkPreviewError(
                "Private or local IP addresses are not allowed"
            );
        }

        return {
            address: hostname,
            family: net.isIP(hostname)
        };
    }

    let addresses;

    try {
        addresses = await dns.lookup(hostname, {
            all: true,
            verbatim: true
        });
    } catch {
        throw new LinkPreviewError(
            "Hostname could not be resolved",
            422
        );
    }

    if (!addresses.length) {
        throw new LinkPreviewError(
            "Hostname could not be resolved",
            422
        );
    }

    // Ha akár egy privát címre is feloldódik,
    // inkább elutasítjuk.
    for (const entry of addresses) {
        if (isPrivateIp(entry.address)) {
            throw new LinkPreviewError(
                "Private or local network addresses are not allowed"
            );
        }
    }

    return addresses[0];
};

/**
 * Olyan agentet készítünk, amely a már ellenőrzött IP-re csatlakozik.
 *
 * Ezzel csökkentjük a DNS rebinding kockázatát:
 * nem ellenőrizzük az egyik IP-t, majd hagyjuk, hogy axios
 * egy második DNS lookup során másik címet kapjon.
 */
const createSafeAgent = (parsedUrl, resolvedAddress) => {
    const lookup = (hostname, options, callback) => {
        const address = resolvedAddress.address;
        const family = resolvedAddress.family;

        if (options?.all) {
            return callback(null, [
                {
                    address,
                    family
                }
            ]);
        }

        return callback(
            null,
            address,
            family
        );
    };

    if (parsedUrl.protocol === "https:") {
        return new https.Agent({
            lookup,
            keepAlive: false
        });
    }

    return new http.Agent({
        lookup,
        keepAlive: false
    });
};

/**
 * Egyetlen URL letöltése automatikus redirect nélkül.
 */
const fetchSingleUrl = async (rawUrl) => {
    const parsedUrl = validateUrl(rawUrl);

    const resolvedAddress = await resolveSafeAddress(
        parsedUrl.hostname
    );

    const agent = createSafeAgent(
        parsedUrl,
        resolvedAddress
    );

    const response = await axios.get(parsedUrl.toString(), {
        timeout: REQUEST_TIMEOUT,

        maxRedirects: 0,

        maxContentLength: MAX_CONTENT_LENGTH,

        maxBodyLength: MAX_CONTENT_LENGTH,

        responseType: "text",

        validateStatus: status =>
            status >= 200 && status < 500,

        headers: {
            "User-Agent":
                "Mozilla/5.0 (compatible; OrigamiLinkPreview/1.0)",

            "Accept":
                "text/html,application/xhtml+xml",

            "Accept-Language":
                "hu-HU,hu;q=0.9,en;q=0.8"
        },

        httpAgent:
            parsedUrl.protocol === "http:"
                ? agent
                : undefined,

        httpsAgent:
            parsedUrl.protocol === "https:"
                ? agent
                : undefined
    });

    return {
        response,
        parsedUrl
    };
};

/**
 * Redirecteket manuálisan kezeljük azért,
 * hogy MINDEN redirect célját újra ellenőrizhessük.
 */
const fetchHtml = async (initialUrl) => {
    let currentUrl = initialUrl;

    for (
        let redirectCount = 0;
        redirectCount <= MAX_REDIRECTS;
        redirectCount++
    ) {
        const {
            response,
            parsedUrl
        } = await fetchSingleUrl(currentUrl);

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            throw new LinkPreviewError(
                "Preview is not publicly accessible",
                422
            );
        }

        if (response.status === 404) {
            throw new LinkPreviewError(
                "Preview page was not found",
                422
            );
        }

        if (response.status >= 400) {
            throw new LinkPreviewError(
                `Preview request failed with status ${response.status}`,
                422
            );
        }

        // Redirect
        if (
            response.status >= 300 &&
            response.status < 400
        ) {
            const location = response.headers.location;

            if (!location) {
                throw new LinkPreviewError(
                    "Invalid redirect response",
                    502
                );
            }

            if (redirectCount === MAX_REDIRECTS) {
                throw new LinkPreviewError(
                    "Too many redirects",
                    422
                );
            }

            // relatív Location header támogatása
            currentUrl = new URL(
                location,
                parsedUrl
            ).toString();

            continue;
        }

        const contentType =
            response.headers["content-type"] || "";

        if (
            !contentType
                .toLowerCase()
                .includes("text/html") &&
            !contentType
                .toLowerCase()
                .includes("application/xhtml+xml")
        ) {
            throw new LinkPreviewError(
                "URL does not point to an HTML document",
                422
            );
        }

        return {
            html: response.data,
            finalUrl: parsedUrl.toString()
        };
    }

    throw new LinkPreviewError(
        "Unable to retrieve URL",
        502
    );
};

const getMeta = ($, property) => {
    return (
        $(`meta[property="${property}"]`)
            .first()
            .attr("content") ||

        $(`meta[name="${property}"]`)
            .first()
            .attr("content") ||

        null
    );
};

/**
 * Relatív og:image URL-ből abszolút URL.
 */
const normalizeImageUrl = (image, baseUrl) => {
    if (!image) {
        return null;
    }

    try {
        return new URL(image, baseUrl).toString();
    } catch {
        return null;
    }
};

const cleanString = (value, maxLength) => {
    if (!value || typeof value !== "string") {
        return null;
    }

    const cleaned = value
        .replace(/\s+/g, " ")
        .trim();

    if (!cleaned) {
        return null;
    }

    return cleaned.slice(0, maxLength);
};

const getLinkPreview = async (url) => {
    const {
        html,
        finalUrl
    } = await fetchHtml(url);

    const $ = cheerio.load(html);

    const title = cleanString(
        getMeta($, "og:title") ||
        getMeta($, "twitter:title") ||
        $("title").first().text(),
        300
    );

    const description = cleanString(
        getMeta($, "og:description") ||
        getMeta($, "twitter:description") ||
        getMeta($, "description"),
        1000
    );

    const rawImage =
        getMeta($, "og:image") ||
        getMeta($, "twitter:image");

    const image = normalizeImageUrl(
        rawImage,
        finalUrl
    );

    const siteName = cleanString(
        getMeta($, "og:site_name"),
        200
    );

    return {
        url: finalUrl,
        title,
        description,
        image,
        siteName
    };
};

module.exports = {
    getLinkPreview,
    LinkPreviewError
};