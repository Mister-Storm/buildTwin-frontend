import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { AuthGuard } from "@/components/auth/AuthGuard";

const state = vi.hoisted(() => ({
  pathname: "/projects",
  authenticated: false,
  demo: false,
  router: { replace: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
  useRouter: () => state.router,
}));
vi.mock("@/services/auth.service", () => ({
  isAuthenticated: () => state.authenticated,
}));
vi.mock("@/features/demo/demo-seed", () => ({
  get DEMO_ENABLED() { return state.demo; },
}));

beforeEach(() => {
  state.pathname = "/projects";
  state.authenticated = false;
  state.demo = false;
  state.router.replace.mockClear();
});
afterEach(cleanup);

describe("AuthGuard", () => {
  it("should preserve supported authenticated navigation when server markup hydrates", () => {
    state.authenticated = true;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const children = <AuthGuard><div>Protected content</div></AuthGuard>;
    container.innerHTML = renderToString(children);
    const sut = render(children, { container, hydrate: true });
    expect(sut.getByText("Protected content")).toBeVisible();
    expect(state.router.replace).not.toHaveBeenCalled();
  });

  it("should withhold protected children when unauthenticated routing is pending", () => {
    const sut = render(<AuthGuard><div>Protected content</div></AuthGuard>);
    expect(state.router.replace).toHaveBeenCalledWith("/login");
    expect(sut.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("should render protected children when a supported session is present", () => {
    state.authenticated = true;
    const sut = render(<AuthGuard><div>Protected content</div></AuthGuard>);
    expect(sut.getByText("Protected content")).toBeVisible();
    expect(state.router.replace).not.toHaveBeenCalled();
  });

  it("should withhold the next protected page when session state disappears before navigation", () => {
    state.authenticated = true;
    const sut = render(<AuthGuard><div>First project</div></AuthGuard>);
    expect(sut.getByText("First project")).toBeVisible();
    state.authenticated = false;
    state.pathname = "/projects/another-project";
    sut.rerender(<AuthGuard><div>Next project</div></AuthGuard>);
    expect(sut.queryByText("Next project")).not.toBeInTheDocument();
    expect(state.router.replace).toHaveBeenCalledWith("/login");
  });

  it("should withhold protected children when another tab clears authentication storage", () => {
    state.authenticated = true;
    const sut = render(<AuthGuard><div>Protected content</div></AuthGuard>);
    expect(sut.getByText("Protected content")).toBeVisible();
    state.authenticated = false;
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: "buildtwin_token" })));
    expect(sut.queryByText("Protected content")).not.toBeInTheDocument();
    expect(state.router.replace).toHaveBeenCalledWith("/login");
  });

  it.each(["/login", "/demo/overview"])("should preserve public rendering when route is %s", (pathname) => {
    state.pathname = pathname;
    const sut = render(<AuthGuard><div>Public content</div></AuthGuard>);
    expect(sut.getByText("Public content")).toBeVisible();
    expect(state.router.replace).not.toHaveBeenCalled();
  });

  it.each(["/login-settings", "/demography"])("should require authentication when sibling route is %s", (pathname) => {
    state.pathname = pathname;
    const sut = render(<AuthGuard><div>Protected content</div></AuthGuard>);
    expect(sut.queryByText("Protected content")).not.toBeInTheDocument();
    expect(state.router.replace).toHaveBeenCalledWith("/login");
  });

  it("should preserve isolated demonstration rendering when explicit demo mode is enabled", () => {
    state.demo = true;
    const sut = render(<AuthGuard><div>Demo content</div></AuthGuard>);
    expect(screen.getByText("Demo content")).toBeVisible();
    expect(sut.container).toHaveTextContent("Demo content");
    expect(state.router.replace).not.toHaveBeenCalled();
  });
});
