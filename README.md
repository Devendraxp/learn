# learn.dev

Full-stack learning management system. Students browse and enroll in courses, educators create and manage content with media uploads, and admins oversee the entire platform — with Stripe payments, progress tracking, and role-based access control.

Live at [https://learn.devendrajat.com](https://learn.devendrajat.com)

## Stack

- **React 19**, **Vite 7**, **Tailwind CSS 4** (client)
- **Express 5** with **Node.js** (server)
- **MongoDB** with **Mongoose**
- **Clerk** for auth and user sync
- **Cloudinary** for media uploads
- **Stripe** for payments
- **Quill** rich-text editor for course content

## Run

```bash
git clone https://github.com/Devendraxp/lms.git
cd learn
cd client && npm install
cd ../server && npm install
cd ..
```

Create environment files:

```bash
# server/.env
cp server/.env.local server/.env   # fill in your keys

# client/.env
cp client/.env.local client/.env   # fill in your keys
```

Start the dev servers:

```bash
# Terminal 1 — client
cd client
npm run dev

# Terminal 2 — server
cd server
npm run server
```

Client starts on `http://localhost:5173`, server on `http://localhost:5000`.

## Environment Variables

**Server** (`server/.env`)

```
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Client** (`client/.env`)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_BACKEND_URL=http://localhost:5000
VITE_CURRENCY=$
```

## Features

**Courses** — Educators create courses with chapters and lectures, including video content (YouTube) and rich-text descriptions. Courses have thumbnails uploaded via Cloudinary, pricing, discount options, and star ratings from enrolled students.

**Enrollment & Payments** — Students purchase courses via Stripe. Progress is tracked per-lecture, and students can resume from where they left off.

**Educator Applications** — Users can apply to become educators. Admins review, approve, or reject applications through a dedicated dashboard.

**Admin Dashboard** — Full platform oversight including user management, educator/student lists, course management, application review, and aggregate statistics.

**Progress Tracking** — Lecture-level completion tracking with course progress percentage displayed in the student's enrollment dashboard.

**Ratings & Reviews** — Enrolled students can rate courses with a star rating system. Average ratings are displayed on course cards and detail pages.

## User Roles

| Role     | Access                                                       |
| -------- | ------------------------------------------------------------ |
| Student  | Browse courses, enroll, track progress, rate courses, apply to become educator |
| Educator | All student access + create/manage courses, view enrolled students, dashboard analytics |
| Admin    | Full access + manage users, review applications, change roles, platform statistics |

## API

### Courses

```
GET    /api/course/all            all courses
GET    /api/course/:id            single course
```

### Educator

```
GET    /api/educator/update-role          update role to educator
POST   /api/educator/add-course           create course (multipart)
GET    /api/educator/courses              educator's courses
DELETE /api/educator/courses/:id          delete course
GET    /api/educator/dashboard            dashboard stats
GET    /api/educator/enrolled-students    enrolled students data
```

### User

```
GET    /api/user/data                     current user info
GET    /api/user/enrolled-courses         enrolled courses
GET    /api/user/myenrollments            enrolled courses (alias)
POST   /api/user/purchase                 purchase course
POST   /api/user/update-course-progress   update lecture progress
POST   /api/user/get-course-progress      get course progress
POST   /api/user/add-rating               rate a course
POST   /api/user/applications             submit educator application
GET    /api/user/applications             list user applications
GET    /api/user/applications/:id         single application
```

### Admin

```
PUT    /api/admin/users/:userId/role              change user role
GET    /api/admin/applications                    list all applications
GET    /api/admin/applications/:id                single application
PUT    /api/admin/applications/:id/approve        approve application
PUT    /api/admin/applications/:id/reject         reject application
GET    /api/admin/educators                       list educators
GET    /api/admin/students                        list students
GET    /api/admin/stats                           platform statistics
```

### Webhooks

```
POST   /clerk                     Clerk webhook (user events)
POST   /stripe                    Stripe webhook (payment events)
```

## Project Structure

```
client/
  src/
    assets/           static images, icons, SVGs
    components/
      admin/           admin sidebar, route guard
      common/          error boundary
      educator/        educator navbar, sidebar, footer
      student/         hero, course cards, searchbar, testimonials, navbar, footer
    context/           global app context (courses, user, enrollment)
    pages/
      admin/           admin dashboard, courses, educators, students
      educator/        add course, dashboard, my courses, enrolled students, applications
      student/         home, course list, course details, player, enrollments
    utils/             validation helpers

server/
  configs/             MongoDB, Cloudinary, Multer setup
  controllers/         business logic (admin, course, educator, user, webhooks, applications)
  middlewares/         auth guards, error handler
  models/              Mongoose schemas (User, Course, CourseProgress, Purchase, EducatorApplication)
  routes/              Express route definitions
  server.js            entry point
```
