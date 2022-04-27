import express, { Application, Request, Response } from "express";
import * as dotenv from "dotenv";
import morgan from "morgan";
import { ResultReq } from "./interfaces";
import { taskQueue } from "./taskQueue";
import { pool } from "./db";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app: Application = express();

// app.use(morgan("combined"));

app.use(express.json());

app.get("/task", async (req: Request, res: Response) => {
  const job = await taskQueue.add({ msg: "get waiting task" });
  const graderId = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const task = await job.finished();
  if (!task) {
    return res.status(404).send("");
  }
  console.log(`Send submission id: ${task.id} to grader ip: ${graderId}`);
  return res.json(task);
});

app.post("/result/:resultId", async (req: Request, res: Response) => {
  try {
    const graderId = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const { resultId } = req.params;
    const result = req.body as ResultReq;
    console.log(`Receive result id: ${resultId} from grader ip: ${graderId}`);
    const currentDate = new Date();
    await pool.query(
      `UPDATE submission SET result = $1, score = $2, "timeUsed" = $3, 
        status = $4, errmsg = $5, "updateDate" = $6 WHERE id = $7`,
      [
        result.result,
        result.score,
        result.timeUsed,
        result.status,
        result.errmsg,
        currentDate,
        resultId,
      ]
    );
    return res.status(200).send("");
  } catch (error) {
    console.log(error);
    return res.status(422).send("");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
