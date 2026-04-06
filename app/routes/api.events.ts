import { getEventById } from "~/lib/queries.server";
import type { Route } from "./+types/api.events";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids") || "";
  const ids = idsParam
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);

  const events = ids.map((id) => getEventById(id)).filter(Boolean);
  return Response.json({ events });
}
