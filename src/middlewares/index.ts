import { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

interface Whitelist {
  allowIp: string[];
}

const { allowIp } = yaml.load(
  fs.readFileSync(path.resolve(process.cwd(), "whitelist.yaml"), "utf8")
) as Whitelist;

export const IpFilterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const graderIp = req.socket.remoteAddress as string;
  if (allowIp.includes(graderIp)) {
    next();
  } else {
    console.error(`Bad IP: ${graderIp} !!!!!!!!!!!`);
    res.status(401).send("");
  }
};
