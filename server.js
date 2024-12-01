import { fastify } from "fastify";
import cors from "@fastify/cors";

import { BooksDatabasePostgres } from "./books-database-postgres.js";
import { UsersDatabasePostgres } from "./users-database-postgres.js";

const server = fastify();

const booksDatabase = new BooksDatabasePostgres();
const usersDatabase = new UsersDatabasePostgres();

// Configurar CORS
server.register(cors, {
  origin: "*",
});

// Books --------------------------------
server.get("/books", async (request) => {
  const search = request.query.search;

  const books = await booksDatabase.list(search);

  return books;
});

server.post("/books", async (request, reply) => {
  const { title, description, authorname, genre, imgurl } = request.body;

  await booksDatabase.create({
    title,
    description,
    authorname,
    genre,
    imgurl,
  });

  return reply.status(201).send("Livro criado com sucesso!");
});

server.put("/books/:id", async (request, reply) => {
  const { id } = request.params;
  const { title, description, authorname, genre, imgurl } = request.body;

  await booksDatabase.update(id, {
    title,
    description,
    authorname,
    genre,
    imgurl,
  });

  return reply.status(204).send("Livro alterado com sucesso!");
});

server.delete("/books/:id", async (request, reply) => {
  const { id } = request.params;

  await booksDatabase.delete(id);

  return reply.status(204).send("Livro deletado com sucesso!");
});

// Users --------------------------------
server.post("/users", async (request, reply) => {
  const { username, permission, password, name, imgurl } = request.body;

  if (!permission) {
    permission = "default";
  }

  if (!username || !password || !name) {
    return reply
      .status(400)
      .send({ error: "Nome de usuário e senha são obrigatórios" });
  }

  try {
    await usersDatabase.create({
      username,
      permission,
      name,
      password,
      imgurl,
    });

    return reply.status(201).send("Usuário criado com sucesso!");
  } catch (e) {
    if (e.code === "23505") {
      return reply.status(409).send({ error: "Nome de usuário já existe" });
    }

    return reply.status(500).send({ error: "Internal Server Error" });
  }
});

server.get("/users", async (request) => {
  const search = request.query.search;

  const users = await usersDatabase.list(search);

  return users;
});

server.get("/auth-user", async (request, reply) => {
  const password = request.query.password;
  const username = request.query.username;

  const authUser = await usersDatabase.auth(password, username);

  if (authUser) {
    return authUser;
  } else {
    reply.send("Credencias inválidas!");
  }
});

server.put("/users/:id", async (request, reply) => {
  const { id } = request.params;
  const { username, permission, name, imgurl } = request.body;

  if (!username || !name) {
    return reply
      .status(400)
      .send({ error: "Nome de usuário e nome são obrigatórios" });
  }

  await usersDatabase.update(id, {
    username,
    permission: permission || "default",
    name,
    imgurl,
  });

  reply.status(204).send("Usuário atualizado com sucesso!");
});

server.delete("/users/:id", async (request, reply) => {
  const { id } = request.params;

  await usersDatabase.delete(id);

  return reply.status(204).send("Usuário deletado com sucesso!");
});

server.listen({
  host: "0.0.0.0",
  port: process.env.PORT || 3333,
});
