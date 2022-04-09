import { realpathSync } from "fs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

export const run_sqlite_queries = async (queries: string[][]) => {
    // open the database
    const db = await open({
        filename: './db.sqlite',
        driver: sqlite3.Database
    })

    queries.forEach(async (q: string[]) => {
        await db.run(q[0], ...q.splice(1));
    })
};