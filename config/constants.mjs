const CONSTANTS = {
  PORT: process.env.NODE_ENV === "production" ? process.env.PORT : 3000,
  SERVER_PATH:
    process.env.NODE_ENV === "production"
      ? process.env.SERVER_PATH
      : process.cwd(),
  ENCODING: "utf8",
};

export { CONSTANTS };
