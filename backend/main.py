"""
FastAPI 应用主入口
配置 CORS、路由注册、中间件
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import analyze, history, auth
from config import get_settings
from utils.logger import logger

# 创建 FastAPI 应用实例
app = FastAPI(
    title="AI 风水大师 API",
    description="智能风水分析系统后端服务",
    version="1.0.0"
)

# 获取配置
settings = get_settings()

# 配置 CORS
origins = settings.allowed_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 注册路由
app.include_router(analyze.router)
app.include_router(history.router)
app.include_router(auth.router)


@app.get("/")
async def root():
    """健康检查接口"""
    return {
        "service": "AI 风水大师 API",
        "version": "1.0.0",
        "status": "running"
    }


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    logger.info("=" * 60)
    logger.info("AI 风水大师后端服务启动")
    logger.info(f"环境: {settings.environment}")
    logger.info(f"监听地址: {settings.host}:{settings.port}")
    logger.info(f"允许的来源: {settings.allowed_origins}")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭事件"""
    logger.info("AI 风水大师后端服务已关闭")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development"
    )
