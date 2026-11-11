import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.BUILDTWIN_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

const PROTECTED_CACHE_POLICY = "private, no-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ artifactId: string }> },
): Promise<NextResponse> {
  const { artifactId } = await params;

  if (!artifactId) {
    return NextResponse.json(
      { error: "artifactId is required" },
      { status: 400 },
    );
  }

  const backendUrl = `${API_BASE_URL}/api/v1/artifacts/${artifactId}/preview`;

  // Forward the auth cookie from the client's request
  const token =
    _request.cookies.get("buildtwin_token")?.value;

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(backendUrl, { headers });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Backend returned ${response.status}`,
          status: response.status,
        },
        { status: response.status },
      );
    }

    const contentType =
      response.headers.get("content-type") ?? "image/jpeg";
    const contentLength = response.headers.get("content-length");
    const contentDisposition = response.headers.get("content-disposition");

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": PROTECTED_CACHE_POLICY,
        ...(contentLength ? { "Content-Length": contentLength } : {}),
        ...(contentDisposition ? { "Content-Disposition": contentDisposition } : {}),
      },
    });
  } catch (error) {
    console.error("Artifact preview proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artifact preview" },
      { status: 502 },
    );
  }
}
