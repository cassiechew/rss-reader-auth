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
  await createConnection("default");
  const schema = await buildSchema({
    resolvers: [UserResolver],
  });
  const app: Express = express();
  const server = new ApolloServer({
    schema,
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
  server.applyMiddleware({ app });

  await app.listen(PORT, () =>
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    )
  );
}

startApolloServer();
