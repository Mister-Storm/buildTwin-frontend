import { describe, expect, it } from "vitest";
import { resolveLifecycleFixtures } from "../../e2e/real/lifecycle-data";

function fixtures() {
  const id = (value: number) => `00000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
  const cases = Object.fromEntries(["linked", "downgrade", "membership", "reassignment", "activation", "unchanged"].map((name, index) => {
    const user = (offset: number) => ({ id: id(index * 100 + offset), email: `pilot-${name}-${offset}@example.invalid` });
    return [name, {
      organizationId: id(index * 100 + 1),
      alpha: { id: id(index * 100 + 2), name: "pilot-fixture-alpha" },
      beta: { id: id(index * 100 + 3), name: "pilot-fixture-beta" },
      gamma: { id: id(index * 100 + 4), name: "pilot-fixture-gamma" },
      subject: user(10), administrator: user(11), operator: user(12), viewer: user(13), unlinked: user(14),
    }];
  }));
  return { kind: "buildtwin-disposable-authorization-v1", cases };
}

describe("real lifecycle fixture boundary", () => {
  it("should accept independent scoped fixtures when an in-memory credential is supplied", () => {
    const sut = resolveLifecycleFixtures;
    const result = sut({ BUILDTWIN_REAL_AUTH_FIXTURES: JSON.stringify(fixtures()), BUILDTWIN_REAL_USER_PASSWORD: "test-only-password" });
    expect(result.cases.linked.alpha.name).toBe("pilot-fixture-alpha");
  });

  it("should reject scope reuse when lifecycle mutations could affect another case", () => {
    const data = fixtures();
    data.cases.membership = data.cases.linked!;
    const sut = resolveLifecycleFixtures;
    expect(() => sut({ BUILDTWIN_REAL_AUTH_FIXTURES: JSON.stringify(data), BUILDTWIN_REAL_USER_PASSWORD: "test-only-password" })).toThrow("credentials redacted");
  });

  it("should redact invalid fixture input when a payload contains credential fields", () => {
    const sut = resolveLifecycleFixtures;
    expect(() => sut({ BUILDTWIN_REAL_AUTH_FIXTURES: JSON.stringify({ ...fixtures(), password: "must-not-be-retained" }), BUILDTWIN_REAL_USER_PASSWORD: "test-only-password" })).toThrow("Identifiable disposable lifecycle fixtures are required; credentials redacted");
  });
});
