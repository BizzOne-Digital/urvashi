import { connectDB } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";
import { isSmtpConfigured } from "@/lib/email";
import fs from "fs/promises";
import path from "path";
import Product from "@/models/Product";
import Order from "@/models/Order";
import CustomOrderRequest from "@/models/CustomOrderRequest";
import ContactMessage from "@/models/ContactMessage";
import BookingRequest from "@/models/BookingRequest";
import Service from "@/models/Service";
import BlogPost from "@/models/BlogPost";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

async function getSystemChecks() {
  let dbOk = false;
  let dbMessage = "Disconnected";

  try {
    await connectDB();
    dbOk = true;
    dbMessage = "Connected";
  } catch {
    dbMessage = "Connection failed";
  }

  let uploadsOk = false;
  let uploadsMessage = "Not writable";

  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    await fs.access(uploadsDir);
    await fs.access(uploadsDir, fs.constants.W_OK);
    uploadsOk = true;
    uploadsMessage = "Writable";
  } catch {
    try {
      const uploadsDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      uploadsOk = true;
      uploadsMessage = "Created & writable";
    } catch {
      uploadsMessage = "Directory unavailable";
    }
  }

  const stripeOk = isStripeConfigured();
  const smtpOk = isSmtpConfigured();

  return {
    db: { ok: dbOk, message: dbMessage },
    uploads: { ok: uploadsOk, message: uploadsMessage },
    stripe: { ok: stripeOk, message: stripeOk ? "Configured" : "Not configured" },
    smtp: { ok: smtpOk, message: smtpOk ? "Configured" : "Not configured" },
  };
}

async function getDashboardStats() {
  await connectDB();

  const [
    productCount,
    orderCount,
    customOrderCount,
    messageCount,
    bookingCount,
    serviceCount,
    blogCount,
    newMessages,
    newOrders,
    recentOrders,
    revenueResult,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    CustomOrderRequest.countDocuments({ status: { $nin: ["closed", "spam", "declined"] } }),
    ContactMessage.countDocuments({ status: "new" }),
    BookingRequest.countDocuments({ status: "new" }),
    Service.countDocuments({ status: "published" }),
    BlogPost.countDocuments({ status: "published" }),
    ContactMessage.countDocuments({ status: "new" }),
    Order.countDocuments({ paymentStatus: "awaiting_payment" }),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  const totalRevenue = revenueResult[0]?.total ?? 0;

  return {
    productCount,
    orderCount,
    customOrderCount,
    messageCount,
    bookingCount,
    serviceCount,
    blogCount,
    newMessages,
    newOrders,
    totalRevenue,
    recentOrders: recentOrders.map((o) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      customer: `${o.customer.firstName} ${o.customer.lastName}`,
      total: o.total,
      currency: o.currency,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
    })),
  };
}

function SystemCheckCard({
  label,
  ok,
  message,
}: {
  label: string;
  ok: boolean;
  message: string;
}) {
  const Icon = ok ? CheckCircle2 : message.includes("Not configured") ? AlertCircle : XCircle;
  const color = ok ? "text-emerald-500" : message.includes("Not configured") ? "text-amber-500" : "text-red-500";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-chrome-light/20 bg-white p-4 shadow-sm">
      <Icon className={`h-5 w-5 shrink-0 ${color}`} />
      <div>
        <p className="font-medium text-ink-black">{label}</p>
        <p className="text-sm text-chrome-mid">{message}</p>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, checks] = await Promise.all([getDashboardStats(), getSystemChecks()]);

  const statCards = [
    { label: "Products", value: stats.productCount, href: "/admin/products" },
    { label: "Orders", value: stats.orderCount, href: "/admin/orders", alert: stats.newOrders },
    { label: "Custom Orders", value: stats.customOrderCount, href: "/admin/custom-orders" },
    { label: "New Messages", value: stats.messageCount, href: "/admin/messages", alert: stats.newMessages },
    { label: "New Bookings", value: stats.bookingCount, href: "/admin/bookings" },
    { label: "Revenue (Paid)", value: formatCurrency(stats.totalRevenue), href: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-lg border border-chrome-light/20 bg-white p-5 shadow-sm transition-all hover:border-royal-blue/30 hover:shadow-md"
          >
            <p className="text-sm font-medium text-chrome-mid">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-ink-black group-hover:text-royal-blue">
              {card.value}
            </p>
            {card.alert ? (
              <p className="mt-1 text-xs text-amber-600">{card.alert} need attention</p>
            ) : null}
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink-black">System Checks</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SystemCheckCard label="Database" ok={checks.db.ok} message={checks.db.message} />
          <SystemCheckCard label="Uploads" ok={checks.uploads.ok} message={checks.uploads.message} />
          <SystemCheckCard label="Stripe" ok={checks.stripe.ok} message={checks.stripe.message} />
          <SystemCheckCard label="SMTP Email" ok={checks.smtp.ok} message={checks.smtp.message} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-black">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-royal-blue hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-chrome-light/20 bg-white shadow-sm">
          {stats.recentOrders.length === 0 ? (
            <p className="p-8 text-center text-chrome-mid">No orders yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-chrome-light/20 bg-carbon/5">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chrome-light/15">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-royal-blue/5">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-royal-blue hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-carbon">{order.customer}</td>
                    <td className="px-4 py-3 text-carbon">
                      {formatCurrency(order.total, order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3 text-chrome-mid">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
