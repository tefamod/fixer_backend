const axios = require("axios");
const cheerio = require("cheerio");
const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");

async function searchCarImages(brand, model, color) {
  const query = `${color} ${brand} ${model} car`;
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&count=20`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(response.data);
  const images = [];

  $("img.mimg").each((i, el) => {
    const src = $(el).attr("src");
    if (src && src.startsWith("http")) images.push(src);
  });

  return images;
}

const cache = new Map();

// POST /car-image  →  body: { brand, model, color }
exports.getCarImage = asyncHandler(async (req, res, next) => {
  const { brand, model, color } = req.body;

  if (!brand || !model || !color) {
    return next(new apiError("brand, model and color are required", 400));
  }

  const cacheKey = `${brand}-${model}-${color}`;
  const images = await searchCarImages(brand, model, color);

  if (images.length === 0) {
    return next(new apiError("No images found", 404));
  }

  cache.set(cacheKey, { images, currentIndex: 0 });

  // بيعمل redirect مباشرة للصورة - لما تضغط على اللينك هتفتح الصورة
  res.status(200).json({
    imageUrl: images[0],
    clickableLink: `<a href="${images[0]}" target="_blank">${images[0]}</a>`,
    currentIndex: 0,
    total: images.length,
  });
});

// POST /car-image/next  →  body: { brand, model, color }
exports.getNextCarImage = asyncHandler(async (req, res, next) => {
  const { brand, model, color } = req.body;

  if (!brand || !model || !color) {
    return next(new apiError("brand, model and color are required", 400));
  }

  const cacheKey = `${brand}-${model}-${color}`;

  if (!cache.has(cacheKey)) {
    const images = await searchCarImages(brand, model, color);
    if (images.length === 0) {
      return next(new apiError("No images found", 404));
    }
    cache.set(cacheKey, { images, currentIndex: 0 });
  }

  const data = cache.get(cacheKey);
  data.currentIndex++;

  if (data.currentIndex >= data.images.length) {
    cache.delete(cacheKey);
    return next(new apiError("No more images available", 404));
  }

  res.status(200).json({
    imageUrl: data.images[data.currentIndex],
    clickableLink: `<a href="${data.images[data.currentIndex]}" target="_blank">${data.images[data.currentIndex]}</a>`,
    currentIndex: data.currentIndex,
    total: data.images.length,
  });
});
