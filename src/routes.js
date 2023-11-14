import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import { randomUUID } from "node:crypto";

const database = new Database();

function getDateActual() {
  const date = new Date();
  const dateActual = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;
  const dateHours = `${date.getHours()}:${date.getMinutes()}`;

  return `${dateActual}-${dateHours}`;
}

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (title && description) {
        const task = {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          create_at: getDateActual(),
          update_at: getDateActual(),
        };
        database.insert("tasks", task);
      }

      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const checkIsTasks = database.selectById("tasks", id);

      console.log(checkIsTasks);

      if (checkIsTasks.length === 0) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: "task id not found " }));
      }

      if (title || description) {
        database.update("tasks", id, {
          title,
          description,
          update_at: getDateActual(),
        });
      }

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/completed"),
    handler: async (req, res) => {
      const { id } = req.params;

      const [task] = await database.selectById("tasks", id);

      if (task) {
        task.completed_at = !task.completed_at;
        database.insert("tasks", task);
      } else {
        return res.writeHead(400).end();
      }

      return res.writeHead(204).end();
    },
  },
];
