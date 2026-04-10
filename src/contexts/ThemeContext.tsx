/**
 * 全局主题系统 —— 亮色 / 暗色双主题
 * 基于 Ant Design 5.x 的 CSS-in-JS theme tokens
 */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

// ── 主题类型 ──
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggle: () => {},
  setMode: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'ip-agent-theme-mode';

// ── 自定义 Token ──
const lightTokens = {
  colorPrimary: '#6366f1',        // Indigo 500
  colorSuccess: '#22c55e',
  colorWarning: '#f59e0b',
  colorError: '#ef4444',
  colorInfo: '#3b82f6',
  borderRadius: 12,
  colorBgContainer: '#ffffff',
  colorBgLayout: '#f5f5f7',
  colorBgElevated: '#ffffff',
  colorText: '#1e1e2e',
  colorTextSecondary: '#6b7280',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
};

const darkTokens = {
  colorPrimary: '#818cf8',        // Indigo 400
  colorSuccess: '#34d399',
  colorWarning: '#fbbf24',
  colorError: '#f87171',
  colorInfo: '#60a5fa',
  borderRadius: 12,
  colorBgContainer: '#1e1e2e',
  colorBgLayout: '#13131f',
  colorBgElevated: '#282840',
  colorText: '#e4e4f0',
  colorTextSecondary: '#9ca3af',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
};

// ── Provider ──
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}
    return 'light';
  });

  const toggle = () => setModeState(m => (m === 'light' ? 'dark' : 'light'));
  const setMode = (m: ThemeMode) => setModeState(m);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.setAttribute('data-theme', mode);
    document.body.style.background = mode === 'dark' ? '#13131f' : '#f5f5f7';
    document.body.style.color = mode === 'dark' ? '#e4e4f0' : '#1e1e2e';
    document.body.style.transition = 'background 0.3s, color 0.3s';
  }, [mode]);

  const themeConfig = useMemo(() => {
    const tokens = mode === 'dark' ? darkTokens : lightTokens;
    return {
      algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: tokens,
      components: {
        Layout: {
          siderBg: mode === 'dark' ? '#1a1a2e' : '#ffffff',
          headerBg: mode === 'dark' ? '#16162a' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          bodyBg: mode === 'dark' ? '#13131f' : '#f5f5f7',
        },
        Menu: {
          itemBg: 'transparent',
          itemSelectedBg: mode === 'dark' ? '#2a2a4a' : '#f0eeff',
          itemSelectedColor: '#6366f1',
          itemHoverBg: mode === 'dark' ? '#2a2a4a' : '#f8f7ff',
        },
        Card: {
          colorBorderSecondary: mode === 'dark' ? '#2a2a4a' : '#f0f0f0',
        },
        Steps: {
          colorPrimary: '#6366f1',
        },
        Tabs: {
          itemSelectedColor: '#6366f1',
          inkBarColor: '#6366f1',
        },
      },
    };
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggle, setMode }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
