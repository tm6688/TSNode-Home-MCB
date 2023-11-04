module.exports = {
  apps: [
    {
      name: "home-mcb",
      script: "lib/run.js",
      instances: 1,
      watch: ["lib"],
    },
  ],
};
