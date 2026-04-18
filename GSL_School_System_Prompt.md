# GSL Language School Management System
## Master Prompt for AI Studio (Gemini) + Supabase Fullstack App

---

> **How to use this prompt:** Paste the section(s) below into Google AI Studio as your System Prompt. Build the app feature by feature — start with Auth & Database, then add each module one at a time.

---

## 🏫 PROJECT OVERVIEW

You are building **GSL** (German School for Language), a fullstack Language School Management System for a private school that specializes in **teaching German from zero to professional/workplace readiness**. The school also teaches other levels including A1–A2, B1–B2, C1–C2, Kids, Business German, and Exam Prep (Goethe, TestDaF, telc).

**Tech Stack:**
- **Frontend:** HTML + CSS + Vanilla JavaScript (or React if preferred) — deployed via Google AI Studio
- **Backend/Database:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **No custom backend server needed** — all data logic goes through the Supabase JavaScript client library (`@supabase/supabase-js`)

**Three user roles exist in this system:**
1. **Admin** — Full control over everything (this is the school owner/director)
2. **Teacher** — Manages their own classes, marks attendance, enters grades, posts announcements
3. **Student** — Views their own schedule, grades, fees, announcements, and takes placement tests

---

## 🗄️ DATABASE SCHEMA (Supabase / PostgreSQL)

Create the following tables in Supabase. Enable **Row Level Security (RLS)** on all tables.

```sql
-- 1. PROFILES (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role text check (role in ('admin', 'teacher', 'student')) not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. LEVELS
create table levels (
  id serial primary key,
  name text not null, -- e.g. "A1", "B2", "Kids", "Business", "Exam Prep"
  description text,
  duration_weeks int -- estimated course duration
);

-- 3. CLASSES
create table classes (
  id serial primary key,
  name text not null,          -- e.g. "A1 Morning Group"
  level_id int references levels(id),
  teacher_id uuid references profiles(id),
  schedule jsonb,              -- { days: ["Mon","Wed"], time: "09:00", room: "Room 3" }
  start_date date,
  end_date date,
  max_students int default 15,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. ENROLLMENTS (student ↔ class link)
create table enrollments (
  id serial primary key,
  student_id uuid references profiles(id),
  class_id int references classes(id),
  enrolled_at timestamptz default now(),
  status text check (status in ('active', 'completed', 'dropped')) default 'active',
  unique(student_id, class_id)
);

-- 5. ATTENDANCE
create table attendance (
  id serial primary key,
  class_id int references classes(id),
  student_id uuid references profiles(id),
  session_date date not null,
  status text check (status in ('present', 'absent', 'late', 'excused')) not null,
  notes text,
  marked_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 6. GRADES
create table grades (
  id serial primary key,
  student_id uuid references profiles(id),
  class_id int references classes(id),
  assessment_name text not null,  -- e.g. "Midterm Exam", "Oral Test 1"
  score numeric(5,2),             -- out of 100
  max_score numeric(5,2) default 100,
  assessment_date date,
  notes text,
  entered_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 7. FEES
create table fees (
  id serial primary key,
  student_id uuid references profiles(id),
  class_id int references classes(id),
  amount numeric(10,2) not null,
  currency text default 'DZD',
  due_date date,
  paid_at timestamptz,
  status text check (status in ('pending', 'paid', 'overdue', 'waived')) default 'pending',
  payment_method text,           -- e.g. "cash", "bank transfer"
  receipt_number text,
  notes text,
  created_at timestamptz default now()
);

-- 8. ANNOUNCEMENTS
create table announcements (
  id serial primary key,
  title text not null,
  body text not null,
  author_id uuid references profiles(id),
  audience text check (audience in ('all', 'students', 'teachers', 'class')) default 'all',
  class_id int references classes(id), -- if audience = 'class', specify which one
  pinned boolean default false,
  published_at timestamptz default now()
);

-- 9. TEST DATES (Exam schedules like Goethe, TestDaF, telc)
create table test_dates (
  id serial primary key,
  exam_name text not null,       -- e.g. "Goethe A2", "telc B1"
  exam_level text,
  exam_date date not null,
  registration_deadline date,
  location text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 10. PLACEMENT TESTS
create table placement_tests (
  id serial primary key,
  title text not null,
  description text,
  questions jsonb not null,      -- array of question objects (see format below)
  passing_score int default 60,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 11. PLACEMENT TEST RESULTS
create table placement_test_results (
  id serial primary key,
  test_id int references placement_tests(id),
  student_id uuid references profiles(id),
  answers jsonb,                 -- student's submitted answers
  score numeric(5,2),
  recommended_level text,        -- auto-calculated based on score
  taken_at timestamptz default now()
);
```

**Placement test question JSON format:**
```json
[
  {
    "id": 1,
    "type": "multiple_choice",
    "question": "Wie heißen Sie? ___ heiße Maria.",
    "options": ["Er", "Ich", "Sie", "Du"],
    "correct": "Ich",
    "points": 2
  },
  {
    "id": 2,
    "type": "fill_blank",
    "question": "Das ist ___ Buch. (ein/eine/einen)",
    "correct": "ein",
    "points": 2
  }
]
```

---

## 🔐 AUTHENTICATION & ROLE LOGIC

Use **Supabase Auth** for login/signup. After a user signs up, create their row in `profiles` with their assigned role.

**Important flow:**
- Students can self-register via a public signup page
- Teachers and Admins are created **only by the Admin** (no public signup for staff)
- On login, fetch the user's `role` from `profiles` and redirect to the correct dashboard:
  - `admin` → `/admin/dashboard`
  - `teacher` → `/teacher/dashboard`
  - `student` → `/student/dashboard`

**Row Level Security rules (apply these in Supabase):**
- `profiles`: Users can read/update only their own row. Admins can read/update all.
- `classes`: Teachers see only their own classes. Students see only classes they're enrolled in. Admins see all.
- `attendance`: Teachers can insert/update for their own classes. Students can only view their own.
- `grades`: Same as attendance.
- `fees`: Students see only their own. Admin sees and edits all.
- `announcements`: Everyone can read. Only teachers and admins can insert.
- `placement_test_results`: Students see only their own results. Admins see all.

---

## 🖥️ PAGES & LOGICAL FLOW

### PUBLIC PAGES (no login required)
| Page | Path | Description |
|------|------|-------------|
| Landing Page | `/` | GSL homepage with school info, levels offered, CTA to register or take placement test |
| Login | `/login` | Email + password login |
| Student Signup | `/signup` | New student self-registration form |
| Placement Test | `/placement-test` | Public placement test — no account needed to take it, but results are saved if logged in |
| Upcoming Test Dates | `/test-dates` | Public list of upcoming official German exams (Goethe, telc, TestDaF) |

---

### ADMIN DASHBOARD (`/admin`)

**Sidebar navigation:**
- 📊 Overview
- 👨‍🎓 Students
- 👩‍🏫 Teachers
- 📚 Classes
- 💰 Fees
- 📢 Announcements
- 📅 Test Dates
- 📝 Placement Tests
- ⚙️ Settings

**Admin: Overview**
- Stats cards: Total active students, total classes running, total unpaid fees (in DZD), upcoming test dates
- Recent enrollments list
- Recent announcements

**Admin: Students**
- Table of all students with: Name, Phone, Enrolled Class(es), Fee Status, Joined Date
- Search + filter by class or level
- Click student → Student Detail Page:
  - Profile info
  - Enrolled classes
  - Full grade history
  - Attendance summary (% present)
  - Fee history + outstanding balance
  - Placement test result (if any)
- Actions: Edit profile, Enroll in class, Mark fee as paid, Remove from class

**Admin: Teachers**
- Table of all teachers: Name, Email, Classes Assigned, Phone
- Add new teacher (creates Supabase auth account + profile with role = 'teacher')
- Click teacher → Teacher Detail: assigned classes, class schedule
- Edit or deactivate teacher

**Admin: Classes**
- List of all classes (active + archived)
- Each class shows: Name, Level, Teacher, Schedule, Number of students, Status
- Create New Class form:
  - Class name, Level (dropdown), Assign teacher, Schedule (days + time + room), Start/end dates, Max students
- Click class → Class Detail:
  - Student roster
  - Attendance log (by session)
  - Grade overview
  - Fee collection status per student

**Admin: Fees**
- Table of all fee records filterable by: status (pending/paid/overdue), class, student name, date range
- Mark fee as paid → enter payment method + receipt number
- Add new fee record for a student
- Summary totals: Total collected this month, Total outstanding

**Admin: Announcements**
- List of all announcements (newest first, pinned at top)
- Create announcement:
  - Title, Body (rich text), Audience (All / Students / Teachers / Specific Class), Pin toggle
- Edit or delete announcements

**Admin: Test Dates**
- Table of upcoming official German exam dates
- Fields: Exam name (e.g. Goethe B1), Level, Date, Registration deadline, Location, Notes
- Add / Edit / Delete test dates
- These are publicly visible on `/test-dates`

**Admin: Placement Tests**
- List of created placement tests
- Create new test:
  - Title, Description, add Questions one by one (multiple choice or fill-in-the-blank), set passing score
  - Define scoring bands → recommended level:
    - 0–20% → Beginner A1
    - 21–40% → A1 completed, start A2
    - 41–60% → A2/B1
    - 61–80% → B1/B2
    - 81–100% → B2+ / C level
- View all student results for each test

---

### TEACHER DASHBOARD (`/teacher`)

**Sidebar navigation:**
- 📊 My Overview
- 📚 My Classes
- 📋 Attendance
- 📝 Grades
- 📢 Announcements

**Teacher: My Overview**
- Today's classes (from schedule)
- Recent attendance sessions
- Students with low attendance alerts (< 75%)

**Teacher: My Classes**
- List of classes assigned to this teacher
- Click class → see student roster, schedule details

**Teacher: Attendance**
- Select class → select session date → mark each student: Present / Absent / Late / Excused
- View past attendance sessions
- Attendance is saved to Supabase in real time

**Teacher: Grades**
- Select class → add a new assessment (name + date)
- Enter score per student for that assessment
- View grade history by assessment or by student

**Teacher: Announcements**
- View all announcements visible to teachers
- Post a new announcement (audience: all students, or specific class)

---

### STUDENT DASHBOARD (`/student`)

**Sidebar navigation:**
- 🏠 Home
- 📅 My Schedule
- 📊 My Grades
- ✅ My Attendance
- 💳 My Fees
- 📢 Announcements
- 📝 Take Placement Test
- 📅 Exam Dates

**Student: Home**
- Welcome message with student's name
- Upcoming classes today/this week
- Latest announcements
- Fee alert if there's an overdue payment

**Student: My Schedule**
- Weekly timetable view of enrolled classes
- Shows: Class name, Teacher, Room, Days & Times

**Student: My Grades**
- Table of all grades grouped by class
- Each row: Assessment name, Date, Score, Max Score, Percentage
- Overall average per class

**Student: My Attendance**
- Per class: total sessions, present, absent, late
- Attendance percentage with color indicator (green ≥ 80%, orange 60–79%, red < 60%)

**Student: My Fees**
- List of all fee records: Class, Amount, Due Date, Status (Paid / Pending / Overdue)
- Paid fees show receipt number and payment date
- No online payment needed — fees are paid in person; this is tracking only

**Student: Announcements**
- All announcements visible to students (global + class-specific)
- Pinned announcements appear first

**Student: Take Placement Test**
- If no result yet: Start test button → shows test questions one by one
- On submit: score is calculated instantly on the frontend, result is saved to `placement_test_results`, recommended level is shown
- If result exists: show previous result + recommended level

**Student: Exam Dates**
- Read-only list of upcoming official German exams from `test_dates` table

---

## 🎨 UI / UX DESIGN GUIDELINES

- **Color Palette:** Use Germany-inspired professional colors — Black (#1a1a1a), Gold/Yellow (#F5C518), White, with accent Deep Blue (#1B3A6B) for trust and professionalism
- **Logo area:** "GSL" wordmark + tagline: *"Deutsch lernen. Leben verändern."* (Learn German. Change your life.)
- **Font:** A clean, European-feeling sans-serif (e.g. DM Sans, Figtree, or Plus Jakarta Sans)
- **Sidebar layout** for all dashboards (collapsible on mobile)
- **Cards and tables** for data display — avoid walls of text
- **Status badges** with color coding: green = good, orange = warning, red = alert
- **Mobile responsive** — many teachers and students will use phones

---

## ⚙️ SUPABASE SETUP CHECKLIST

When building this app, make sure to:

1. ✅ Create a Supabase project at supabase.com
2. ✅ Run all SQL table creation scripts in the Supabase SQL Editor
3. ✅ Enable Row Level Security on every table
4. ✅ Add your Supabase URL and anon key to your app's config:
   ```js
   const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_ANON_KEY')
   ```
5. ✅ Enable Email Auth in Supabase → Authentication → Providers
6. ✅ Create a trigger to auto-insert into `profiles` on new user signup:
   ```sql
   create or replace function handle_new_user()
   returns trigger as $$
   begin
     insert into profiles (id, email, full_name, role)
     values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'student');
     return new;
   end;
   $$ language plpgsql security definer;

   create trigger on_auth_user_created
   after insert on auth.users
   for each row execute procedure handle_new_user();
   ```
7. ✅ For teacher/admin creation, the admin manually inserts into `auth.users` via Supabase Dashboard → Authentication → Users → Invite User, then updates their role in `profiles`

---

## 🚀 RECOMMENDED BUILD ORDER

Build the system in this exact order to avoid dependency issues:

1. **Supabase project setup** — tables, RLS, auth trigger
2. **Login / Signup pages** — test that role-based redirect works
3. **Admin: Students + Classes** — core data management
4. **Admin: Teachers** — assign teachers to classes
5. **Admin: Enrollments** — link students to classes
6. **Teacher: Attendance** — mark sessions
7. **Teacher: Grades** — enter assessment scores
8. **Admin: Fees** — add and track payments
9. **Announcements** — admin + teacher post, students read
10. **Admin: Test Dates** — add official exam dates
11. **Placement Test** — build question UI, scoring logic, save results
12. **Student Dashboard** — read-only views of all their data
13. **Public landing page** — school info, CTA buttons
14. **Polish** — responsive design, loading states, empty states, error handling

---

## 📌 ADDITIONAL NOTES FOR AI STUDIO

- Always use `supabase.auth.getUser()` to get the current logged-in user before any data fetch
- Always check the user's `role` from the `profiles` table before rendering admin/teacher-only UI
- For all Supabase queries, handle errors gracefully — show a user-friendly message, not a raw error
- When inserting attendance or grades, always include `marked_by` = current user's ID
- The placement test scoring and level recommendation happens **entirely on the frontend** — no backend function needed
- All monetary amounts are in **Algerian Dinar (DZD)** by default

---

*This prompt was generated for GSL — German School for Language. Build with ❤️ using Google AI Studio + Supabase.*
