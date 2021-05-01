import { useReducer, useContext, createContext } from 'react'

// Action Defs
const SET = 'comments/SET'
const SET_UNIQUE = 'comments/SET_UNIQUE'
const CREATE = 'comments/CREATE'
const UPDATE = 'comments/UPDATE'
const REMOVE = 'comments/REMOVE'
const CLEAR_CACHE = 'comments/CLEAR_CACHE'

const initialState = {
  data: null,
  unique: null,
}

const reducer = (state, action) => {
  switch (action.type) {
    case SET:
      return {
        ...state,
        // eslint-disable-next-line no-sequences
        data: action.comments.reduce((a, b) => ((a[b.id] = b), a), {}),
      }
    case SET_UNIQUE:
      return {
        ...state,
        unique: action.comment,
      }
    case CREATE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.comment.id]: { ...action.comment },
        },
      }
    case UPDATE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.comment.id]: action.comment,
        },
      }
    case REMOVE:
      return Object.values(state.data).filter((v) => v.id !== action.comment.id)
    case CLEAR_CACHE:
      return initialState
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

const CommentStateContext = createContext()
const CommentDispatchContext = createContext()

export const CommentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <CommentDispatchContext.Provider value={dispatch}>
      <CommentStateContext.Provider value={state}>
        {children}
      </CommentStateContext.Provider>
    </CommentDispatchContext.Provider>
  )
}

export const useCommentState = () => useContext(CommentStateContext)
export const useCommentDispatch = () => useContext(CommentDispatchContext)

// Actions
export function setComments(comments) {
  return { type: SET, comments }
}
export function setUniqueComment(comment) {
  return { type: SET_UNIQUE, comment }
}
export function createComment(comment) {
  return { type: CREATE, comment }
}
export function updateComment(comment) {
  return { type: UPDATE, comment }
}
export function removeComment() {
  return { type: REMOVE }
}
