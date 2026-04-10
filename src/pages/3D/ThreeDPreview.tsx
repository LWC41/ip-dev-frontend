/**
 * 3D模型预览页面
 * 使用Three.js和React Three Fiber
 */
import { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message, Upload, Modal } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { taskAPI, Task } from '../../store/api';

// 3D模型组件
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// 加载指示器
function Loader() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
      }}
    >
      <Spin size="large" />
    </div>
  );
}

export const ThreeDPreview: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // 加载3D生成任务
  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    if (!projectId) return;

    try {
      const response = await taskAPI.list(projectId);
      const modelTasks = response.data.filter(
        (t) => t.task_type === 'generate_3d' && t.status === 'completed'
      );
      setTasks(modelTasks);

      // 设置第一个模型为当前模型
      if (modelTasks.length > 0 && modelTasks[0].output_data?.model_url) {
        setCurrentModel(modelTasks[0].output_data.model_url);
      }
    } catch (error) {
      message.error('加载模型失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成3D模型
  const handleGenerate3D = async (params: any) => {
    if (!projectId) return;

    setGenerating(true);
    try {
      const response = await taskAPI.create({
        project_id: projectId,
        task_type: 'generate_3d',
        params,
      });

      message.success('3D生成任务已创建，正在处理...');

      // 轮询任务状态
      const task = await taskAPI.poll(response.data.id, 3000);

      if (task.status === 'completed' && task.output_data?.model_url) {
        message.success('3D模型生成成功！');
        setCurrentModel(task.output_data.model_url);
        loadTasks();
      } else if (task.status === 'failed') {
        message.error(`生成失败: ${task.error_message}`);
      }
    } catch (error) {
      message.error('创建任务失败');
    } finally {
      setGenerating(false);
    }
  };

  // 从文本生成3D
  const handleTextTo3D = () => {
    Modal.confirm({
      title: '文本生成3D模型',
      content: (
        <div>
          <p>输入描述来生成3D模型:</p>
          <input
            type="text"
            id="prompt-input"
            placeholder="例如: 可爱的龙眼精灵角色，Q版风格，圆润可爱的造型"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
            }}
          />
          <p style={{ marginTop: 16 }}>风格:</p>
          <select
            id="style-select"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
            }}
          >
            <option value="realistic">写实风格</option>
            <option value="cartoon">卡通风格</option>
            <option value="anime">动漫风格</option>
            <option value="low_poly">低多边形</option>
          </select>
        </div>
      ),
      onOk: () => {
        const prompt = (
          document.getElementById('prompt-input') as HTMLInputElement
        ).value;
        const style = (
          document.getElementById('style-select') as HTMLSelectElement
        ).value;

        if (!prompt) {
          message.error('请输入描述');
          return;
        }

        handleGenerate3D({ prompt, style });
      },
    });
  };

  // 从图片生成3D
  const handleImageTo3D = () => {
    Modal.confirm({
      title: '图片生成3D模型',
      content: (
        <div>
          <p>上传角色设计图:</p>
          <Upload.Dragger
            accept="image/*"
            maxCount={1}
            beforeUpload={(file) => {
              // 处理图片上传
              const reader = new FileReader();
              reader.onload = (e) => {
                const image_url = e.target?.result as string;
                Modal.confirm({
                  title: '生成参数',
                  content: (
                    <div>
                      <p>提示词 (可选):</p>
                      <input
                        type="text"
                        id="prompt-input"
                        placeholder="例如: Q版风格，可爱的造型"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  ),
                  onOk: () => {
                    const prompt = (
                      document.getElementById('prompt-input') as HTMLInputElement
                    ).value;
                    handleGenerate3D({ image_url, prompt });
                  },
                });
              };
              reader.readAsDataURL(file);
              return false; // 阻止自动上传
            }}
          >
            <p className="ant-upload-drag-icon">
              <PlusOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽上传图片</p>
            <p className="ant-upload-hint">
              支持 JPG, PNG 等格式
            </p>
          </Upload.Dragger>
        </div>
      ),
      okText: '生成',
      cancelText: '取消',
    });
  };

  // 下载模型
  const handleDownload = () => {
    if (!currentModel) return;

    const link = document.createElement('a');
    link.href = currentModel;
    link.download = `model_${Date.now()}.glb`;
    link.click();
  };

  // 分享模型
  const handleShare = () => {
    if (!currentModel) return;

    navigator.clipboard.writeText(currentModel);
    message.success('模型链接已复制到剪贴板');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
            <span>3D模型预览</span>
          </div>
        }
        extra={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              icon={<PlusOutlined />}
              onClick={handleTextTo3D}
              loading={generating}
            >
              文本生成3D
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={handleImageTo3D}
              loading={generating}
            >
              图片生成3D
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTasks}
            >
              刷新
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!currentModel}
            >
              下载
            </Button>
            <Button
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              disabled={!currentModel}
            >
              分享
            </Button>
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* 3D画布 */}
            <Card style={{ marginBottom: '16px' }}>
              <div style={{ height: '600px', width: '100%' }}>
                {currentModel ? (
                  <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
                    <Suspense fallback={<Loader />}>
                      <Model url={currentModel} />
                      <OrbitControls enableDamping />
                      <Environment preset="sunset" />
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 5]} intensity={1} />
                    </Suspense>
                  </Canvas>
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#999',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <PlusOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <p>还没有3D模型</p>
                      <p>点击上方按钮开始生成</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 模型列表 */}
            <Card title="生成的模型">
              {tasks.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>
                  暂无模型
                </p>
              ) : (
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {tasks.map((task) => (
                    <Card
                      key={task.id}
                      hoverable
                      style={{
                        width: '200px',
                        cursor: 'pointer',
                        border:
                          currentModel === task.output_data?.model_url
                            ? '2px solid #1890ff'
                            : '1px solid #f0f0f0',
                      }}
                      onClick={() =>
                        setCurrentModel(task.output_data?.model_url || null)
                      }
                    >
                      <div style={{ height: '150px', background: '#f5f5f5' }}>
                        {/* 这里可以添加模型缩略图 */}
                      </div>
                      <p
                        style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {task.input_data?.prompt || '未命名模型'}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};
