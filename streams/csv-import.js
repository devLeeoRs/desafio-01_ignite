import fs from "fs";
import { parse } from "csv-parse";

const csvFilePath = new URL("../streams/taskcsv.csv", import.meta.url);

const parserOptions = {
  delimiter: ",",
  columns: true,
};

const fileStream = fs.createReadStream(csvFilePath);
const parser = fileStream.pipe(parse(parserOptions));

async function csvImport() {
  for await (const chunk of parser) {
    const taskData = {
      title: chunk.title,
      description: chunk.description,
    };

    await fetch("http://localhost:3333/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }
}

csvImport();
