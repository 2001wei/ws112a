import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");

const router = new Router();

router
  .get('/', listItems)
  .get('/item/new', addItemForm)
  .post('/item/new', addItem)
  .get('/item/:id', viewItem);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

async function listItems(ctx) {
  const items = query("SELECT * FROM items");
  ctx.response.body = { items };
}

async function addItemForm(ctx) {
  ctx.response.body = "Add a new item: <form method='post' action='/item/new'><input name='name' /><button type='submit'>Add</button></form>";
}

async function addItem(ctx) {
  if (ctx.request.hasBody) {
    const body = ctx.request.body();
    if (body.type === "form") {
      const data = await body.value;
      const name = data.get("name");
      if (name) {
        db.query("INSERT INTO items (name) VALUES (?)", [name]);
        ctx.response.redirect('/');
      }
    }
  }
}

async function viewItem(ctx) {
  const id = ctx.params.id;
  const items = query("SELECT * FROM items WHERE id = ?", [id]);
  if (items.length > 0) {
    ctx.response.body = `Item ID: ${id}, Name: ${items[0].name}`;
  } else {
    ctx.response.body = "Item not found.";
  }
}

function query(sql, args) {
  const result = db.query(sql, args);
  const items = [];
  for (const [id, name] of result) {
    items.push({ id, name });
  }
  return items;
}

const port = 8000; // Set the desired port number
console.log(`Server is running on http://127.0.0.1:${port}`);
await app.listen({ port });