export default {
  // DB

  // Server
  server: {
    port: parseInt(process.env.PORT, 10) || 3500,
    host: process.env.HOST || "localhost",
  },

  // Security
};
