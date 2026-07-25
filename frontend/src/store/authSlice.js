import { createSlice } from '@reduxjs/toolkit'

const getInitialState = () => {
  try {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')
    if (savedUser) {
      return {
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        passwordUpdated: false,
      }
    }
  } catch (error) {
    console.error('Error restoring auth state:', error)
  }
  return {
    user: {
      name: '',
      email: '',
      password: '',
    },
    isAuthenticated: false,
    passwordUpdated: false,
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    signup: (state, action) => {
      state.user = {
        name: action.payload.name,
        email: action.payload.email,
        password: action.payload.password,
      }
      state.isAuthenticated = false
      state.passwordUpdated = false
    },
    login: (state, action) => {
      const updatedUser = {
        ...state.user,
        name: action.payload.name || action.payload.fullName || state.user?.name || 'Player',
        email: action.payload.email || state.user?.email || '',
        password: action.payload.password || state.user?.password || '',
      }
      state.user = updatedUser
      state.isAuthenticated = true
      state.passwordUpdated = false

      // Persist in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken)
      }
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      }
    },
    changePassword: (state, action) => {
      if (state.user) {
        state.user.password = action.payload.newPassword
        state.passwordUpdated = true
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
  },
})

export const { signup, login, changePassword, logout } = authSlice.actions
export default authSlice.reducer
