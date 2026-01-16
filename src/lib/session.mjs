export default {
  // DB

  // Server
  serverParams: {
    port: parseInt(process.env.PORT, 10) || 3500,
    host: process.env.HOST || "localhost",
  },

  // Security
};
