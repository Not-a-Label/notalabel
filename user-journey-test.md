# 🧪 Complete User Journey Test for Not a Label

## Test Scenario: New Founding Artist Experience

### **Test User Profile**
- Name: Test Artist
- Email: test@example.com
- Genre: Electronic/Indie
- Location: Los Angeles, CA

---

## 📋 **User Journey Checklist**

### **1. Discovery & Invitation** ✓
- [ ] Receive beta invitation email
- [ ] Click invitation link
- [ ] Land on welcome page
- [ ] View founding artist benefits
- [ ] Click "Accept Invitation"

**Test URLs:**
- Invitation: `http://159.89.247.208/join/[INVITE_CODE]`
- Admin create invite: `http://159.89.247.208/admin`

### **2. Account Creation** 
- [ ] Enter artist name
- [ ] Create password
- [ ] Verify email
- [ ] Accept terms of service
- [ ] Complete initial profile setup

**Expected Result:** Account created, redirected to onboarding

### **3. Profile Setup**
- [ ] Upload profile photo
- [ ] Write artist bio (test with 150 words)
- [ ] Select genres (pick 3)
- [ ] Add social media links
- [ ] Set artist URL slug

**Test Data:**
```
Bio: "Test Artist is an innovative electronic producer blending indie sensibilities with cutting-edge sound design. Based in Los Angeles, they create immersive sonic landscapes that challenge genre boundaries."

Genres: Electronic, Indie, Experimental
Instagram: @testartist
Twitter: @testartist
Spotify: testartist
```

### **4. Payment Setup**
- [ ] Click "Set Up Payments"
- [ ] Connect Stripe account
- [ ] Enter business details
- [ ] Verify identity
- [ ] Set payout preferences

**Test Stripe Details:**
- Use Stripe test mode
- Business type: Individual
- Country: United States
- Test bank: 000123456789

### **5. First Music Upload**
- [ ] Click "Upload Music"
- [ ] Upload audio file (MP3)
- [ ] Add track metadata
- [ ] Upload cover art
- [ ] Set price ($1.99)
- [ ] Write track description
- [ ] Publish track

**Test Track Details:**
```
Title: Midnight Dreams
Album: Test EP
Genre: Electronic
Price: $1.99
Description: "A journey through nocturnal soundscapes"
File: Any MP3 under 20MB
Cover: 1400x1400px JPG
```

### **6. Share & Promotion**
- [ ] Get shareable link
- [ ] View on artist page
- [ ] Test social share buttons
- [ ] Copy referral code
- [ ] Send to test email

**Expected URLs:**
- Artist page: `not-a-label.art/artist/testartist`
- Track: `not-a-label.art/track/midnight-dreams`
- Referral: `not-a-label.art/join?ref=testartist-abc123`

### **7. Fan Experience**
- [ ] Visit track page (incognito)
- [ ] Preview track (30 seconds)
- [ ] Click purchase
- [ ] Enter payment details
- [ ] Complete purchase
- [ ] Download track

**Test Payment:**
- Card: 4242 4242 4242 4242
- Expiry: 12/35
- CVV: 123
- ZIP: 90210

### **8. Artist Dashboard**
- [ ] View sales notification
- [ ] Check revenue ($1.99)
- [ ] View fan details
- [ ] Check analytics
- [ ] Test instant payout

**Expected Results:**
- Revenue: $1.99 (100% to artist)
- Platform fee: $0.00
- Payout available: Instant

### **9. Growth Features**
- [ ] Generate referral link
- [ ] View referral dashboard
- [ ] Test collaboration invite
- [ ] Join community forum
- [ ] Set up fan messaging

### **10. Admin Verification**
- [ ] Check admin dashboard
- [ ] Verify user appears
- [ ] Confirm payment processed
- [ ] Review platform metrics
- [ ] Check system health

**Admin URL:** `http://159.89.247.208/admin`

---

## 🐛 **Common Issues to Check**

### **Registration Issues**
- Email already exists
- Weak password
- Invitation expired
- Invalid invitation code

### **Upload Issues**
- File too large (>50MB)
- Unsupported format
- Missing metadata
- Cover art wrong size

### **Payment Issues**
- Stripe not connected
- Identity verification pending
- Bank account invalid
- Test mode vs live mode

### **Display Issues**
- Profile photo not showing
- Track not playing
- Analytics not updating
- Mobile responsiveness

---

## 📊 **Success Metrics**

After completing the journey, verify:

1. **Account Creation**: ✓ User in database
2. **Profile Complete**: ✓ All fields populated  
3. **Stripe Connected**: ✓ Can receive payments
4. **Track Live**: ✓ Accessible via URL
5. **Payment Works**: ✓ Test purchase successful
6. **Revenue Tracked**: ✓ Shows in dashboard
7. **Referral Active**: ✓ Code generates
8. **Analytics Working**: ✓ Data collecting

---

## 🎯 **Performance Benchmarks**

Measure these times:

- Registration → Profile: < 5 minutes
- Profile → First upload: < 10 minutes  
- Upload → Live track: < 30 seconds
- Purchase → Revenue shown: < 1 minute
- Revenue → Payout available: Instant

---

## 📝 **Test Report Template**

```
Date: [DATE]
Tester: [NAME]
Platform: [WEB/MOBILE]
Browser: [CHROME/SAFARI/FIREFOX]

Journey Completion: [X/10] steps
Total Time: [XX] minutes
Issues Found: [#]

Critical Issues:
- [ ] None

Minor Issues:
- [ ] List any

Suggestions:
- [ ] Improvements

Overall Status: [PASS/FAIL]
```

---

## 🚀 **Next Steps After Testing**

1. Fix any critical issues found
2. Optimize slow steps
3. Improve unclear UI elements
4. Test on mobile devices
5. Test with real artists

Remember: This journey is what every founding artist will experience. Make it magical! 🎵