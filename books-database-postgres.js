import { randomUUID } from "node:crypto";
import { sql } from "./db.js";

export class BooksDatabasePostgres {
  async list(search) {
    let books;

    if (search) {
      books = await sql`select * from books where title ilike ${
        "%" + search + "%"
      } or genre ilike ${"%" + search + "%"}`;
    } else {
      books = await sql`select * from books`;
    }

    return books;
  }

  async create(book) {
    const bookId = randomUUID();

    const { title, description, authorname, imgurl, genre } = book;

    await sql`
      INSERT INTO books (id, title, description, authorname, imgurl, genre)
      VALUES (${bookId}, ${title}, ${description}, ${authorname}, ${imgurl}, ${genre})
    `;
  }

  async update(id, book) {
    const { title, description, authorname, imgurl, genre } = book;

    await sql`
      UPDATE books
      SET title = ${title}, description = ${description}, authorname = ${authorname}, imgurl = ${imgurl}, genre = ${genre}
      WHERE id = ${id}
    `;
  }

  async delete(id) {
    await sql`DELETE FROM books WHERE id = ${id}`;
  }
}
