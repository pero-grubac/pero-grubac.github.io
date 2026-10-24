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
caseStudy: true
---

## What it does

The blog has two kinds of users. Visitors don't sign in: they read the published posts, listed newest first on the home page, see the approved comments and leave their own, with a name and a text. An author signs in with a username and password and can also write, edit, publish and delete posts, see the drafts, and approve or remove comments.

Posts are written in the Medium Editor, a rich-text editor whose toolbar appears when text is selected, with bold, italic, headings, links and quotes. Saving a new post keeps it as a draft, and one click publishes it. A new comment stays hidden from visitors until it is approved: a signed-in author sees it on the post with buttons to approve or remove it, and once approved it is visible to everyone and counted on the home page. Posts, comments and users can also be managed in the Django admin.

## Decisions and why

- **A draft is a post without a publish date.** There is no separate status field, and the home page only shows posts whose date is in the past.
- **Comments are open, moderation is not.** Anyone can comment, but only signed-in users see unapproved comments and can approve or remove them.
- **One settings file, configured by the environment.** The same code runs on SQLite locally and on PostgreSQL 16 in Docker and CI.

## Security

- **Changes only through POST.** Publishing, approving and removing are forms with a CSRF token, so a link or a crawler can't trigger them.
- **Untrusted text is never rendered as HTML.** Posts, written by signed-in authors, keep the editor's formatting; comments from visitors are always escaped.
- **The author of a post is always the signed-in user.** The post form has no author field.
- **Drafts are private.** Only signed-in users can see them.

## Testing and deployment

90 tests, at 99% coverage, cover the models, the forms, the post and comment views and the other pages, including the sign-in rules, draft privacy, HTML escaping in comments and POST-only actions.

GitHub Actions runs on every push to main and every pull request. It lints with Ruff, runs Django's system checks and fails if a model change is missing a migration. Then it runs the whole suite on SQLite and on PostgreSQL, with coverage that must stay at 90% or more. Last, it builds the Docker image, starts the app and PostgreSQL with Docker Compose, and checks that the home page answers. In Docker the app applies its migrations when it starts.

[//]: # "TODO(owner): What I learned. A short closing section in your own words, under a '## What I learned' heading."
