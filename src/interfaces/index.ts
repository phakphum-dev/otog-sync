export interface TaskRes {
  id: number;
  userId: number;
  problemId: number;
  contestId: number;
  sourceCode: string;
  language: string;
  maxScore: number;
  timeLimit: number;
  memoryLimit: number;
  testcase: string;
  mode: string;
}

export interface ResultReq {
  result: string;
  score: number;
  timeUsed: number;
  memUsed: number;
  status: string;
  errmsg: string;
}
