---
order: 13
slug: minimal-blog
title: "Minimal Blog"
kind: web
year: 2024
summary: "Django blog with drafts, publishing and moderated comments."
description: "A small Django blog: write posts in a rich-text editor, keep them as drafts, publish, and moderate visitors' comments. 90 tests at 99% coverage, run on both SQLite and PostgreSQL."
highlights:
  - "A draft is a post without a publish date; comments stay hidden until approved"
  - "Data-changing actions are POST-only with CSRF tokens; comment text always escaped"
  - "Docker Compose with PostgreSQL 16, or SQLite for local development"
  - "CI: Ruff, missing-migration check, tests on 2 databases, Docker smoke test"
stack: ["Python", "Django", "PostgreSQL", "Bootstrap", "Docker"]
links:
  repos:
    - label: "Source"
      url: "https://github.com/pero-grubac/Minimal-blog"
image: "../../assets/minimal_blog/preview.webp"
imageAlt: "Minimal Blog: a post with edit and delete buttons and two comments, one of them waiting for approval"
featured: false
caseStudy: false
---
