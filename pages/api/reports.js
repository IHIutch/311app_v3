import {
  createReport,
  removeReport,
  setReports,
  updateReport,
  useReportDispatch,
} from "../../context/reports";
import {
  deleteReport,
  getReports,
  postReport,
  putReport,
} from "../../controllers/reports";
import { statusType } from "../utils/types";

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const data = await getReports(req, res);
      useReportDispatch(setReports(data));
      break;

    case "POST":
      const data = await postReport(req, res);
      useReportDispatch(createReport(data));
      break;

    case "PUT":
      const data = await putReport(req, res);
      useReportDispatch(updateReport(data));
      break;

    case "DELETE":
      const data = await deleteReport(req, res);
      useReportDispatch(removeReport(data));
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(statusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`);
  }
}
