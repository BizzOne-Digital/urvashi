import { describe, expect, it } from "vitest";
import { splitNullFields } from "@/lib/mongo-update";

describe("splitNullFields", () => {
  it("moves null fields to unset and keeps the rest in set", () => {
    const { set, unset } = splitNullFields({
      name: "Tote",
      mockupBackImage: null,
      weightGrams: 0,
      price: 9.99,
      blankImage: null,
    });

    expect(set).toEqual({ name: "Tote", weightGrams: 0, price: 9.99 });
    expect(unset).toEqual({ mockupBackImage: "", blankImage: "" });
  });

  it("returns an empty unset when nothing is cleared", () => {
    expect(splitNullFields({ name: "Mug" })).toEqual({ set: { name: "Mug" }, unset: {} });
  });
});
