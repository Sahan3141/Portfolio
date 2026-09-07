"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Repo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  topics?: string[];
};

const USERNAME = "Sahan3141";
const GITHUB_PROFILE = `https://github.com/${USERNAME}`;

async function fetchAllRepos(username: string): Promise<Repo[]> {
  const per_page = 100;
  let page = 1;
  const results: Repo[] = [];

  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=${per_page}&page=${page}&sort=updated`,
      { headers: { Accept: "application/vnd.github+json" } },
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;

    // Map to Repo shape (topics may be missing)
    for (const r of data) {
      results.push({
        id: r.id,
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        clone_url: r.clone_url,
        language: r.language,
        stargazers_count: r.stargazers_count ?? 0,
        forks_count: r.forks_count ?? 0,
        updated_at: r.updated_at,
        created_at: r.created_at,
        topics: r.topics ?? [],
      });
    }

    if (data.length < per_page) break;
    page += 1;
  }

  return results;
}

export default function GitHubProjects() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("All");
  const [sortBy, setSortBy] = useState("updated");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // client-side short cache (5 minutes)
  const CACHE_KEY = `gh_repos_${USERNAME}`;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const age = Date.now() - parsed.ts;
          if (age < 1000 * 60 * 5) {
            setRepos(parsed.data);
            setLoading(false);
            return;
          }
        }

        const data = await fetchAllRepos(USERNAME);
        if (cancelled) return;
        setRepos(data);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      } catch (err: any) {
        setError(err.message || "Failed to load repositories");
        setRepos(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const languages = useMemo(() => {
    if (!repos) return [] as string[];
    const set = new Set<string>();
    repos.forEach((r) => set.add(r.language ?? "Unknown"));
    return ["All", ...Array.from(set).filter(Boolean).sort()];
  }, [repos]);

  const filtered = useMemo(() => {
    if (!repos) return [] as Repo[];
    const q = query.trim().toLowerCase();
    let out = repos.filter((r) => {
      if (language !== "All" && (r.language ?? "Unknown") !== language) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q)
      );
    });

    switch (sortBy) {
      case "updated":
        out = out.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
        break;
      case "created":
        out = out.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        break;
      case "stars":
        out = out.sort((a, b) => b.stargazers_count - a.stargazers_count);
        break;
      case "name":
        out = out.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return out;
  }, [repos, query, language, sortBy]);

  const handleCopy = async (repo: Repo) => {
    try {
      await navigator.clipboard.writeText(`git clone ${repo.clone_url}`);
      setCopiedId(repo.id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch (e) {
      // ignore
    }
  };

  const retry = () => {
    sessionStorage.removeItem(CACHE_KEY);
    setRepos(null);
    setLoading(true);
    setError(null);
    // trigger effect by re-calling fetch via setting repos to null and letting effect run? Simpler: reload page data
    fetchAllRepos(USERNAME)
      .then((data) => {
        setRepos(data);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
        setError(null);
      })
      .catch((err) => setError(err.message || "Failed to load repositories"))
      .finally(() => setLoading(false));
  };

  return (
    <section id="lab" className="w-full bg-[#f7f5f2] px-6 py-20 md:px-16 md:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">Things I&apos;ve built.</h2>
        <p className="text-sm text-black/70 mb-8">A live collection of experiments, projects and things I&apos;ve shipped — pulled directly from my GitHub.</p>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <input
              aria-label="Search repositories"
              placeholder="Search repos by name or description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-white/95 text-sm px-3 py-2 border border-black/10 focus:outline-none"
            />

            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="text-sm px-3 py-2 bg-white/95 border border-black/10">
              {languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-black/70">Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm px-3 py-2 bg-white/95 border border-black/10">
              <option value="updated">Recently updated</option>
              <option value="created">Recently created</option>
              <option value="stars">Stars</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse h-40 bg-white/60" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white/5 p-6 text-sm">
            <p>Couldn&apos;t load the projects right now.</p>
            <div className="mt-3 flex items-center gap-3">
              <button onClick={retry} className="px-3 py-2 bg-white text-black">Retry</button>
              <a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer" className="text-sm underline">View profile on GitHub</a>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm">No projects match your search or filter.</div>
        ) : (
          <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((repo) => (
              <article
                key={repo.id}
                className="relative bg-white p-5 border border-black/5 hover:shadow-lg transition-transform transform hover:-translate-y-2"
                onMouseMove={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  const rect = el.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  el.style.setProperty("--mx", `${x}%`);
                  el.style.setProperty("--my", `${y}%`);
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.setProperty("--mx", `50%`);
                  el.style.setProperty("--my", `50%`);
                }}
                style={{
                  backgroundImage: "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(0,0,0,0.02), transparent 20%)",
                }}
              >
                <header className="mb-3">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold underline-offset-2 hover:underline">
                    {repo.name}
                  </a>
                  <p className="text-sm text-black/60 mt-1">{repo.description ?? "—"}</p>
                </header>

                <div className="flex items-center justify-between mt-4 text-sm text-black/70">
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-1 border border-black/5 text-xs">{repo.language ?? "Unknown"}</span>
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>

                  <div className="text-xs">Updated {new Date(repo.updated_at).toLocaleDateString()}</div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleCopy(repo)}
                    className="px-3 py-2 text-sm bg-black text-white"
                  >
                    {copiedId === repo.id ? (
                      <span>Copied ✓</span>
                    ) : (
                      <span>Copy clone</span>
                    )}
                  </button>

                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-sm border border-black/10">
                    Open GitHub
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 text-sm">
          <a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer" className="underline">View all on GitHub →</a>
        </div>
      </div>
    </section>
  );
}
