export type Route =
  | "landing"
  | "login"
  | "register"
  | "lobby"
  | "room"
  | "game"
  | "results"
  | "settings";

class RouterStore {
  current = $state<Route>("landing");
  params = $state<Record<string, string>>({});

  navigate(route: Route, params: Record<string, string> = {}) {
    this.current = route;
    this.params = params;
  }

  back() {
    const backMap: Partial<Record<Route, Route>> = {
      login: "landing",
      register: "landing",
      room: "lobby",
      results: "lobby",
      settings: "lobby",
      game: "lobby",
    };
    this.current = backMap[this.current] ?? "landing";
  }
}

export const routerStore = new RouterStore();
