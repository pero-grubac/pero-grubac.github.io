// Facts about the owner that several pages show. The email and the two
// profile links must stay exactly as they are.
export const site = {
  name: "Pero Grubač",
  jobTitle: "Backend Developer",
  email: "pero.grubac00@gmail.com",
  github: "https://github.com/pero-grubac",
  linkedin: "https://www.linkedin.com/in/perogrubac/",
  basedIn: "Banja Luka, Bosnia and Herzegovina",
  /** For structured data: the city, and the ISO 3166 country code */
  locality: "Banja Luka",
  country: "BA",
  freelanceLine: "Open to freelance projects, collaborations and interesting opportunities.",
  /** The main stack, as About lists it; also the Person's knowsAbout */
  stack: {
    Languages: ["Java", "C#", "Python", "JavaScript", "TypeScript", "Dart"],
    Frameworks: ["Spring Boot", "ASP.NET", "FastAPI", "Flutter", "React", "Angular", "Django", "WPF", "SvelteKit", "Godot"],
    Infrastructure: ["Docker", "RabbitMQ", "PostgreSQL", "MySQL", "Redis", "Nginx", "OpenSSL", "Testcontainers"],
    Tools: ["Canvas", "PWA", "Vite", "Playwright"],
  },
} as const;
