const { Redis } = require("@upstash/redis");

const URL = process.env.REDIS_URL;
const TOKEN = process.env.REDIS_TOKEN;

const redis = new Redis({
  url: URL,
  token: TOKEN,
});

/*
async function probar() {
  try {
    await redis.set("test", "ok");
    const v = await redis.get("test");
    console.log("Redis OK:", v);
  } catch (error) {
    console.log("ERROR REDIS:", error);
  }
}
probar();
*/

module.exports = redis;