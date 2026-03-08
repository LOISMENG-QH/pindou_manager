// 主题配置
export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  text: string;
  textSecondary: string;
}

export const THEMES: { [key: string]: Theme } = {
  default: {
    name: '默认蓝',
    primary: '#1976d2',
    secondary: '#e0e0e0',
    success: '#4caf50',
    warning: '#ffc107',
    danger: '#d32f2f',
    background: '#f5f5f5',
    text: '#333333',
    textSecondary: '#666666'
  },
  pink: {
    name: '少女粉',
    primary: '#e91e63',
    secondary: '#fce4ec',
    success: '#66bb6a',
    warning: '#ffa726',
    danger: '#ef5350',
    background: '#fff0f5',
    text: '#333333',
    textSecondary: '#666666'
  },
  purple: {
    name: '梦幻紫',
    primary: '#9c27b0',
    secondary: '#f3e5f5',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    background: '#faf5ff',
    text: '#333333',
    textSecondary: '#666666'
  },
  green: {
    name: '清新绿',
    primary: '#4caf50',
    secondary: '#e8f5e9',
    success: '#66bb6a',
    warning: '#ffb74d',
    danger: '#e57373',
    background: '#f1f8f4',
    text: '#333333',
    textSecondary: '#666666'
  },
  orange: {
    name: '活力橙',
    primary: '#ff9800',
    secondary: '#fff3e0',
    success: '#66bb6a',
    warning: '#ffa726',
    danger: '#ef5350',
    background: '#fff8f0',
    text: '#333333',
    textSecondary: '#666666'
  },
  dark: {
    name: '暗黑模式',
    primary: '#90caf9',
    secondary: '#424242',
    success: '#81c784',
    warning: '#ffb74d',
    danger: '#e57373',
    background: '#1e1e1e',
    text: '#e0e0e0',
    textSecondary: '#b0b0b0'
  }
};

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-success', theme.success);
  root.style.setProperty('--color-warning', theme.warning);
  root.style.setProperty('--color-danger', theme.danger);
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-text', theme.text);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);
  
  // 设置 body 背景色和文字颜色
  document.body.style.backgroundColor = theme.background;
  document.body.style.color = theme.text;
  
  // 保存到 localStorage
  localStorage.setItem('theme', JSON.stringify(theme));
}

export function loadTheme(): Theme {
  const saved = localStorage.getItem('theme');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return THEMES.default;
    }
  }
  return THEMES.default;
}
