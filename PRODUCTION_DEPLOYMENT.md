# מדריך פריסה מפורט - איך להעלות את השינויים לאתר החי

## לפני שמתחילים - מה צריך?

✅ גישה ל-GitHub repository  
✅ גישה לשרת/פלטפורמת האירוח שלך (Vercel/Railway/VPS וכו')  
✅ גישה לדטהבייס PostgreSQL  
✅ 10-15 דקות  

---

## אפשרות 1: פריסה ב-Vercel (הכי פשוט)

### שלב 1: Merge ה-Pull Request
1. לך ל: https://github.com/opkl10/omok/pulls
2. מצא את ה-PR: **"Add post theming, unique identifiers, and admin user management"**
3. לחץ על הכפתור הירוק **"Merge pull request"**
4. לחץ על **"Confirm merge"**

### שלב 2: Vercel יעשה Deploy אוטומטי
- Vercel מזהה את השינויים אוטומטית
- היכנס ל: https://vercel.com/dashboard
- תראה את ה-deployment רץ
- המתן שיסתיים (בדרך כלל 2-3 דקות)

### שלב 3: הרץ את המיגרציה של הדטהבייס
**חשוב מאוד!** בלי זה האתר לא יעבוד.

#### אופציה A - דרך Vercel CLI:
```bash
# התקן Vercel CLI אם עדיין לא
npm i -g vercel

# התחבר ל-Vercel
vercel login

# הרץ את המיגרציה
vercel env pull .env.local
npx prisma migrate deploy
```

#### אופציה B - דרך Terminal מקומי:
```bash
# ודא שיש לך את ה-DATABASE_URL מ-Vercel
# לך ל-Vercel Dashboard → Project → Settings → Environment Variables
# העתק את DATABASE_URL

# צור קובץ .env עם DATABASE_URL
echo 'DATABASE_URL="YOUR_DATABASE_URL_HERE"' > .env

# הרץ את המיגרציה
npx prisma migrate deploy
```

### שלב 4: בדוק שהאתר עובד
1. לך לכתובת האתר שלך
2. היכנס לפאנל אדמין: `https://yoursite.com/admin`
3. בדוק שיש "משתמשים" בתפריט
4. נסה ליצור פוסט עם ערכת נושא

---

## אפשרות 2: פריסה ב-Railway

### שלב 1-2: זהה כמו Vercel (Merge PR)
Railway גם עושה deploy אוטומטי אחרי merge.

### שלב 3: הרץ מיגרציה דרך Railway
```bash
# התקן Railway CLI
npm i -g @railway/cli

# התחבר
railway login

# קישור לפרויקט
railway link

# הרץ מיגרציה
railway run npx prisma migrate deploy
```

או דרך Railway Dashboard:
1. לך ל-Railway Dashboard
2. בחר את הפרויקט שלך
3. לחץ על "Settings" → "Deploy"
4. הוסף Build Command: `npx prisma migrate deploy && npm run build`

---

## אפשרות 3: פריסה בשרת VPS (DigitalOcean, AWS, וכו')

### שלב 1: Merge PR (זהה לאפשרויות קודמות)

### שלב 2: התחבר לשרת
```bash
ssh your-username@your-server-ip
```

### שלב 3: נווט לתיקיית הפרויקט
```bash
cd /path/to/your/omok/project
# לדוגמה:
# cd /var/www/omok
# או
# cd ~/omok
```

### שלב 4: משוך את השינויים
```bash
# שמור שינויים מקומיים אם יש (לא צריך בדרך כלל)
git stash

# משוך מ-main
git checkout main
git pull origin main

# אם היית ב-branch אחר
git merge origin/main
```

### שלב 5: התקן dependencies
```bash
npm install
```

### שלב 6: צור Prisma Client
```bash
npx prisma generate
```

### שלב 7: הרץ מיגרציה **חשוב!**
```bash
npx prisma migrate deploy
```

אם אתה מקבל שגיאה "DATABASE_URL not found":
```bash
# בדוק שיש .env
cat .env | grep DATABASE_URL

# אם אין, צור אותו או עדכן
nano .env
# הוסף: DATABASE_URL="postgresql://..."
```

### שלב 8: Build הפרויקט
```bash
npm run build
```

### שלב 9: אתחל את האפליקציה

#### אם משתמש ב-PM2:
```bash
pm2 restart omok
# או אם זה בפעם הראשונה:
pm2 start npm --name "omok" -- start
pm2 save
```

#### אם משתמש ב-systemd:
```bash
sudo systemctl restart omok
# או
sudo systemctl restart omok.service
```

#### אם רץ ידנית:
```bash
# עצור את התהליך הקיים (Ctrl+C)
# הרץ מחדש:
npm start
```

### שלב 10: בדוק שהשרת רץ
```bash
# בדוק לוגים
pm2 logs omok
# או
journalctl -u omok -f

# בדוק שהפורט פתוח
netstat -tlnp | grep :3000
```

---

## בדיקת התכונות החדשות

### 1. ניהול משתמשים
```
1. לך ל: https://yoursite.com/admin
2. התחבר כמנהל
3. בתפריט הצד - יש כפתור חדש "👥 משתמשים"
4. לחץ עליו - תראה רשימת כל המשתמשים
5. נסה לערוך משתמש או לשנות תפקיד
```

### 2. ערכות נושא לפוסטים
```
1. לך ל: https://yoursite.com/admin/posts
2. לחץ על "פוסט חדש +" או בחר פוסט קיים
3. גלול למטה בעורך
4. תראה קטע חדש: "ערכת נושא"
5. בחר "צבע" ובחר צבע כחול
6. שמור את הפוסט
7. לחץ על "צפה" ליד הפוסט
8. תראה את הצבע הכחול בראש הדף!
```

### 3. URL ייחודי לפוסט
```
כל פוסט עכשיו נגיש גם דרך:
- הדרך הישנה: /blog/post-slug
- דרך חדשה: /post/unique-identifier

הדרך החדשה לא משתנה גם אם תשנה את הכותרת!
```

### 4. הגדרות ערכת נושא
```
1. לך ל: https://yoursite.com/admin/settings
2. גלול למטה
3. תראה קטעים חדשים:
   - "ערכת נושא" - שנה צבעים של האתר
   - "עמוד 404" - התאם את עמוד השגיאה
   - "טקסטים בממשק" - שנה טקסטים של כפתורים
```

---

## פתרון בעיות נפוצות

### ❌ שגיאה: "Column 'theme' does not exist"
**הבעיה:** לא הרצת את מיגרציית הדטהבייס

**הפתרון:**
```bash
npx prisma migrate deploy
```

### ❌ שגיאה: "Can't reach database server"
**הבעיה:** ה-DATABASE_URL לא נכון או הדטהבייס לא רץ

**הפתרון:**
```bash
# בדוק את ה-DATABASE_URL
echo $DATABASE_URL
# או
cat .env | grep DATABASE_URL

# ודא שהדטהבייס רץ
# אם PostgreSQL מקומי:
sudo systemctl status postgresql

# נסה להתחבר ידנית:
psql $DATABASE_URL
```

### ❌ שגיאה: "Module not found"
**הבעיה:** Dependencies לא מותקנים

**הפתרון:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ שגיאה: "Prisma Client not initialized"
**הבעיה:** לא רצת `prisma generate`

**הפתרון:**
```bash
npx prisma generate
npm run build
```

### ❌ האתר לא מראה את השינויים
**פתרונות אפשריים:**

1. **נקה cache:**
```bash
# נקה cache של הדפדפן
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

2. **אתחל את השרת:**
```bash
pm2 restart omok --update-env
```

3. **בדוק שה-build עבר בהצלחה:**
```bash
npm run build
# אם יש שגיאות - תקן אותן
```

---

## סיכום - Checklist מהיר

להעלות את השינויים לאתר, צריך לעשות:

- [ ] Merge את ה-PR ב-GitHub
- [ ] Pull/Deploy הקוד החדש
- [ ] `npm install` (להתקין dependencies)
- [ ] `npx prisma generate` (לצור Prisma client)
- [ ] `npx prisma migrate deploy` ⚠️ **קריטי!**
- [ ] `npm run build` (ל-production)
- [ ] Restart את האפליקציה
- [ ] בדוק שהאתר עובד

---

## איפה לקבל עזרה?

1. **לוגים:** תמיד בדוק את הלוגים קודם
   - PM2: `pm2 logs omok`
   - systemd: `journalctl -u omok -f`
   - Vercel: Dashboard → Logs

2. **פתח Issue ב-GitHub** עם:
   - תיאור הבעיה
   - השגיאה המדויקת (copy-paste)
   - מה ניסית לעשות
   - screenshots אם רלוונטי

3. **בדוק שיש:**
   - DATABASE_URL ב-.env
   - Node.js גרסה 20+
   - PostgreSQL רץ
   - Port 3000 פנוי (או הגדרת PORT אחר)

---

**בהצלחה! 🚀**

אחרי שתעשה את כל השלבים, האתר שלך יהיה עם כל התכונות החדשות!
