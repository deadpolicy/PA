export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const show = url.searchParams.get("show");
  const season = Number(url.searchParams.get("season"));
  const episode = Number(url.searchParams.get("episode"));

  if (!show || !season || !episode) {
    return Response.json({ error: "Missing show, season, or episode parameters" }, { status: 400 });
  }

  // Fetch the requested episode
  const current = await env.DB.prepare(
    "SELECT * FROM episodes WHERE show_slug = ? AND season_num = ? AND episode_num = ?"
  )
    .bind(show, season, episode)
    .first();

  if (!current) {
    return Response.json({ error: "Episode not found" }, { status: 404 });
  }

  // Fetch all episodes for this show so the page can render episode buttons
  const { results: allEpisodes } = await env.DB.prepare(
    "SELECT season_num, episode_num, episode_title FROM episodes WHERE show_slug = ? ORDER BY season_num ASC, episode_num ASC"
  )
    .bind(show)
    .all();

  return Response.json({ current, episodes: allEpisodes });
}