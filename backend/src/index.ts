import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { providersRouter } from "./routes/providers";
import { jobRequestsRouter } from "./routes/jobRequests";
import { bookingsRouter } from "./routes/bookings";
import { reviewsRouter } from "./routes/reviews";
import { quotesRouter } from "./routes/quotes";
import { paymentsRouter } from "./routes/payments";
import { messagesRouter } from "./routes/messages";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/providers", providersRouter);
app.use("/job-requests", jobRequestsRouter);
app.use("/bookings", bookingsRouter);
app.use("/reviews", reviewsRouter);
app.use("/quotes", quotesRouter);
app.use("/payments", paymentsRouter);
app.use("/bookings", messagesRouter);

app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
