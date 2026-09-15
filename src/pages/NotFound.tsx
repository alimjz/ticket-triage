import { motion } from "framer-motion";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center bg-secondary/35 px-6"
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <LifeBuoy className="size-6" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          That page isn&apos;t part of the desk
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          The link may be outdated. Head back to the homepage or go straight to
          the ticket form.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          >
            Submit a ticket
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
