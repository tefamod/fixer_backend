// syncCarImages.js
require("dotenv").config({ path: "./config.env" });

const mongoose = require("mongoose");
const Car = require("./models/Car");
const User = require("./models/userModel");

const syncAllCarImages = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Connected to database");

    const cars = await Car.find({ image: { $exists: true, $ne: null } });
    console.log(`Found ${cars.length} cars with images`);

    let updated = 0;
    let notFound = 0;
    let errors = [];

    for (const car of cars) {
      try {
        const user = await User.findOne({ name: car.ownerName });
        if (!user) {
          console.log(`❌ User not found for car: ${car._id}`);
          notFound++;
          continue;
        }

        const userCar = user.car.find(
          (c) => c.id?.toString() === car._id.toString(),
        );

        if (userCar) {
          userCar.image = car.image;
          userCar.imagePublicId = car.imagePublicId;
          await user.save({ validateBeforeSave: false });
          console.log(`✅ Updated car ${car._id} for user ${user.name}`);
          updated++;
        } else {
          console.log(`❌ Car ${car._id} not found in user's car array`);
          notFound++;
        }
      } catch (err) {
        console.log(`❌ Error for car ${car._id}: ${err.message}`);
        errors.push({ carId: car._id, error: err.message });
      }
    }

    console.log("\n========== Sync Complete ==========");
    console.log(`✅ Updated:  ${updated}`);
    console.log(`❌ NotFound: ${notFound}`);
    console.log(`⚠️  Errors:   ${errors.length}`);
    if (errors.length > 0) console.log("Errors:", errors);
  } catch (err) {
    console.error("❌ Failed to connect or run script:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  }
};

syncAllCarImages();
