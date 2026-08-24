import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Service from "@/models/Service";
import PricingRule from "@/models/PricingRule";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";

async function getDashboardStats() {
  await connectDB();

  const [productCount, serviceCount, pricingCount, orderCount, newOrders, recentOrders, revenueResult] =
    await Promise.all([
      Product.countDocuments(),
      Service.countDocuments({ status: "published" }),
      PricingRule.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "awaiting_payment" }),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

  return {
    productCount,
    serviceCount,
    pricingCount,
    orderCount,
    newOrders,
    totalRevenue: revenueResult[0]?.total ?? 0,
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

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Products", value: stats.productCount, href: "/admin/products" },
    { label: "Services", value: stats.serviceCount, href: "/admin/services" },
    { label: "Pricing rules", value: stats.pricingCount, href: "/admin/pricing" },
    { label: "Orders", value: stats.orderCount, href: "/admin/orders", alert: stats.newOrders },
    { label: "Revenue (paid)", value: formatCurrency(stats.totalRevenue), href: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm text-chrome-mid">
        Manage products, services, and pricing for the site. Orders appear here when customers checkout.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-lg border border-chrome-light/20 bg-white p-5 shadow-sm transition-all hover:border-royal-blue/30 hover:shadow-md"
          >
            <p className="text-sm font-medium text-chrome-mid">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-ink-black group-hover:text-royal-blue">{card.value}</p>
            {card.alert ? (
              <p className="mt-1 text-xs text-amber-600">{card.alert} awaiting payment</p>
            ) : null}
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-black">Recent orders</h2>
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
                    <td className="px-4 py-3 text-carbon">{formatCurrency(order.total, order.currency)}</td>
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
