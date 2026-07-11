const mongoose = require("mongoose");
const Notice = require("c:/Users/Ahana/React Project/sahayok24/sahayog24x7/backend/src/models/Notice");

async function checkNotices() {
  await mongoose.connect("mongodb://127.0.0.1:27017/sahayog24x7");
  const notices = await Notice.find({}).lean();
  console.log("Total notices:", notices.length);
  for (const n of notices) {
    console.log(`Title: ${n.title}`);
    console.log(`Audience: "${n.audience}"`);
    console.log(`Status: ${n.status}`);
    console.log(`Start: ${n.startDate}`);
    console.log(`End: ${n.endDate}`);
    console.log(`Is Currently Active: ${new Date(n.startDate) <= new Date() && new Date(n.endDate) >= new Date()}`);
    console.log('---');
  }
  mongoose.disconnect();
}

checkNotices().catch(console.error);
