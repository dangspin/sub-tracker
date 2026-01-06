"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";

type Subscription = {
  id: number;
  name: string;
  price: number;
  cycle: string;
  startDate: string;
  active: boolean;
  createdAt: string;
};

export default function Home() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cycle, setCycle] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    const cycleLower = sub.cycle.toLowerCase();
    const monthlyPrice =
      cycleLower === "yearly"
        ? sub.price / 12
        : cycleLower === "monthly"
        ? sub.price
        : sub.price;

    return sum + monthlyPrice;
  }, 0);

  const formattedTotalMonthlyCost = totalMonthlyCost.toFixed(2);
  const totalColorClass =
    totalMonthlyCost > 100 ? "text-red-500" : "text-emerald-500";

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/subscriptions");
      if (!res.ok) {
        throw new Error("获取订阅列表失败");
      }
      const data: Subscription[] = await res.json();
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  function formatDateForInput(dateString: string) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name,
        price: Number(price),
        cycle,
        startDate,
      };

      const url =
        editingId === null
          ? "/api/subscriptions"
          : `/api/subscriptions/${editingId}`;
      const method = editingId === null ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || (editingId === null ? "创建订阅失败" : "更新订阅失败"));
      }

      await fetchSubscriptions();

      setName("");
      setPrice("");
      setCycle("monthly");
      setStartDate("");
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(sub: Subscription) {
    setEditingId(sub.id);
    setName(sub.name);
    setPrice(String(sub.price));
    setCycle(sub.cycle.toLowerCase());
    setStartDate(formatDateForInput(sub.startDate));
  }

  async function handleDelete(id: number) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "删除订阅失败");
      }
      await fetchSubscriptions();
      if (editingId === id) {
        setEditingId(null);
        setName("");
        setPrice("");
        setCycle("monthly");
        setStartDate("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <section className="rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 p-6 shadow-sm ring-1 ring-zinc-900">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-400">
            Total Monthly Cost
          </p>
          <p className={`mt-2 text-4xl font-bold ${totalColorClass}`}>
            ¥{formattedTotalMonthlyCost}
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            按照每月计算：年费已换算为每月费用。
          </p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            订阅管理
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            添加你的订阅服务，并在下方列表中查看它们。
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                服务名称
              </label>
              <input
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如 Netflix、Spotify"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                价格（¥）
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="例如 15.99"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                扣费周期
              </label>
              <select
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
              >
                <option value="monthly">每月</option>
                <option value="yearly">每年</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                开始日期
              </label>
              <input
                type="date"
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3">
              {editingId !== null && (
                <span className="mr-auto text-xs text-amber-600 dark:text-amber-400">
                  正在编辑 ID 为 {editingId} 的订阅
                </span>
              )}
              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}
              {editingId !== null && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setPrice("");
                    setCycle("monthly");
                    setStartDate("");
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  取消编辑
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {submitting
                  ? editingId === null
                    ? "提交中..."
                    : "更新中..."
                  : editingId === null
                  ? "添加订阅"
                  : "更新订阅"}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              订阅列表
            </h2>
            {loading && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                加载中...
              </span>
            )}
          </div>

          {subscriptions.length === 0 && !loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              暂无订阅，先在上方添加一条吧。
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                        {sub.name}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {sub.cycle === "monthly" ? "每月订阅" : "每年订阅"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(sub)}
                        className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        aria-label="编辑订阅"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        className="rounded-full p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400"
                        aria-label="删除订阅"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      ¥{sub.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-400">
                      开始于 {new Date(sub.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
