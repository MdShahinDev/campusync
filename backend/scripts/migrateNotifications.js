/**
 * One-off, idempotent migration of legacy notification documents to the new
 * Notification schema.
 *
 * Old shape: { userId, senderId, title, message, type: info|success|..., read }
 * New shape: { recipient, sender, type, title, message, relatedEntityType,
 *              relatedEntityId, metadata, isRead, readAt }
 *
 * Nothing is deleted — legacy docs are normalised in place so the new system
 * keeps showing whatever history already exists. Documents that already have
 * a `recipient` are skipped, so the script can be run more than once.
 *
 * Usage: node scripts/migrateNotifications.js
 */
const path = require("path");
const dns = require("dns");

// Some networks resolve the MongoDB SRV records inconsistently through the
// default resolver; fall back to public DNS before mongoose connects.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const LEGACY_TYPE_MAP = {
  info: "SYSTEM_MESSAGE",
  success: "SYSTEM_MESSAGE",
  warning: "SYSTEM_MESSAGE",
  alert: "SYSTEM_MESSAGE",
};

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("connected");

  // Raw driver collection — bypasses mongoose validation on purpose so old
  // documents (which do not match the new schema) can be normalised.
  const collection = mongoose.connection.db.collection("notifications");

  const legacy = await collection
    .find({ recipient: { $exists: false }, userId: { $exists: true } })
    .toArray();
  console.log(`legacy documents found: ${legacy.length}`);

  let migrated = 0;
  for (const doc of legacy) {
    const isRead = Boolean(doc.read);
    const set = {
      recipient: doc.userId,
      sender: doc.senderId || null,
      type: LEGACY_TYPE_MAP[doc.type] || "SYSTEM_MESSAGE",
      isRead,
      readAt: isRead ? doc.updatedAt || doc.createdAt || new Date() : null,
      relatedEntityType: null,
      relatedEntityId: null,
      metadata: {
        legacyType: doc.type || "info",
        migratedAt: new Date(),
      },
    };

    const unset = { userId: "", senderId: "", read: "" };

    await collection.updateOne({ _id: doc._id }, { $set: set, $unset: unset });
    migrated += 1;
  }

  console.log(`migrated: ${migrated}`);

  // Documents created by neither system (orphaned/invalid) are left untouched
  // but reported so they can be reviewed manually.
  const orphans = await collection
    .countDocuments({ recipient: { $exists: false }, userId: { $exists: false } });
  if (orphans > 0) {
    console.warn(
      `warning: ${orphans} document(s) have neither recipient nor userId — left untouched`
    );
  }

  await mongoose.disconnect();
  console.log("done");
}

migrate().catch((error) => {
  console.error("migration failed:", error.message || error);
  process.exit(1);
});
