import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// 创建 Prisma 客户端实例
const prisma = new PrismaClient();

// DELETE /api/subscriptions/[id]
// 用于删除一条订阅记录
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 从异步的 params 中解析出 id，并转换为数字
    const { id } = await params;
    const numericId = Number(id);

    if (!numericId || Number.isNaN(numericId)) {
      return NextResponse.json(
        { error: "无效的订阅 ID" },
        { status: 400 }
      );
    }

    // 调用 Prisma 删除对应的订阅记录
    const deleted = await prisma.subscription.delete({
      where: { id: numericId },
    });

    // 返回被删除的那条数据，方便前端调试
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/subscriptions/[id] 出错：", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// PATCH /api/subscriptions/[id]
// 用于部分更新一条订阅记录（仅更新传入的字段）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (!numericId || Number.isNaN(numericId)) {
      return NextResponse.json(
        { error: "无效的订阅 ID" },
        { status: 400 }
      );
    }

    // 从请求体中读取要更新的字段（可能只是部分字段）
    const body = await request.json();

    const { name, price, cycle, startDate, active } = body as {
      name?: string;
      price?: number;
      cycle?: string;
      startDate?: string;
      active?: boolean;
    };

    // 构造 Prisma 需要的 data 对象，只包含实际要更新的字段
    const data: any = {};

    if (typeof name === "string") data.name = name;
    if (typeof price !== "undefined") data.price = Number(price);
    if (typeof cycle === "string") data.cycle = cycle;
    if (typeof startDate === "string")
      data.startDate = new Date(startDate);
    if (typeof active === "boolean") data.active = active;

    // 如果没有任何可更新字段，返回 400
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "没有提供任何可更新的字段" },
        { status: 400 }
      );
    }

    // 调用 Prisma 更新记录
    const updated = await prisma.subscription.update({
      where: { id: numericId },
      data,
    });

    // 返回更新后的数据
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/subscriptions/[id] 出错：", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
