const axios = require('axios');
const fs = require('fs');
const path = require('path');
const InstagramPost = require('../models/Post');
const { getTokenByUserId } = require('./instagramTokenService');

const INSTAGRAM_MEDIA_FIELDS = 'id,media_type,media_url,thumbnail_url,caption,timestamp';

const { BASE_UPLOAD_ROOT } = require('../utils/uploadPaths');

const STORAGE_ROOT = path.join(BASE_UPLOAD_ROOT, 'instagram');

const ensureDir = async (dirPath) => {
    await fs.promises.mkdir(dirPath, { recursive: true });
};

const sanitizeFileName = (value) => {
    return String(value).replace(/[^a-zA-Z0-9._-]/g, '_');
};

const fileExists = async (filePath) => {
    if (!filePath) return false;
    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
};

const getExtensionFromUrlOrType = (url, contentType) => {
    const cleanUrl = url.split('?')[0];
    const extFromUrl = path.extname(cleanUrl);
    if (extFromUrl) return extFromUrl;

    if (contentType?.includes('jpeg')) return '.jpg';
    if (contentType?.includes('jpg')) return '.jpg';
    if (contentType?.includes('png')) return '.png';
    if (contentType?.includes('mp4')) return '.mp4';
    if (contentType?.includes('quicktime')) return '.mov';

    return '';
};

const downloadFile = async ({ fileUrl, destDir, baseName }) => {
    await ensureDir(destDir);

    const response = await axios.get(fileUrl, {
        responseType: 'stream',
        timeout: 15000
    });

    const contentType = response.headers['content-type'];
    const ext = getExtensionFromUrlOrType(fileUrl, contentType);
    const fileName = `${sanitizeFileName(baseName)}${ext}`;
    const fullPath = path.join(destDir, fileName);

    await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(fullPath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    return fullPath;
};

const toPublicMediaUrl = (absolutePath) => {
    if (!absolutePath) return null;

    const relative = path.relative(BASE_UPLOAD_ROOT, absolutePath).replace(/\\/g, '/');
    return `/uploads/${relative}`;
};

const enrichPostWithLocalUrls = (post) => {
    const localMediaUrl = post.localMediaPath ? toPublicMediaUrl(post.localMediaPath) : null;
    const localThumbnailUrl = post.localThumbnailPath ? toPublicMediaUrl(post.localThumbnailPath) : null;

    return {
        ...post,
        mediaUrl: localMediaUrl || post.mediaUrl,
        thumbnailUrl: localThumbnailUrl || post.thumbnailUrl,
        source: localMediaUrl ? 'local' : 'remote'
    };
};

const fetchInstagramPosts = async (userId) => {
    const cachedPosts = await InstagramPost.find({ userId }).lean();

    const allCachedFilesExist =
        cachedPosts.length > 0 &&
        (await Promise.all(
            cachedPosts.map(async (post) => {
                const mediaOk = post.localMediaPath ? await fileExists(post.localMediaPath) : false;
                const thumbOk = post.localThumbnailPath ? await fileExists(post.localThumbnailPath) : true;
                return mediaOk && thumbOk;
            })
        )).every(Boolean);

    if (cachedPosts.length > 0 && allCachedFilesExist) {
        return {
            data: cachedPosts.map(enrichPostWithLocalUrls),
            fromCache: true
        };
    }

    try {
        const tokenRecord = await getTokenByUserId(userId);
        if (!tokenRecord?.token) {
            const err = new Error(`Access token not found for user: ${userId}`);
            err.statusCode = 404;
            throw err;
        }

        let allPosts = [];
        let nextUrl =
            `https://graph.instagram.com/me/media?fields=${INSTAGRAM_MEDIA_FIELDS}&access_token=${tokenRecord.token}`;

        const userStorageDir = path.join(STORAGE_ROOT, sanitizeFileName(userId));

        while (nextUrl) {
            const response = await axios.get(nextUrl, { timeout: 5000 });
            const posts = response.data?.data || [];

            for (const post of posts) {
                let localMediaPath = null;
                let localThumbnailPath = null;

                if (post.media_url) {
                    localMediaPath = await downloadFile({
                        fileUrl: post.media_url,
                        destDir: userStorageDir,
                        baseName: `${post.id}_media`
                    });
                }

                if (post.thumbnail_url) {
                    localThumbnailPath = await downloadFile({
                        fileUrl: post.thumbnail_url,
                        destDir: userStorageDir,
                        baseName: `${post.id}_thumb`
                    });
                }

                const saved = await InstagramPost.findOneAndUpdate(
                    { igId: post.id },
                    {
                        userId,
                        mediaType: post.media_type,
                        mediaUrl: post.media_url,
                        thumbnailUrl: post.thumbnail_url || null,
                        localMediaPath,
                        localThumbnailPath,
                        caption: post.caption || '',
                        timestamp: post.timestamp ? new Date(post.timestamp) : null,
                        updatedAt: new Date()
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true
                    }
                ).lean();

                allPosts.push(enrichPostWithLocalUrls(saved));
            }

            nextUrl = response.data?.paging?.next || null;
        }

        return { data: allPosts, fromCache: false };
    } catch (error) {
        const fallbackPosts = await InstagramPost.find({ userId }).sort({ timestamp: -1 }).lean();

        if (fallbackPosts.length > 0) {
            return {
                data: fallbackPosts.map(enrichPostWithLocalUrls),
                fromCache: true,
                fallback: true
            };
        }

        const isAxiosError = !!error?.response?.data?.error?.message;

        console.error(`[InstagramPostService] Error for user ${userId}`);
        console.error('Raw error:', {
            message: error.message,
            response: isAxiosError ? error.response.data.error : null,
        });

        const err = new Error(
            isAxiosError
                ? `Instagram API error: ${error.response.data.error.message}`
                : error.message || 'Unknown error'
        );

        err.statusCode = isAxiosError ? 502 : 500;
        throw err;
    }
};

const getInstagramVideosByUser = async (userId) => {
    const posts = await InstagramPost.find({ userId, mediaType: 'VIDEO' }).lean();
    return posts.map(enrichPostWithLocalUrls);
};

const getInstagramImagesByUser = async (userId) => {
    const posts = await InstagramPost.find({
        userId,
        mediaType: { $in: ['IMAGE', 'CAROUSEL_ALBUM'] },
    }).lean();

    return posts.map(enrichPostWithLocalUrls);
};

const getHighlightedPost = async (userId) => {
    const post = await InstagramPost.findOne({
        userId,
        caption: { $regex: /Icar\s*\(Ίκαρος\)/i }
    }).lean();

    return post ? enrichPostWithLocalUrls(post) : null;
};

module.exports = {
    fetchInstagramPosts,
    getInstagramVideosByUser,
    getInstagramImagesByUser,
    getHighlightedPost
};
