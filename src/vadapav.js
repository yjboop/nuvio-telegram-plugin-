// src/vadapav.js

const VADAPAV_BASE_URL = "https://vadapav.mov";
const VADAPAV_API = `${VADAPAV_BASE_URL}/api`; 

/**
 * Nuvio provider entry point
 * @param {string} tmdbId - The TMDB ID (e.g., "550")
 * @param {string} mediaType - "movie" or "tv"
 * @param {number} season - Season number (null for movies)
 * @param {number} episode - Episode number (null for movies)
 * @returns {Promise<Array>} - List of streams
 */
export async function getStreams(tmdbId, mediaType, season, episode, userConfig = {}) {
    try {
        // This example focuses on scraping movies as requested
        if (mediaType !== "movie") {
            return [];
        }

        // 1. Fetch metadata for the TMDB ID to get the title & year to search for
        const titleQuery = await fetchTmdbMetadata(tmdbId);
        if (!titleQuery) return [];

        // 2. Query the vadapav.mov API/search directory 
        // Note: You may need to adapt the endpoint to match the exact vadapav.mov API schema
        const res = await fetch(`${VADAPAV_API}/search?q=${encodeURIComponent(titleQuery)}`);
        
        if (!res.ok) {
            console.error('[Vadapav Provider] API error:', res.status);
            return [];
        }

        const data = await res.json();
        
        // 3. Map the search results into Nuvio stream objects
        return data.data.map(file => ({
            name: "Vadapav",
            title: `${file.filename} - ${file.size}`, 
            url: `${VADAPAV_BASE_URL}/f/${file.id}`, // Direct video URL
            quality: getQuality(file.filename), // "1080p", "720p", "4K", etc.
            formats: ["mp4", "mkv", "m3u8"],
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        }));

    } catch (err) {
        console.error('[Vadapav Provider] Error:', err.message);
        return [];
    }
}

// Helper to fetch movie name to search Vadapav
async function fetchTmdbMetadata(tmdbId) {
    // You can use the TMDB API to translate the ID into a search query string
    // e.g., "The Matrix 1999"
    const tmdbApiUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=YOUR_TMDB_API_KEY`;
    const res = await fetch(tmdbApiUrl);
    const data = await res.json();
    return data.title ? `${data.title} ${data.release_date.split('-')[0]}` : null;
}

// Helper to parse resolution from the file name
function getQuality(filename) {
    if (filename.includes("2160p") || filename.includes("4k") || filename.includes("4K")) return "4K";
    if (filename.includes("1080p")) return "1080p";
    if (filename.includes("720p")) return "720p";
    return "Unknown";
}