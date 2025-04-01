import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;

const getClient = (): RedisClientType => {
 if (!client) {
  client = createClient();
  client.on("error", (err) => console.error("Redis Client Error", err));
  client.connect().catch((err) => console.error("Redis Client Connection Error", err));
 }
 return client;
};

export default getClient;
