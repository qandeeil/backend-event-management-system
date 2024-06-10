module.exports = {
  apps: [
    {
      name: "backend-event-management-system",
      script: "npm",
      args: "start",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 7001,
        SECRET_KEY_TOKEN: "qandeeil@gloryna",
      },
    },
  ],
};
