import { describe, expect, it } from "vitest";
import { postalMatchesProvince, postalMismatchMessage } from "@/lib/canadian-tax";

describe("postalMatchesProvince", () => {
  it("accepts a postal code in the right province", () => {
    expect(postalMatchesProvince("K8P 4Y8", "ON")).toBe(true);
    expect(postalMatchesProvince("k8p4y8", "Ontario")).toBe(true);
    expect(postalMatchesProvince("H2X 1Y4", "QC")).toBe(true);
    // codes starting with S (Saskatchewan) must not lose their first letter
    expect(postalMatchesProvince("S7K 0A1", "SK")).toBe(true);
    expect(postalMatchesProvince("S7K 0A1", "ON")).toBe(false);
  });

  it("rejects a postal code from another province", () => {
    expect(postalMatchesProvince("K8P 4Y8", "BC")).toBe(false);
    expect(postalMatchesProvince("V6B 1A1", "ON")).toBe(false);
  });

  it("allows both territories for the shared X prefix", () => {
    expect(postalMatchesProvince("X0A 0H0", "NU")).toBe(true);
    expect(postalMatchesProvince("X1A 2P3", "NT")).toBe(true);
  });

  it("does not block when either value is missing", () => {
    expect(postalMatchesProvince("", "ON")).toBe(true);
    expect(postalMatchesProvince("K8P 4Y8", "")).toBe(true);
  });

  it("explains the mismatch", () => {
    expect(postalMismatchMessage("K8P 4Y8", "BC")).toContain("Ontario");
  });
});
