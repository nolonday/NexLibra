const pool = require("../db");

async function expireReservations() {
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const res = await client.query(
        "UPDATE reservations SET status = 'Просрочено' WHERE status = 'Активно' AND expires_at <= NOW() RETURNING book_id",
      );
      const bookIds = res.rows.map((r) => r.book_id).filter(Boolean);
      if (bookIds.length > 0) {
        await client.query(
          "UPDATE books SET status = 'В наличии' WHERE id = ANY($1::int[])",
          [bookIds],
        );
        console.log(
          `Expired ${bookIds.length} reservations and released books`,
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error expiring reservations:", err);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("DB connection error in expireReservations:", err);
  }
}

const interval = parseInt(process.env.EXPIRE_JOB_INTERVAL_MS || "60000", 10);
setInterval(expireReservations, interval);

module.exports = expireReservations;
