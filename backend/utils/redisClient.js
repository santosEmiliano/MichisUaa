const { Redis } = require("@upstash/redis");

const URL = process.env.REDIS_URL;
const TOKEN = process.env.REDIS_TOKEN;

const redis = new Redis({
  url: URL,
  token: TOKEN,
});


module.exports = redis;