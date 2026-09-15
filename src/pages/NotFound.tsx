import { motion } from "framer-motion";
import { ArrowLeft, SquareStack } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col items-center justify-center px-6"
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-card text-primary">
          <SquareStack className="size-6" />
        </span>
        <p className="mono-label mt-6">Error 404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Nothing lives at this address
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          The link may be old, or the ticket it pointed at has been deleted.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Browse the catalog
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
