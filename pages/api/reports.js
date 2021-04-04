import {
  deleteReport,
  getReports,
  postReport,
  putReport,
} from "../../controllers/reports";
import { statusType } from "../utils/types";

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      getReports(req, res);
      break;

    case "POST":
      postReport(req, res);
      break;

    case "PUT":
      putReport(req, res);
      break;

    case "DELETE":
      deleteReport(req, res);
      break;

    default:
      res.setHeader("Allow", ["PUT", "POST"]);
      res.status(statusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`);
  }
}
