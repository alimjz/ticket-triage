import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "@/convex/_generated/api";
import schema from "@/convex/schema";

const generated = import.meta.glob("../convex/**/*.*s");

/** convex-test looks modules up by their path inside the convex folder. */
const modules = Object.fromEntries(
  Object.entries(generated).map(([path, load]) => [
    path.replace("../convex/", "./"),
    load,
  ]),
);

/** Two teammates, ready to assign work to each other. */
async function workspace() {
  const t = convexTest(schema, modules);
  const maya = await t.run((ctx) =>
    ctx.db.insert("users", { name: "Maya Okafor", email: "maya@example.com" }),
  );
  const devon = await t.run((ctx) =>
    ctx.db.insert("users", { name: "Devon Reyes", email: "devon@example.com" }),
  );
  return { t, maya, devon };
}

const DRAFT = {
  subject: "Rotate the staging API keys",
  body: "The staging keys live in three places and one is in a shared note.",
};

describe("ticket owners", () => {
  test("a new ticket starts unowned", async () => {
    const { t, maya } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });

    await asMaya.mutation(api.tickets.createTicket, DRAFT);

    const [ticket] = await asMaya.query(api.tickets.listTickets, {});
    expect(ticket.assigneeId).toBeUndefined();
    expect(ticket.assigneeName).toBeUndefined();
  });

  test("assigning a ticket reports the owner in the catalog", async () => {
    const { t, maya, devon } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });
    const { ticketId } = await asMaya.mutation(api.tickets.createTicket, DRAFT);

    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId,
      assigneeId: devon,
    });

    const [ticket] = await asMaya.query(api.tickets.listTickets, {});
    expect(ticket.assigneeId).toBe(devon);
    expect(ticket.assigneeName).toBe("Devon Reyes");
  });

  test("null clears the owner while other updates leave it alone", async () => {
    const { t, maya, devon } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });
    const { ticketId } = await asMaya.mutation(api.tickets.createTicket, DRAFT);

    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId,
      assigneeId: devon,
    });
    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId,
      priority: "high",
    });

    let [ticket] = await asMaya.query(api.tickets.listTickets, {});
    expect(ticket.assigneeId).toBe(devon);
    expect(ticket.priority).toBe("high");

    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId,
      assigneeId: null,
    });

    [ticket] = await asMaya.query(api.tickets.listTickets, {});
    expect(ticket.assigneeId).toBeUndefined();
    expect(ticket.assigneeName).toBeUndefined();
  });

  test("a ticket can be logged with an owner already attached", async () => {
    const { t, maya, devon } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });

    const { ticketId } = await asMaya.mutation(api.tickets.createTicket, {
      ...DRAFT,
      assigneeId: devon,
    });

    const data = await asMaya.query(api.tickets.getTicket, { ticketId });
    expect(data?.ticket.assigneeId).toBe(devon);
  });

  test("the catalog filters by owner", async () => {
    const { t, maya } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });

    const unowned = await asMaya.mutation(api.tickets.createTicket, DRAFT);
    const claimed = await asMaya.mutation(api.tickets.createTicket, {
      ...DRAFT,
      subject: "Deploy runbook is out of date",
    });
    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId: claimed.ticketId,
      assigneeId: maya,
    });

    const unassigned = await asMaya.query(api.tickets.listTickets, {
      assignee: "unassigned",
    });
    expect(unassigned.map((ticket) => ticket.reference)).toEqual([
      unowned.reference,
    ]);

    const mine = await asMaya.query(api.tickets.listTickets, {
      assignee: "me",
    });
    expect(mine.map((ticket) => ticket.reference)).toEqual([
      claimed.reference,
    ]);

    const everyone = await asMaya.query(api.tickets.listTickets, {
      assignee: "any",
    });
    expect(everyone).toHaveLength(2);
  });

  test("search matches the owner's name", async () => {
    const { t, maya, devon } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });
    const { ticketId } = await asMaya.mutation(api.tickets.createTicket, DRAFT);
    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId,
      assigneeId: devon,
    });

    const found = await asMaya.query(api.tickets.listTickets, {
      search: "devon",
    });
    expect(found).toHaveLength(1);

    const missing = await asMaya.query(api.tickets.listTickets, {
      search: "nobody",
    });
    expect(missing).toHaveLength(0);
  });

  test("the dashboard separates assignments from tickets you logged", async () => {
    const { t, maya, devon } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });
    const asDevon = t.withIdentity({ subject: devon });

    const owned = await asMaya.mutation(api.tickets.createTicket, DRAFT);
    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId: owned.ticketId,
      assigneeId: maya,
    });
    await asDevon.mutation(api.tickets.createTicket, {
      ...DRAFT,
      subject: "Import fails on files larger than 5 MB",
    });

    const dashboard = await asMaya.query(api.tickets.myDashboard, {});
    expect(dashboard.total).toBe(1);
    expect(dashboard.open).toBe(1);
    expect(dashboard.assignedCount).toBe(1);
    expect(dashboard.assigned[0].assigneeName).toBe("Maya Okafor");

    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId: owned.ticketId,
      status: "resolved",
    });

    const after = await asMaya.query(api.tickets.myDashboard, {});
    expect(after.assignedCount).toBe(0);
    expect(after.open).toBe(0);
    expect(after.done).toBe(1);
  });

  test("team stats count unresolved tickets with no owner", async () => {
    const { t, maya, devon } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });

    const first = await asMaya.mutation(api.tickets.createTicket, DRAFT);
    const second = await asMaya.mutation(api.tickets.createTicket, {
      ...DRAFT,
      subject: "Deploy runbook is out of date",
    });

    expect((await asMaya.query(api.tickets.stats, {})).unassigned).toBe(2);

    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId: first.ticketId,
      status: "resolved",
    });
    expect((await asMaya.query(api.tickets.stats, {})).unassigned).toBe(1);

    await asMaya.mutation(api.tickets.updateTicket, {
      ticketId: second.ticketId,
      assigneeId: devon,
    });
    expect((await asMaya.query(api.tickets.stats, {})).unassigned).toBe(0);
  });

  test("assigning a teammate who no longer exists is refused", async () => {
    const { t, maya } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });
    const { ticketId } = await asMaya.mutation(api.tickets.createTicket, DRAFT);

    const ghost = await t.run((ctx) =>
      ctx.db.insert("users", { name: "Ghost Account" }),
    );
    await t.run((ctx) => ctx.db.delete(ghost));

    await expect(
      asMaya.mutation(api.tickets.updateTicket, {
        ticketId,
        assigneeId: ghost,
      }),
    ).rejects.toThrow(/no longer exists/);
  });

  test("the owner picker lists teammates by name", async () => {
    const { t, maya } = await workspace();
    const asMaya = t.withIdentity({ subject: maya });

    const members = await asMaya.query(api.tickets.teamMembers, {});
    expect(members.map((member) => member.name)).toEqual([
      "Devon Reyes",
      "Maya Okafor",
    ]);
  });

  test("the catalog stays behind sign-in", async () => {
    const { t } = await workspace();

    await expect(t.query(api.tickets.listTickets, {})).rejects.toThrow(
      /sign in/i,
    );
    await expect(t.mutation(api.tickets.createTicket, DRAFT)).rejects.toThrow(
      /sign in/i,
    );
  });
});
