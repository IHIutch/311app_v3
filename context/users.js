import { useReducer, useContext, createContext } from 'react'

// Action Defs
const SET = 'user/SET'
const UPDATE = 'user/UPDATE'
const REMOVE = 'user/REMOVE'
const CLEAR_CACHE = 'user/CLEAR_CACHE'

const initialState = {
  data: null,
}

const reducer = (state, action) => {
  switch (action.type) {
    case SET:
      return {
        ...state,
        data: action.user,
      }
    case UPDATE:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.user,
        },
      }
    case REMOVE:
      return initialState
    case CLEAR_CACHE:
      return initialState
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

const userStateContext = createContext()
const UserDispatchContext = createContext()

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <UserDispatchContext.Provider value={dispatch}>
      <userStateContext.Provider value={state}>
        {children}
      </userStateContext.Provider>
    </UserDispatchContext.Provider>
  )
}

export const useUserState = () => useContext(userStateContext)
export const useUserDispatch = () => useContext(UserDispatchContext)

// Actions
export function setUser(user) {
  return { type: SET, user }
}
export function updateUser(user) {
  return { type: UPDATE, user }
}
export function removeUser() {
  return { type: REMOVE }
}
