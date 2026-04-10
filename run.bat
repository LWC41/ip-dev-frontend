@echo off
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%

:: 删除旧的node_modules和lock文件
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json

:: 重新安装依赖
echo 正在安装依赖...
call npm install

:: 启动开发服务器
echo 启动中...
npm run dev
pause