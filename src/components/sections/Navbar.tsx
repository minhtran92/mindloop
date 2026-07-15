import { motion } from "framer-motion";
import { Logo } from "@/components/icons/Logo";
import {
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "@/components/icons/Social";
import { fadeUpMount } from "@/lib/animations";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Use Cases", href: "#use-cases" },
] as const;

const SOCIALS = [
  { Icon: InstagramIcon, label: "Instagram" },
  { Icon: LinkedinIcon, label: "LinkedIn" },
  { Icon: TwitterIcon, label: "Twitter" },
] as const;

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-8 md:px-28 py-4"
    >
      <nav aria-label="Main" className="flex items-center justify-between">
        {/* Left: logo + brand */}
        <motion.a
          href="#home"
          {...fadeUpMount(0.1)}
          className="flex items-center gap-2 text-foreground"
        >
          <Logo size={28} />
          <span className="text-base font-bold tracking-tight">Mindloop</span>
        </motion.a>

        {/* Center-left: nav links */}
        <motion.ul
          {...fadeUpMount(0.2)}
          className="hidden md:flex items-center gap-3 text-sm"
        >
          {NAV_LINKS.map((link, i) => (
            <li key={link.href} className="flex items-center gap-3">
              <a
                href={link.href}
                className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </a>
              {i < NAV_LINKS.length - 1 && (
                <span className="text-muted-foreground/40">•</span>
              )}
            </li>
          ))}
        </motion.ul>

        {/* Right: social icons */}
        <motion.ul {...fadeUpMount(0.3)} className="flex items-center gap-2">
          {SOCIALS.map(({ Icon, label }) => (
            <li key={label}>
              <a
                href="#"
                aria-label={label}
                className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            </li>
          ))}
        </motion.ul>
      </nav>
    </motion.header>
  );
}
