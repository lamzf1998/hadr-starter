# HADR Monitor

A monitoring agent for humanitarian assistance and disaster response (HADR).

## What HADR is

**Humanitarian Assistance and Disaster Response** is the work of getting help to
people after a disaster — earthquakes, cyclones, floods, volcanoes, drought,
wildfires — and the coordination that surrounds it. The people doing that work
face the same problem every morning: dozens of disaster alerts fire overnight,
most are noise (a magnitude-3 tremor no one felt, a duplicate of yesterday's
quake arriving from a second agency), and the few that matter are buried among
them.

This agent exists to answer one question before anyone has had their coffee:
**what happened overnight that a human needs to know about, and how bad is it?**
It watches the live feeds, discards the noise, assesses what remains — what
happened, where, how bad, who is affected — and publishes a single situation
report each morning. When nothing has changed, it stays quiet.

## The feeds

Three public feeds, each with a different temperament (details and endpoints in
`feeds/`):

- **GDACS** — the EU/UN Global Disaster Alert and Coordination System.
  Multi-hazard and fast, with a colour-coded alert level (green/orange/red) on
  every event. Broad but noisy.
- **USGS** — the US Geological Survey earthquake feed. Earthquakes only,
  regenerated every minute, authoritative on magnitude and location — but events
  get revised, and occasionally deleted, after they are first published.
- **ReliefWeb** — UN OCHA's curated humanitarian service. Slower and
  human-vetted: a disaster appears here only once people decide it matters. The
  signal is high; the latency is measured in days.

The hard part is not reading any one feed — it is that the same physical
earthquake can arrive from all three under three different identifiers, at three
different times, with three different descriptions. Deciding when two records are
the same event is where most of the judgement lives.

## The end state

By Wednesday afternoon this repository contains an agent that:

- watches live disaster feeds — GDACS, USGS and ReliefWeb (see `feeds/`)
- filters out the noise and assesses what remains: what happened, where, how bad, who is affected
- publishes a morning situation report to `dashboard.html` at 08:30 Singapore time
- runs on a schedule, unattended, and stays quiet when nothing has changed

How it does any of that is not specified anywhere in this repository. That is the course.

## The three days

1. **Plan** — interrogate the feeds, write the PRD, cut it into vertical slices
2. **Autonomy** — build the first slice, write a skill, wire up the 08:30 routine, launch the overnight loop
3. **Trust** — review code you didn't write, harden the pipeline, demo

## Artefacts expected by the end

`prd.html` · `system-view.html` · `implementation-notes.md` · `dashboard.html` · `goal.md` · at least one skill

## Day 1 setup

1. Sign in to Claude Code with your Team seat
2. Create your own repository from this template, then clone it
3. Run `/install-github-app` so @claude reviews your pull requests from Day 2
4. Install OpenCode and sign in with your Go key

Fill in `CLAUDE.md` before your first prompt.
