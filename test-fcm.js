const admin = require("./config/fireBase");
const User = require("./models/userModel");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });
// Test FCM functionality
async function testFCM() {
  try {
    console.log("=== FCM Debug Test ===");

    // Connect to database first
    console.log("Connecting to database...");
    await mongoose.connect(
      process.env.DB_URL || "mongodb://localhost:27017/fixer_db",
    );
    console.log("✅ Database connected");

    // Check Firebase initialization
    const apps = admin.apps;
    console.log("Firebase apps initialized:", apps.length);

    if (apps.length === 0) {
      console.error("❌ Firebase not initialized!");
      return;
    }

    // Get a test user (you can change this ID)
    const testUserId = "6734de56e41091cfb6b02f80"; // Replace with actual user ID
    const user = await User.findById(testUserId);

    if (!user) {
      console.log("❌ User not found. Available users:");
      const allUsers = await User.find({})
        .select("_id name email fcmToken")
        .limit(5);
      allUsers.forEach((u) => {
        console.log(
          `  ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Token: ${u.fcmToken ? "YES" : "NO"}`,
        );
      });
      return;
    }

    console.log("✅ User found:", user.name);
    console.log("FCM Token:", user.fcmToken ? "EXISTS" : "MISSING");

    if (!user.fcmToken) {
      console.log("❌ No FCM token for this user");
      return;
    }

    // Test message
    const testMessage = {
      token: user.fcmToken,
      notification: {
        title: "🧪 Test Notification",
        body: "This is a test message to verify FCM is working",
      },
      data: {
        type: "test_message",
        timestamp: Date.now().toString(),
      },
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    };

    console.log("📤 Sending test message...");
    const response = await admin.messaging().send(testMessage);
    console.log("✅ Message sent successfully! Message ID:", response);
  } catch (error) {
    console.error("❌ FCM Test Failed:");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("Full Error:", error);
  }
}

// Run the test
testFCM()
  .then(() => {
    console.log("=== Test Complete ===");
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    mongoose.connection.close();
    process.exit(1);
  });
