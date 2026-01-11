# מדריך הטמעת השינויים באתר / Deployment Guide

## שלבים להטמעת השינויים באתר שלך

### שלב 1: מיזוג ה-Pull Request ב-GitHub
1. לך ל-GitHub: https://github.com/opkl10/omok/pulls
2. מצא את ה-PR: "Add post theming, unique identifiers, and admin user management"
3. לחץ על **"Merge pull request"**
4. לחץ על **"Confirm merge"**

אלטרנטיבה - אם אתה רוצה לבדוק לפני merge:
```bash
git checkout copilot/update-database-schema-and-api
npm install
npm run dev
# בדוק שהכל עובד, ואז עשה merge
```

---

### שלב 2: עדכן את הקוד בשרת שלך

אם יש לך שרת production, התחבר אליו והרץ:

```bash
# משוך את הקוד המעודכן
git pull origin main  # או main branch שלך

# התקן dependencies חדשים אם יש
npm install

# צור Prisma client מחדש
npx prisma generate
```

---

### שלב 3: עדכן את הדטהבייס (חשוב מאוד!)

**זהו השלב הכי חשוב!** בלי זה השינויים לא יעבדו.

#### בסביבת Development:
```bash
npx prisma migrate dev
```

#### בסביבת Production:
```bash
npx prisma migrate deploy
```

המיגרציה תוסיף 3 שדות חדשים לטבלת `Post`:
- `theme` - צבע או תמונה לפוסט
- `themeType` - סוג הערכה (color/image)
- `uniqueIdentifier` - מזהה ייחודי לכל פוסט

---

### שלב 4: אתחל מחדש את האפליקציה

#### אם משתמש ב-PM2:
```bash
pm2 restart omok
# או
pm2 reload omok
```

#### אם משתמש ב-systemd:
```bash
sudo systemctl restart omok
```

#### אם רץ locally:
```bash
npm run dev
# או production:
npm run build
npm start
```

---

### שלב 5: בדיקת התכונות החדשות

#### 1. ניהול משתמשים
- היכנס לפאנל הניהול: `http://yoursite.com/admin`
- לחץ על "משתמשים" בתפריט הצד
- תראה רשימת משתמשים עם אפשרות לערוך/למחוק

#### 2. ערכות נושא לפוסטים
- לך ל"פוסטים" → בחר פוסט קיים או צור חדש
- גלול למטה - תראה קטע חדש "ערכת נושא"
- בחר סוג: צבע או תמונה
- הוסף צבע (עם color picker) או URL של תמונה
- שמור את הפוסט

#### 3. צפייה בפוסט עם ערכת נושא
- אחרי שמירת הפוסט, לחץ על "צפה" ברשימת הפוסטים
- תיפתח דף חדש עם הפוסט ב-URL ייחודי
- תראה את הצבע/תמונה בראש הדף

#### 4. הגדרות ערכת נושא
- לך ל"הגדרות"
- גלול למטה - תראה קטעים חדשים:
  - **ערכת נושא**: צבעים ראשיים ומשניים לאתר
  - **עמוד 404**: התאמה אישית של עמוד השגיאה
  - **טקסטים בממשק**: שינוי טקסטים של כפתורים

---

## בעיות נפוצות ופתרונות

### שגיאה: "Column does not exist"
**פתרון**: לא הרצת את המיגרציה של הדטהבייס
```bash
npx prisma migrate deploy
```

### שגיאה: "Can't reach database server"
**פתרון**: בדוק ש-DATABASE_URL ב-`.env` נכון ושהדטהבייס רץ

### שגיאה: "prisma client not found"
**פתרון**: 
```bash
npm install
npx prisma generate
```

### הפוסטים לא מציגים ערכת נושא
**פתרון**: פוסטים קיימים לא יקבלו ערכה אוטומטית. צריך לערוך כל פוסט ולהוסיף ערכה.

---

## קבצים שהשתנו

### Backend:
- ✅ `prisma/schema.prisma` - סכמת הדטהבייס
- ✅ `prisma/migrations/...` - מיגרציה חדשה
- ✅ `src/app/api/posts/route.ts` - API לפוסטים
- ✅ `src/app/api/post/[uniqueIdentifier]/route.ts` - API חדש
- ✅ `src/app/api/admin/users/` - API לניהול משתמשים

### Frontend:
- ✅ `src/app/(public)/post/[id]/page.tsx` - דף פוסט חדש
- ✅ `src/app/(admin)/admin/users/page.tsx` - דף ניהול משתמשים
- ✅ `src/components/PostEditor.tsx` - עורך פוסטים מעודכן
- ✅ `src/app/(admin)/admin/settings/page.tsx` - הגדרות מורחבות

---

## צריך עזרה?

אם נתקעת או משהו לא עובד:
1. בדוק שה-`.env` מוגדר נכון
2. בדוק שהמיגרציה רצה בהצלחה
3. בדוק את הלוגים של האפליקציה
4. פתח issue ב-GitHub עם פרטי השגיאה

---

## למידע נוסף

ראה את ה-README.md המעודכן עם כל התכונות החדשות.
