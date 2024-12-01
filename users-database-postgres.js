import { randomUUID } from "node:crypto";
import { sql } from "./db.js";

export class UsersDatabasePostgres {
  async create(user) {
    const userId = randomUUID();

    const { username, password, permission, name, imgurl } = user;

    await sql`
      INSERT INTO users (id, username, password, permission, name, imgurl)
      VALUES (${userId}, ${username}, ${password}, ${permission}, ${name}, ${imgurl})
    `;
  }

  async list(search) {
    let users;

    if (search) {
      users = await sql`select * from users where name ilike  ${
        "%" + search + "%"
      } `;
    } else {
      users = await sql`select * from users`;
    }

    return users;
  }

  async auth(password, username) {
    const user = await sql`
      SELECT * FROM users WHERE username = ${username} AND password = ${password}
    `;

    return user;
  }

  async update(id, user) {
    const { username, name, permission, imgurl } = user;

    await sql`
      UPDATE users
      SET username = ${username}, name = ${name}, permission = ${permission}, imgurl = ${imgurl}
      WHERE id = ${id}
    `;
  }

  async delete(id) {
    await sql`DELETE FROM users WHERE id = ${id}`;
  }
}
