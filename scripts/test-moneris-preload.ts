import { loadEnvFile } from "./load-env";

loadEnvFile();

import { getMonerisConfig, getMonerisEnvironment, monerisPreload } from "../src/lib/moneris";

async function tryPreload(label: string, options: Parameters<typeof monerisPreload>[0]) {
  try {
    const ticket = await monerisPreload(options);
    console.log(`${label}: OK (ticket ${ticket.slice(0, 12)}…)`);
  } catch (err) {
    console.log(`${label}: FAIL — ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function main() {
  const config = getMonerisConfig();
  console.log("Moneris configured:", Boolean(config));
  console.log("MONERIS_ENVIRONMENT:", getMonerisEnvironment());
  console.log(
    "NEXT_PUBLIC_MONERIS_ENVIRONMENT:",
    process.env.NEXT_PUBLIC_MONERIS_ENVIRONMENT || "(unset)"
  );
  if (!config) {
    console.log("Set MONERIS_STORE_ID, MONERIS_API_TOKEN, MONERIS_CHECKOUT_ID in .env");
    return;
  }

  const suffix = Date.now().toString(36);

  await tryPreload("minimal (txn only)", {
    txnTotal: 24.12,
    orderNo: `TEST-MIN-${suffix}`,
  });

  await tryPreload("cart + tax (no address)", {
    txnTotal: 24.12,
    orderNo: `TEST-CART-${suffix}`,
    cartItems: [
      { description: "Keychains", productCode: "keychains", unitCost: 5.99, quantity: 1 },
      { description: "Printing options", productCode: "PRINT", unitCost: 2.99, quantity: 1 },
      { description: "Shipping", productCode: "SHIP", unitCost: 11.99, quantity: 1 },
    ],
    cartTax: { amount: 3.15, description: "HST 15%" },
    contactDetails: {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      phone: "4165551234",
    },
  });
}

main();
