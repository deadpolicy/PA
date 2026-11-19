export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle the D1 episode API route
    if (url.pathname === "/api/episode") {
      const show = url.searchParams.get("show");
      const season = Number(url.searchParams.get("season"));
      const episode = Number(url.searchParams.get("episode"));

      if (!show || !season || !episode) {
        return Response.json({ error: "Missing show, season, or episode parameters" }, { status: 400 });
      }

      const current = await env.DB.prepare(
        "SELECT * FROM episodes WHERE show_slug = ? AND season_num = ? AND episode_num = ?"
      )
        .bind(show, season, episode)
        .first();

      if (!current) {
        return Response.json({ error: "Episode not found" }, { status: 404 });
      }

      const { results: allEpisodes } = await env.DB.prepare(
        "SELECT season_num, episode_num, episode_title FROM episodes WHERE show_slug = ? ORDER BY season_num ASC, episode_num ASC"
      )
        .bind(show)
        .all();

      return Response.json({ current, episodes: allEpisodes });
    }

    // Serve Resume.html, watch.html, style.css, etc. for all other requests
    return env.ASSETS.fetch(request);
  },
};