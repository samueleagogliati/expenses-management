import { ref } from 'vue'

const STORAGE_KEY = 'expenses-theme'
export const isDarkTheme = ref(false)

export function setTheme(isDark) {
  isDarkTheme.value = isDark
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
}

export function initializeTheme() {
  setTheme(localStorage.getItem(STORAGE_KEY) === 'dark')
}
