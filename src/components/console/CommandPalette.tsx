"use client";

import {
  ArrowRight,
  LayoutGrid,
  Moon,
  School,
  Search,
  Sun,
  Ticket,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { toggleTheme } from "@/components/ui/ThemeToggle";
import { UUID_PATTERN, identPattern } from "@/lib/case-ident";

/**
 * The command palette.
 *
 * An operator here is not browsing. They arrive holding something — a case
 * ident pasted from a chat window, a school name a colleague said out loud, a
 * UUID from a log line — and the fastest path from that to the right screen
 * should not be "find the right section, then find the right filter". This is
 * that path: type the thing, press enter.
 *
 * It is deliberately not a search index. Everything it does is a route it could
 * already reach; the palette only removes the navigation between knowing what
 * you want and being there. That is why a term it does not recognise still
 * offers the three searches rather than saying "no results" — the console
 * cannot know whether "north" is a school or a person, but it can offer both.
 */

type Command = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
  /** Matched against the query in addition to the label. */
  keywords?: string;
};

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose],
  );

  const commands = useMemo<Command[]>(() => {
    const term = query.trim();
    const found: Command[] = [];

    if (term) {
      // A UUID is a lookup key, but the value alone does not reveal its domain.
      // Offer every valid destination instead of silently treating an account or
      // school id as a report id and sending the operator to a false 404.
      if (UUID_PATTERN.test(term)) {
        found.push(
          {
            id: "open-report-uuid",
            label: `Open report ${term.slice(0, 8)}…`,
            hint: "Report",
            icon: Ticket,
            run: () => go(`/reports/${term}`),
          },
          {
            id: "open-user-uuid",
            label: `Open user ${term.slice(0, 8)}…`,
            hint: "Account",
            icon: Users,
            run: () => go(`/users/${term}`),
          },
          {
            id: "open-school-uuid",
            label: `Open school ${term.slice(0, 8)}…`,
            hint: "School",
            icon: School,
            run: () => go(`/schools/${term}`),
          },
        );
      }

      // An ident is a label rather than a key, so it cannot be resolved to a
      // route on the client. It goes to the docket search, which can.
      if (identPattern.test(term)) {
        found.push({
          id: "find-ident",
          label: `Find case ${term.toUpperCase()}`,
          hint: "Report",
          icon: Ticket,
          run: () => go(`/reports?search=${encodeURIComponent(term)}`),
        });
      }

      found.push(
        {
          id: "search-users",
          label: `Search users for “${term}”`,
          hint: "Directory",
          icon: Users,
          run: () => go(`/users?search=${encodeURIComponent(term)}`),
        },
        {
          id: "search-schools",
          label: `Search schools for “${term}”`,
          hint: "Directory",
          icon: School,
          run: () => go(`/schools?search=${encodeURIComponent(term)}`),
        },
        {
          id: "search-reports",
          label: `Search reports for “${term}”`,
          hint: "Docket",
          icon: Ticket,
          run: () => go(`/reports?search=${encodeURIComponent(term)}`),
        },
      );
    }

    return [
      ...found,
      {
        id: "go-overview",
        label: "Overview",
        hint: "Go to",
        icon: LayoutGrid,
        keywords: "board dashboard home totals charts",
        run: () => go("/"),
      },
      {
        id: "go-users",
        label: "Users",
        hint: "Go to",
        icon: Users,
        keywords: "accounts people students teachers admins directory",
        run: () => go("/users"),
      },
      {
        id: "go-blocked-users",
        label: "Blocked accounts",
        hint: "Users",
        icon: Users,
        keywords: "access suspended restore",
        run: () => go("/users?status=BLOCKED"),
      },
      {
        id: "go-unassigned-users",
        label: "Accounts without a school",
        hint: "Users",
        icon: Users,
        keywords: "no school onboarding membership",
        run: () => go("/users?role=NO_SCHOOL"),
      },
      {
        id: "go-schools",
        label: "Schools",
        hint: "Go to",
        icon: School,
        keywords: "tenants organisations",
        run: () => go("/schools"),
      },
      {
        id: "go-active-schools",
        label: "Active schools",
        hint: "Schools",
        icon: School,
        keywords: "live tenants organisations",
        run: () => go("/schools?status=ACTIVE"),
      },
      {
        id: "go-open",
        label: "Open reports",
        hint: "Go to",
        icon: Ticket,
        keywords: "docket queue waiting triage",
        run: () => go("/reports?status=OPEN"),
      },
      {
        id: "go-review",
        label: "Reports in review",
        hint: "Reports",
        icon: Ticket,
        keywords: "docket queue triage working",
        run: () => go("/reports?status=IN_REVIEW"),
      },
      {
        id: "toggle-theme",
        label: "Switch theme",
        hint: "Console",
        icon: Sun,
        keywords: "dark light night day appearance",
        run: () => {
          toggleTheme();
          onClose();
        },
      },
    ];
  }, [query, go, onClose]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return commands;

    return commands.filter((command) => {
      // Anything built *from* the query already matches it; filtering those
      // against themselves would drop the case-ident row on a term like "R-8F".
      if (!command.id.startsWith("go-") && !command.id.startsWith("toggle-")) return true;
      return `${command.label} ${command.keywords ?? ""}`.toLowerCase().includes(term);
    });
  }, [commands, query]);

  useEffect(() => {
    // The dialog is rendered in the same tick it mounts; focus after paint.
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  // An aria-modal dialog that lets Tab walk into the page behind it is a
  // trap with the sign flipped: keyboard users get lost in inert chrome and
  // the dialog's own Escape handler dies the moment focus leaves. Hold
  // focus inside the sheet, and give it back to whoever opened it.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && dialog.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, []);

  // The page behind a modal must not scroll under it.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)) {
      event.preventDefault();
      setCursor((index) => (index + 1) % Math.max(results.length, 1));
      return;
    }

    if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey)) {
      event.preventDefault();
      setCursor((index) => (index - 1 + results.length) % Math.max(results.length, 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      results[cursor]?.run();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* The field is still visible through this — the room does not go away
          while you are choosing where in it to go. */}
      <div className="absolute inset-0 bg-void-deep/80" aria-hidden />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="surface-raised relative w-full max-w-[560px] overflow-hidden rounded-lg"
      >
        <div className="flex items-center gap-3 border-b border-edge px-4">
          <Search className="size-4 shrink-0 text-t3" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              // The cursor indexes a list that this keystroke is about to
              // rebuild, so it returns to the top here — an effect chasing
              // `query` would leave one render where Enter fires whatever sat
              // at the remembered position.
              setQuery(event.target.value);
              setCursor(0);
            }}
            placeholder="Search, or paste a case ident or UUID"
            aria-label="Search, or paste a case ident or UUID"
            aria-controls={listId}
            aria-activedescendant={results[cursor] ? `${listId}-${results[cursor].id}` : undefined}
            className="h-13 w-full bg-transparent text-15 text-t1 placeholder:text-t3 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded-xs border border-edge px-1.5 py-0.5 text-note text-t3 sm:block">
            Esc
          </kbd>
        </div>

        <ul ref={listRef} id={listId} role="listbox" className="max-h-[46vh] overflow-y-auto p-2">
          {results.map((command, index) => {
            const Icon = command.icon;
            const active = index === cursor;

            return (
              <li key={command.id} role="none">
                <button
                  type="button"
                  role="option"
                  id={`${listId}-${command.id}`}
                  aria-selected={active}
                  data-active={active}
                  onMouseMove={() => setCursor(index)}
                  onClick={command.run}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-left",
                    "transition-colors duration-160",
                    active ? "bg-pen-wash text-t1" : "text-t2 hover:bg-panel-sunk",
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", active ? "text-pen" : "text-t3")} />
                  <span className="min-w-0 flex-1 truncate text-13">{command.label}</span>
                  {command.hint ? (
                    <span className="shrink-0 text-note text-t3">{command.hint}</span>
                  ) : null}
                  <ArrowRight
                    className={cn("size-3.5 shrink-0", active ? "text-pen" : "text-transparent")}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3 border-t border-edge px-4 py-2.5 text-note text-t3">
          <Legend keys="↑↓" action="Move" />
          <Legend keys="↵" action="Open" />
          <Legend keys="Esc" action="Close" />
          <span className="ml-auto inline-flex items-center gap-1.5">
            <Moon className="size-3 dark:hidden" aria-hidden />
            <Sun className="hidden size-3 dark:block" aria-hidden />
            Dwelve Operations
          </span>
        </div>
      </div>
    </div>
  );
}

function Legend({ keys, action }: { keys: string; action: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="rounded-xs border border-edge px-1.5 py-0.5 text-t2">{keys}</kbd>
      {action}
    </span>
  );
}

/**
 * The button that opens it, and the keyboard shortcut that does the same.
 *
 * The shortcut is bound here rather than in the layout so that the trigger and
 * its key live in one place — a shortcut documented on a button that does not
 * open the same thing is worse than no shortcut.
 */
export function CommandTrigger({
  wide = false,
  enableShortcut = true,
}: {
  wide?: boolean;
  enableShortcut?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enableShortcut) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableShortcut]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 cursor-pointer items-center gap-2 rounded-sm border border-edge px-2.5",
          "text-13 text-t3 transition-colors duration-160",
          "hover:border-edge-lit hover:bg-panel-sunk hover:text-t2 focus-visible:outline-offset-1",
          wide && "w-full justify-start bg-panel-sunk text-t2",
        )}
      >
        <Search className="size-3.5 shrink-0" aria-hidden />
        <span className={cn("hidden lg:inline", wide && "block")}>Find anything</span>
        <kbd className={cn("hidden rounded-xs border border-edge bg-panel px-1.5 py-0.5 text-note lg:block", wide && "ml-auto block")}>⌘K</kbd>
      </button>

      {open ? <CommandPalette onClose={() => setOpen(false)} /> : null}
    </>
  );
}
