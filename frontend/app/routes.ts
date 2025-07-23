import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("result", "routes/result.tsx"),
  route("history", "routes/history.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
