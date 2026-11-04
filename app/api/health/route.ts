export function GET() {
  return Response.json({
    ok: true,
    service: "sayvoya-api",
    routes: ["/api/flights/search-stream"],
  });
}
