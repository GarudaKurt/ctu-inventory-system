## 🛠 How to Set Up the Project (Windows)

### 1️⃣ Install Node.js  
Download and install Node.js from:  
https://nodejs.org/en/download  

> After installing, restart your PC or Command Prompt if needed.

### 1️⃣ Install Node.js  
Download and install Node.js from:  
https://nodejs.org/en/download 

---

### 2️⃣ Download the Project from GitHub  
1. Open the repository on GitHub  
2. Click **Code** → **Download ZIP**  
3. Extract the downloaded ZIP file  

---
---
### .env.local setup
# .env.local

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

EMAIL_USER=
EMAIL_PASS=
---

### 3️⃣ Move the Project Folder  
Move the extracted folder to your **Desktop**  
Example folder name:
```
ctu-inventory-system-main
```

---

### 4️⃣ Open Command Prompt  
1. Press **Windows Key**  
2. Search for **cmd**  
3. Open **Command Prompt**

---

### 5️⃣ Navigate to the Project Folder  
Run these commands in CMD:

```bash
cd Desktop
cd ctu-inventory-system-main
```

You should now be inside:
```
Desktop\ctu-inventory-system-main
```

---

### 6️⃣ Install Dependencies  
Run:

```bash
npm install
```

⏳ This may take **5–15 minutes** depending on your internet speed.  
Please wait until it finishes.

---



### How to setup auto start-up
1. Edit this **lunch_system.bat** press right click and **Edit in Notepad**
2. Edit this **app_system.vbs** press right click and **Edit in Notepad**
3. **In your keyboard: Press Windows + R** eh type lang ni ``shell:startup``
4. The startup folder will appear
5. Under your folder ctu-admin-dashboard
   - paste this file **app_system.vbs**
     
