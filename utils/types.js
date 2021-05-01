export const resStatusType = Object.freeze({
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  REDIRECTION: 301,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_SERVER_ERROR: 500,
})

export const reportStatusType = Object.freeze({
  CREATED: 0,
})

export const commentType = Object.freeze({
  REPORT: 'REPORT',
})
