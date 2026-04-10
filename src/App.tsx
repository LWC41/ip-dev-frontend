/**
 * IP开发Agent前端应用主入口
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { ProjectList } from './pages/Project/ProjectList';
import { ProjectDetail } from './pages/Project/ProjectDetail';
import { CharacterEditor } from './pages/Character/CharacterEditor';
import { ThreeDPreview } from './pages/3D/ThreeDPreview';
import { ContentCreator } from './pages/Content/ContentCreator';
import { TaskManager } from './pages/Tasks/TaskManager';
import { Settings } from './pages/Settings';
import { Login } from './pages/Auth/Login';
import { useAuthStore } from './store/auth';

// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          
          {/* 受保护路由 */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* 项目管理 */}
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            
            {/* 角色设计 */}
            <Route path="characters/:characterId" element={<CharacterEditor />} />
            
            {/* 3D预览 */}
            <Route path="3d/:projectId" element={<ThreeDPreview />} />
            
            {/* 内容生产 */}
            <Route path="content" element={<ContentCreator />} />
            
            {/* 任务管理 */}
            <Route path="tasks" element={<TaskManager />} />
            
            {/* 设置 */}
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
