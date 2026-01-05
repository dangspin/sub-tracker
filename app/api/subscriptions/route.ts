import {NextResponse} from "next/server";
import { PrismaClient} from "@prisma/client";

// 创建一个 PrismaClient 实例，用来操作数据库
const prisma = new PrismaClient();

// 处理 GET 请求：返回所有订阅数据，按 createdAt 倒序
export async function GET() {
    try {
        // 从数据库中查询所有订阅数据，按 createdAt 倒序排序
        const subscriptions = await prisma.subscription.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        // 返回查询结果
        return NextResponse.json(subscriptions);
    } catch (error) {
        // 处理错误，返回 500 错误响应
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// 处理 POST 请求：创建一条新的订阅记录
export async function POST(request: Request) {
  try {
    // 从请求体中解析出 JSON 数据
    const body = await request.json();

    // 从请求体中解构出需要的字段
    const { name, price, cycle, startDate } = body;

    // 简单校验：如果有必填字段缺失，返回 400
    if (!name || !price || !cycle || !startDate) {
      return NextResponse.json(
        { error: "缺少必要字段：name, price, cycle, startDate" },
        { status: 400 },
      );
    }

    // 使用 Prisma 创建一条新的 Subscription 记录
    const newSubscription = await prisma.subscription.create({
      data: {
        // 服务名称
        name,
        // 价格：确保转换成数字类型
        price: Number(price),
        // 周期（如 "monthly" / "yearly"）
        cycle,
        // 开始时间：从字符串转换为 Date 类型
        startDate: new Date(startDate),
        // active 和 createdAt 会使用数据库的默认值
      },
    });

    // 返回创建成功的数据，状态码 201（Created）
    return NextResponse.json(newSubscription, { status: 201 });
  } catch (error) {
    // 捕获任何异常（例如 JSON 解析错误、数据库错误等）
    console.error("POST /api/subscriptions 出错：", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
