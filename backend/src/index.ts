import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 认证中间件
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }
    
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: '无效的token' });
  }
};

// ==================== 认证相关 ====================

// 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // 检查邮箱是否已存在
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || email.split('@')[0]
      }
    });
    
    // 生成 token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }
    
    // 验证密码
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }
    
    // 生成 token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户
app.get('/api/auth/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, username: true, avatar: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// ==================== 豆子管理 ====================

// 获取所有豆子
app.get('/api/beads', authenticate, async (req: any, res) => {
  try {
    const beads = await prisma.bead.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(beads);
  } catch (error) {
    res.status(500).json({ error: '获取豆子列表失败' });
  }
});

// 创建豆子
app.post('/api/beads', authenticate, async (req: any, res) => {
  try {
    const { colorCode, colorName, quantity, alertThreshold } = req.body;
    
    const bead = await prisma.bead.create({
      data: {
        colorCode,
        colorName,
        quantity: quantity || 0,
        alertThreshold: alertThreshold || 10,
        userId: req.userId
      }
    });
    
    res.json(bead);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: '该色号已存在' });
    } else {
      res.status(500).json({ error: '创建豆子失败' });
    }
  }
});

// 更新豆子
app.put('/api/beads/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { colorCode, colorName, quantity, alertThreshold } = req.body;
    
    const bead = await prisma.bead.updateMany({
      where: { id, userId: req.userId },
      data: { colorCode, colorName, quantity, alertThreshold }
    });
    
    if (bead.count === 0) {
      return res.status(404).json({ error: '豆子不存在' });
    }
    
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新豆子失败' });
  }
});

// 删除豆子
app.delete('/api/beads/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const bead = await prisma.bead.deleteMany({
      where: { id, userId: req.userId }
    });
    
    if (bead.count === 0) {
      return res.status(404).json({ error: '豆子不存在' });
    }
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除豆子失败' });
  }
});

// ==================== 图纸管理 ====================

// 获取所有图纸
app.get('/api/patterns', authenticate, async (req: any, res) => {
  try {
    const patterns = await prisma.pattern.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ error: '获取图纸列表失败' });
  }
});

// 创建图纸
app.post('/api/patterns', authenticate, async (req: any, res) => {
  try {
    const { name, imageUrl, thumbnailUrl, description, status } = req.body;
    
    const pattern = await prisma.pattern.create({
      data: {
        name,
        imageUrl,
        thumbnailUrl,
        description,
        status: status || 'planned',
        userId: req.userId
      }
    });
    
    res.json(pattern);
  } catch (error) {
    res.status(500).json({ error: '创建图纸失败' });
  }
});

// 更新图纸
app.put('/api/patterns/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, beadsUsed } = req.body;
    
    const pattern = await prisma.pattern.updateMany({
      where: { id, userId: req.userId },
      data: { name, description, status, beadsUsed }
    });
    
    if (pattern.count === 0) {
      return res.status(404).json({ error: '图纸不存在' });
    }
    
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新图纸失败' });
  }
});

// 删除图纸
app.delete('/api/patterns/:id', authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const pattern = await prisma.pattern.deleteMany({
      where: { id, userId: req.userId }
    });
    
    if (pattern.count === 0) {
      return res.status(404).json({ error: '图纸不存在' });
    }
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除图纸失败' });
  }
});

// ==================== 数据同步 ====================

// 批量同步数据
app.post('/api/sync', authenticate, async (req: any, res) => {
  try {
    const { beads, patterns } = req.body;
    
    // 清空现有数据
    await prisma.bead.deleteMany({ where: { userId: req.userId } });
    await prisma.pattern.deleteMany({ where: { userId: req.userId } });
    
    // 批量插入
    if (beads && beads.length > 0) {
      await prisma.bead.createMany({
        data: beads.map((b: any) => ({
          ...b,
          userId: req.userId,
          id: undefined
        }))
      });
    }
    
    if (patterns && patterns.length > 0) {
      await prisma.pattern.createMany({
        data: patterns.map((p: any) => ({
          ...p,
          userId: req.userId,
          id: undefined
        }))
      });
    }
    
    res.json({ message: '同步成功' });
  } catch (error) {
    console.error('同步错误:', error);
    res.status(500).json({ error: '同步失败' });
  }
});

// ==================== 健康检查 ====================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 拼豆豆 API 服务器运行在端口 ${PORT}`);
  console.log(`📍 健康检查: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
