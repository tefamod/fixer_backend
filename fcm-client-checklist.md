# FCM Client-Side Troubleshooting Checklist

## ✅ Server Status: WORKING
Your server is successfully sending notifications to Firebase with valid message IDs.

## 🔍 Client-Side Issues to Check

### 1. App Permissions
- [ ] Check if app has notification permissions enabled
- [ ] Verify background app refresh is enabled (iOS)
- [ ] Ensure battery optimization doesn't kill your app (Android)

### 2. Firebase Configuration in App
- [ ] Verify `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) matches your Firebase project
- [ ] Check that the bundle/package ID matches Firebase console
- [ ] Ensure FCM token is being sent to your backend when app starts

### 3. App State
- [ ] Test with app in foreground
- [ ] Test with app in background  
- [ ] Test with app completely closed
- [ ] Test on different devices (Android/iOS)

### 4. Token Validation
- [ ] Check if the FCM token in your database is recent
- [ ] Tokens expire after ~1 month if app not opened
- [ ] User reinstalling app generates new token

### 5. Firebase Console Check
1. Go to Firebase Console → Cloud Messaging
2. Send a test notification directly from console
3. If console notifications work, app config is correct
4. If console notifications don't work, app config needs fixing

### 6. Platform-Specific Issues

#### Android:
- [ ] Check if Google Play Services is available
- [ ] Verify app has `FOREGROUND_SERVICE` permission
- [ ] Test on different Android versions

#### iOS:
- [ ] Check APNs certificate is valid
- [ ] Verify push notification entitlements
- [ ] Test on real device (not simulator)

## 🧪 Quick Test Steps

1. **Send from Firebase Console First**
   - If this works → App config is correct
   - If this doesn't work → Fix app config

2. **Check Token Freshness**
   ```javascript
   // In your app, log the current token
   console.log('FCM Token:', await messaging().getToken());
   ```

3. **Verify Server Logs Show Success**
   - Your logs show: `[FCM] Successfully sent notification`
   - This means Firebase accepted the message
   - Issue is between Firebase and device

## 📱 Debug Steps

1. **Open Firebase Console**
   - Go to your project
   - Cloud Messaging → Send your first message
   - Send test notification to the FCM token from your database

2. **Check App Logs**
   - Look for FCM token registration logs
   - Check for notification receipt logs
   - Verify no errors in app console

3. **Network Issues**
   - Device must have internet connection
   - Check if device is behind VPN/firewall
   - Verify no ad-blockers blocking FCM

## 🆘 If Still Not Working

1. **Get a fresh FCM token** from the app
2. **Update the token in your database**
3. **Test with the new token**
4. **Try a different device/account**

The server-side code is working correctly - the issue is definitely on the client/app side.
