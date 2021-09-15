import "reflect-metadata";
import express, { Express } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
// import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
// TODO: Should I ditch this graphql thing and make it REST again

import { UserResolver } from "./resolvers/user";

require("dotenv").config({ path: `${__dirname}/../.env.local` });

const PORT = process.env.PORT || 4000;

async function startApolloServer() {
  console.log();
  await createConnection({
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
  });
  const schema = await buildSchema({
    resolvers: [UserResolver],
  });
  const app: Express = express();
  const server = new ApolloServer({
    schema,
    playground: true,
  });

  await server.start();

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production" ? undefined : false,
    })
  );

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  server.applyMiddleware({ path: "/graphql", app });

  await app.listen(PORT, () => console.log(`server started`));
}

startApolloServer();
