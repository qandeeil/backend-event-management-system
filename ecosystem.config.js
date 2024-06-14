module.exports = {
  apps: [
    {
      name: "backend-event-management-system",
      script: "npm",
      args: "start",
      watch: true,
      ignore_watch: ["node_modules", "public/profile_image"],
      env: {
        NODE_ENV: "production",
        PORT: 7001,
        SECRET_KEY_TOKEN: "qandeeil@gloryna",
      },
    },
  ],
};
