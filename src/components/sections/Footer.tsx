const FOOTER_LINKS = ["Privacy", "Terms", "Contact"] as const;

export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-4 px-8 py-12 md:flex-row md:px-28">
      <p className="text-sm text-muted-foreground">
        © 2026 Mindloop. All rights reserved.
      </p>
      <ul className="flex items-center gap-6">
        {FOOTER_LINKS.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
