# BVRIT Weekly Report System - User Guide

## 🎓 Who Is This Application Built For?

This application is built for **BVRIT HYDERABAD College of Engineering for Women** to streamline their weekly departmental reporting process. It serves three types of users:

### 1. **Faculty Members** 👨‍🏫
- Add their achievements, events, activities to weekly reports
- Upload supporting documents (certificates, photos, etc.)
- Edit their own submissions
- View report progress
- **Limited to their own department**

### 2. **Department Coordinators** 👔
- Do everything faculty can do
- **Verify/Approve/Reject** entries submitted by faculty
- Create new weekly reports for their department
- Export weekly reports as PDF
- Manage their department's entire workflow
- **Limited to their own department**

### 3. **System Administrators** 🔧
- Access all departments (cross-department view)
- Manage user roles and permissions
- Verify entries across all departments
- Export reports for any department
- Oversee the entire institutional reporting system

---

## 📋 Complete Workflow Process

### **Weekly Report Cycle:**

```
Week Start → Create Report → Faculty Submit Entries → Verification → Export PDF → Submit to Management
```

#### **Step-by-Step Process:**

1. **Week Begins** (Monday)
   - Coordinator creates a new weekly report
   - Selects date range (e.g., March 23 - March 29)
   - Report appears on all faculty dashboards

2. **Faculty Submit Entries** (Monday-Friday)
   - Faculty log in and see the active week
   - Navigate to sections (17 predefined sections):
     - General Points
     - Faculty Achievements
     - Student Activities
     - Events Organized
     - Placements
     - Publications
     - etc.
   - Click "Add Entry" to submit:
     - Fill section-specific fields
     - Upload documents (certificates, photos, invitations)
     - Submit (status becomes "Pending")

3. **Coordinator Reviews** (End of Week)
   - Coordinator sees all entries with "Pending" status
   - Reviews each entry's:
     - Data accuracy
     - Supporting documents
     - Relevance
   - Action options:
     - **Approve** ✓ (Green badge)
     - **Reject** ✕ (Red badge with reason)
   
4. **Faculty Revisions** (If Rejected)
   - Faculty see rejection comments
   - Edit and resubmit entry
   - Status resets to "Pending"

5. **Final Export** (Friday/Saturday)
   - Once all entries approved
   - Coordinator clicks "Export Report"
   - System generates BVRIT-formatted PDF with:
     - College header/logo
     - All 17 sections
     - Approved entries only
     - Verification status
     - Document attachments listed
   
6. **Submit to Management**
   - Coordinator downloads PDF
   - Submits to Principal/HOD

---

## 🧪 How to Test the Application

### **Test Accounts Available:**

| Role | Email | Password | Department | Access Level |
|------|-------|----------|------------|--------------|
| Faculty | `faculty@college.edu` | `password123` | ECE | ECE Dept Only |
| Coordinator | `coordinator@college.edu` | `password123` | CSE | CSE Dept Only |
| Admin | `admin@college.edu` | `password123` | CSE | All Departments |

---

### **Test Scenario 1: Faculty Workflow**

1. **Login as Faculty**
   ```
   Email: faculty@college.edu
   Password: password123
   ```

2. **Dashboard View**
   - See current week (if exists) or "No active week"
   - View ECE department data only
   - See section completion status

3. **Add an Entry**
   - Click a section (e.g., "Faculty Achievements")
   - Click "Add Entry" button
   - Fill form fields (name, achievement, date, etc.)
   - Click 📎 "Attach Documents" button
   - Upload files (PDF, images, docs - max 10MB)
   - Click "Add Entry" to submit
   - Entry appears with **yellow "Pending"** badge

4. **View Your Entries**
   - See your name as contributor
   - View uploaded documents (click to open)
   - Status shows "Pending" (awaiting coordinator approval)

5. **Edit Entry** (if needed)
   - Click "Edit" button
   - Modify data or add more documents
   - Save changes
   - Status resets to "Pending"

---

### **Test Scenario 2: Coordinator Workflow**

1. **Login as Coordinator**
   ```
   Email: coordinator@college.edu
   Password: password123
   ```

2. **Create Weekly Report**
   - Dashboard shows "Create New Week" button
   - Click it
   - Select date range (Start Date → End Date)
   - Click "Create Report"
   - Report appears on all CSE faculty dashboards

3. **Add Entries** (like faculty)
   - Navigate to any section
   - Add your own entries with documents

4. **Verify Faculty Entries**
   - Open any section with pending entries
   - See entries with yellow "Pending" badges
   - Review the data and documents
   - **To Approve:**
     - Click "✓ Approve" button
     - Status changes to green "Approved"
   - **To Reject:**
     - Click "✕ Reject" button
     - Enter rejection reason
     - Status changes to red "Rejected"
     - Faculty sees rejection comment

5. **Export Report**
   - Dashboard → Click "Export Report" button
   - PDF downloads automatically
   - Open PDF to verify:
     - BVRIT header formatting
     - All 17 sections listed
     - Entries shown in tables
     - Status column (Approved/Pending/Rejected in colors)
     - Documents listed below each entry

---

### **Test Scenario 3: Admin Workflow**

1. **Login as Admin**
   ```
   Email: admin@college.edu
   Password: password123
   ```

2. **Cross-Department Access**
   - Dashboard dropdown shows ALL departments
   - Switch between CSE, ECE, EEE, etc.
   - View any department's reports

3. **Manage Users**
   - Navigate to "Admin" section (if visible)
   - View all registered users
   - Change user roles:
     - Promote faculty → coordinator
     - Assign admin privileges
     - Change departments

4. **Verify Any Entry**
   - Access any department's sections
   - Approve/reject entries across all departments
   - Verifier name recorded in entry

---

### **Test Scenario 4: Document Upload & Verification**

1. **Upload Multiple Documents**
   - Login as faculty
   - Add entry
   - Click "Attach Documents"
   - Upload:
     - Certificate (PDF)
     - Event photo (JPG)
     - Invitation (DOC)
   - See file list with names and sizes
   - Remove any file if needed

2. **Verify Documents are Stored**
   - Submit entry
   - Go to Firebase Console → Storage
   - Navigate to: `entry-documents/{reportId}/{entryId}/`
   - See uploaded files

3. **Test File Restrictions**
   - Try uploading >10MB file (should fail)
   - Try uploading .exe file (should fail)
   - Only PDF, DOC, DOCX, Images allowed

4. **Verify in PDF Export**
   - After coordinator exports report
   - Open PDF
   - Find entry with documents
   - See blue text: "Documents: certificate.pdf, photo.jpg, invitation.doc"

---

## 🔐 Security Testing

### **Test Department Isolation:**

1. Login as Faculty (ECE dept)
2. Try to view CSE department reports
3. ✓ **Should NOT see CSE data** (only ECE)

### **Test Role Permissions:**

1. Login as Faculty
2. Try to approve/reject entries
3. ✓ **Approve/Reject buttons should NOT appear**

4. Login as Coordinator
5. See Approve/Reject buttons for pending entries
6. ✓ **Can verify entries**

### **Test Storage Security:**

1. Upload document as Faculty
2. Note the Firebase Storage URL
3. Logout
4. Try accessing URL directly
5. ✓ **Should require authentication**

---

## 📊 Expected System Behavior

### **Section Status Colors:**
- 🔴 **Red Badge** = No entries yet
- 🟡 **Yellow Badge** = Has entries, none approved yet
- 🟢 **Green Badge** = All entries approved

### **Entry Verification States:**
- ⏳ **Pending** (Yellow) = Awaiting coordinator review
- ✓ **Approved** (Green) = Verified by coordinator
- ✕ **Rejected** (Red) = Needs revision with comments

### **Dashboard Metrics:**
- Total sections: 17
- Completed sections: Count with approved entries
- Progress percentage: (Completed/17) × 100

---

## 🐛 Common Issues & Solutions

### **Issue: Can't upload documents**
- **Check:** Is Firebase Storage enabled?
- **Solution:** Visit Firebase Console → Storage → Enable

### **Issue: "No active week" message**
- **Cause:** No report created yet
- **Solution:** Coordinator must create weekly report first

### **Issue: Can't see other departments**
- **Cause:** You're faculty/coordinator (limited to your dept)
- **Solution:** Only admins see all departments

### **Issue: Approve button missing**
- **Cause:** You're logged in as faculty
- **Solution:** Only coordinators/admins can verify entries

---

## 🎯 Key Features Implemented

✅ **17 BVRIT Sections** - All official sections as per template  
✅ **Dynamic Forms** - Each section has unique fields  
✅ **Document Upload** - Firebase Storage with 10MB limit  
✅ **Entry Verification** - 3-state approval workflow  
✅ **Role-Based Security** - Faculty/Coordinator/Admin roles  
✅ **Department Isolation** - Users see only their department  
✅ **PDF Export** - BVRIT-formatted reports with verification status  
✅ **Real-time Updates** - Firestore listeners for live collaboration  
✅ **Responsive UI** - Works on desktop/tablet/mobile  
✅ **Production Ready** - All builds successful, Firebase deployed  

---

## 📞 For Institution Setup

To deploy this for your institution:

1. **Firebase Project Setup**
   - Create Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Firebase Storage
   - Deploy security rules

2. **User Creation**
   - Register faculty accounts
   - Assign roles via admin panel
   - Set departments

3. **Configuration**
   - Update `.env` files with Firebase credentials
   - Deploy frontend and backend
   - Test with sample data

4. **Training**
   - Train coordinators on report creation
   - Train faculty on entry submission
   - Train coordinators on verification workflow

---

## 🚀 Next Steps for Your Institution

1. **Import Faculty List** - Bulk create user accounts
2. **Customize Sections** - Modify the 17 sections if needed
3. **Add Department Logo** - Update PDF header
4. **Set Notification Rules** - Email alerts for pending verifications
5. **Analytics Dashboard** - Track submission rates by department

---

**Built for BVRIT HYDERABAD College of Engineering for Women**  
_Streamlining institutional reporting with collaborative technology_
