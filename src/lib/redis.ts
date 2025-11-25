import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || '';
let redisClient: Redis | null = null;
if(redisUrl){
    try{
        redisClient = new Redis(redisUrl);
        redisClient.on("error", (err)=>console.warn("Redis connection error:", err));
    } catch (error) {
        redisClient = null;
    }
}

const localMap = new Map<string, string[]>();

export async function appendHistory(userId: string, prompt: string){
    userId = userId || "anon";
    if(redisClient){
        try{
            await redisClient.lpush(`history:${userId}`, prompt);
            await redisClient.ltrim(`history:${userId}`, 0, 199); 
            return;
        } catch (error) {
            console.warn("Redis append failed, using memory fallback:", error);
        }
    }
    const arr = localMap.get(userId) ?? [];
    arr.unshift(prompt);
    localMap.set(userId, arr.slice(0, 200));
}

export async function getHistory(userId: string, limit = 20): Promise<string[]> {
    userId = userId || "anon";
    if(redisClient){
        try{
            const response = await redisClient.lrange(`history:${userId}`, 0, limit - 1);
            return response ?? [];
        } catch (error) {
            console.warn("Redis lrange failed, using memory fallback:", error);
        }
    }
    return (localMap.get(userId)?? []).slice(0, limit) || [];
}