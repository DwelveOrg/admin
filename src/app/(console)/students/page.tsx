import { permanentRedirect } from "next/navigation";

/**
 * `/students` became `/users`.
 *
 * Kept as a redirect rather than deleted, because operators paste console URLs
 * to each other and into tickets, and a link that worked last week answering
 * 404 this week reads as an outage. The role filter lands them on the same set
 * of people the old page showed.
 */
export default function StudentsRedirect() {
  permanentRedirect("/users?role=STUDENT");
}
