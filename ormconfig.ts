module.exports = {
  name: "default",
  type: "postgres",
  url: process.env.DB_URL,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
  synchronize: true,
  logging: true,
  entities: ["./src/Entity/User.ts"],
};
