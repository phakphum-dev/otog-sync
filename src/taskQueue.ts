import Queue from "bull";
import { pool } from "./db";
import { TaskRes } from "./interfaces";
import * as dotenv from "dotenv";

dotenv.config();

const taskQueue = Queue("TASK_QUEUE", {
  redis: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
});

taskQueue.process(async (job) => {
  try {
    const result = await pool.query(
      `SELECT S."id", S."userId", S."problemId", S."contestId", S."sourceCode", S."language", 
          P."score", P."timeLimit", P."memoryLimit", P."case" FROM submission as S
          LEFT JOIN problem as P ON S."problemId" = P."id"
          WHERE status = $1 ORDER BY S."creationDate"`,
      ["waiting"]
    );
    if (result.rowCount === 0) return Promise.resolve(null);
    const data = result.rows[0];

    const task: TaskRes = {
      id: data.id,
      userId: data.userId,
      problemId: data.problemId,
      contestId: data.contestId,
      sourceCode: data.sourceCode,
      language: data.language,
      maxScore: data.score,
      timeLimit: data.timeLimit,
      memoryLimit: data.memoryLimit,
      testcase: data.case,
      mode: "classic",
    };

    await pool.query(
      `UPDATE "submission"
          SET "status" = 'grading'
          WHERE id = $1;`,
      [task.id]
    );
    return Promise.resolve(task);
  } catch (error) {
    console.log(error);
    return Promise.resolve(null);
  }
});

export { taskQueue };
