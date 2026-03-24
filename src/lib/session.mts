export default {
  // DB
  dbParams: {
    port: parseInt(process.env.MONGO_PORT ?? "", 10) || 27017,
    host: process.env.MONGO_HOST || "127.0.0.1",
    dbPath: process.env.MONGO_DB_PATH,
    dbName: process.env.MONGO_DB_NAME || "mychar",
  },

  // Server
  serverParams: {
    port: parseInt(process.env.PORT ?? "", 10) || 3500,
    host: process.env.HOST || "localhost",
  },

  // Security
} satisfies Config;

interface Config {
  dbParams: {
    port: number;
    host: string;
    dbPath?: string;
    dbName: string;
  };
  serverParams: {
    port: number;
    host: string;
  };
}
