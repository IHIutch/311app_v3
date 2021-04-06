import { useReducer, useContext, createContext } from "react";

// Action Defs
const SET = "reports/SET";
const SET_UNIQUE = "reports/SET_UNIQUE";
const CREATE = "reports/CREATE";
const UPDATE = "reports/UPDATE";
const DELETE = "reports/DELETE";
const CLEAR_CACHE = "reports/CLEAR_CACHE";

const initialState = {
  data: null,
  unique: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case SET:
      return {
        ...state,
        data: action.reports.reduce((a, b) => ((a[b.id] = b), a), {}),
      };
    case SET_UNIQUE:
      return {
        ...state,
        unique: action.report,
      };
    case CREATE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.report.id]: { ...action.report },
        },
      };
    case UPDATE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.report.id]: action.report,
        },
      };
    case DELETE:
      return Object.values(state.data).filter((v) => v.id !== id);
    case CLEAR_CACHE:
      return initialState;
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

const ReportStateContext = createContext();
const ReportDispatchContext = createContext();

export const ReportProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <ReportDispatchContext.Provider value={dispatch}>
      <ReportStateContext.Provider value={state}>
        {children}
      </ReportStateContext.Provider>
    </ReportDispatchContext.Provider>
  );
};

export const useReportState = () => useContext(ReportStateContext);
export const useReportDispatch = () => useContext(ReportDispatchContext);

// Actions
export function setReports(reports) {
  return { type: SET, reports };
}
export function setReport(report) {
  return { type: SET_UNIQUE, report };
}
export function createReport(report) {
  return { type: CREATE, report };
}
export function updateReport(report) {
  return { type: UPDATE, report };
}
export function deleteReport() {
  return { type: DELETE };
}
