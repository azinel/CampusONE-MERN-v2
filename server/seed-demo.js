
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

import User from "./src/models/User.js";
import Complaint from "./src/models/Complaint.js";
import Event from "./src/models/Event.js";
import Notification from "./src/models/Notification.js";
import Post from "./src/models/Post.js";
import Comment from "./src/models/Comment.js";
import Mess from "./src/models/Mess.js";
import MessFeedback from "./src/models/MessFeedback.js";
import { MEAL_DEFAULTS, MEAL_TYPES } from "./src/constants/index.js";

const DEMO_PASSWORD =
    process.env.DEMO_USER_PASSWORD || "CampusDemo2026";

const now = new Date();
const dateKey = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) =>
    new Date(now.getTime() - n * 86400000);
const daysFromNow = (n) =>
    new Date(now.getTime() + n * 86400000);

const studentSpecs = [
    {
        name: "Aarav Sharma",
        email: "aarav.demo@campusone.test",
        hostel: "North Block",
        room: "204",
        department: "Computer Science",
        course: "B.Tech CSE",
        phone: "+91 9000000001",
    },
    {
        name: "Priya Patel",
        email: "priya.demo@campusone.test",
        hostel: "South Block",
        room: "112",
        department: "Electronics",
        course: "B.Tech ECE",
        phone: "+91 9000000002",
    },
    {
        name: "Rohan Das",
        email: "rohan.demo@campusone.test",
        hostel: "East Block",
        room: "301",
        department: "Mechanical",
        course: "B.Tech ME",
        phone: "+91 9000000003",
    },
    {
        name: "Ananya Roy",
        email: "ananya.demo@campusone.test",
        hostel: "West Block",
        room: "108",
        department: "Electrical",
        course: "B.Tech EE",
        phone: "+91 9000000004",
    },
    {
        name: "Kabir Singh",
        email: "kabir.demo@campusone.test",
        hostel: "North Block",
        room: "218",
        department: "Civil",
        course: "B.Tech CE",
        phone: "+91 9000000005",
    },
];

async function main() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI missing in server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to:", mongoose.connection.name);
    console.log("Existing data will NOT be deleted.");

    const admin = await User.findOne({
        role: "admin",
        isActive: { $ne: false },
    }).sort({ createdAt: 1 });

    if (!admin) {
        throw new Error("No active admin found. Create your admin first.");
    }

    // 1. CREATE STUDENTS

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const students = [];

    for (const spec of studentSpecs) {
        const student = await User.findOneAndUpdate(
            { email: spec.email },
            {
                $setOnInsert: {
                    ...spec,
                    passwordHash,
                    role: "student",
                    isActive: true,
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        students.push(student);
    }

    console.log("Students ready:", students.length);

    // 2. CREATE COMPLAINTS

    const complaintSpecs = [
        {
            title: "Water supply interruption",
            description: "No water supply on the second floor since morning.",
            category: "Water",
            priority: "High",
            student: 0,
            status: "In Progress",
            assignedTo: "Maintenance Team",
            age: 2,
        },
        {
            title: "WiFi not working in library",
            description: "Internet disconnects frequently in the central library.",
            category: "WiFi",
            priority: "Medium",
            student: 1,
            status: "Pending",
            age: 1,
        },
        {
            title: "Broken ceiling fan",
            description: "Fan is making unusual noise and needs repair.",
            category: "Electricity",
            priority: "High",
            student: 2,
            status: "Resolved",
            assignedTo: "Electrical Team",
            resolution: "Fan repaired successfully.",
            age: 5,
        },
        {
            title: "Hostel corridor cleaning",
            description: "Corridor has not been cleaned for several days.",
            category: "Cleaning",
            priority: "Low",
            student: 3,
            status: "Pending",
            age: 3,
        },
        {
            title: "Lights not working",
            description: "Two lights in the common room are not working.",
            category: "Electricity",
            priority: "Medium",
            student: 4,
            status: "In Progress",
            assignedTo: "Electrical Team",
            age: 2,
        },
        {
            title: "Water leakage near washroom",
            description: "Water is leaking near the shared washroom.",
            category: "Water",
            priority: "High",
            student: 1,
            status: "Resolved",
            assignedTo: "Plumbing Team",
            resolution: "Pipe leakage repaired.",
            age: 7,
        },
        {
            title: "Poor WiFi coverage",
            description: "Weak internet signal in hostel rooms.",
            category: "WiFi",
            priority: "Medium",
            student: 3,
            status: "Pending",
            age: 1,
        },
        {
            title: "Water cooler maintenance",
            description: "Water cooler is not functioning properly.",
            category: "Other",
            priority: "Medium",
            student: 0,
            status: "Pending",
            age: 0,
        },
        {
            title: "Washroom cleaning required",
            description: "Common washroom requires cleaning.",
            category: "Cleaning",
            priority: "Medium",
            student: 2,
            status: "In Progress",
            assignedTo: "Housekeeping",
            age: 2,
        },
        {
            title: "Power socket damaged",
            description: "A loose electrical socket needs immediate inspection.",
            category: "Electricity",
            priority: "High",
            student: 4,
            status: "In Progress",
            assignedTo: "Electrical Team",
            age: 1,
        },
        {
            title: "Library reading area cleaning",
            description: "Reading tables and floors need cleaning.",
            category: "Cleaning",
            priority: "Low",
            student: 2,
            status: "Resolved",
            assignedTo: "Housekeeping",
            resolution: "Cleaning completed.",
            age: 4,
        },
        {
            title: "Internet issue in study room",
            description: "Network disconnects during online classes.",
            category: "WiFi",
            priority: "High",
            student: 1,
            status: "Pending",
            age: 0,
        },
    ];

    for (const c of complaintSpecs) {
        const student = students[c.student];
        const createdAt = daysAgo(c.age);

        const timeline = [
            {
                status: "Pending",
                note: "Complaint submitted",
                timestamp: createdAt,
                actor: student.name,
            },
        ];

        if (c.status !== "Pending") {
            timeline.push({
                status: "In Progress",
                note: "Assigned to campus maintenance team",
                timestamp: daysAgo(Math.max(0, c.age - 1)),
                actor: admin.name,
            });
        }

        if (c.status === "Resolved") {
            timeline.push({
                status: "Resolved",
                note: c.resolution,
                timestamp: daysAgo(Math.max(0, c.age - 2)),
                actor: "Campus Support Team",
            });
        }

        await Complaint.updateOne(
            { title: c.title, student: student._id },
            {
                $setOnInsert: {
                    title: c.title,
                    description: c.description,
                    category: c.category,
                    priority: c.priority,
                    status: c.status,
                    student: student._id,
                    studentName: student.name,
                    studentEmail: student.email,
                    hostel: student.hostel,
                    roomNumber: student.room,
                    images: [],
                    assignedTo: c.assignedTo || null,
                    resolution: c.resolution || null,
                    timeline,
                    createdAt,
                    updatedAt: createdAt,
                },
            },
            {
                upsert: true,
                timestamps: false
            }
        );
    }

    console.log("Complaints ready");

    // 3. CREATE EVENTS

    const eventSpecs = [
        {
            title: "Campus Tech Fest 2026",
            description: "Technology festival featuring hackathons and project showcases.",
            category: "Academic",
            offset: 5,
            time: "10:00",
            venue: "Main Auditorium",
            organizer: "Computer Science Department",
            capacity: 500,
            registered: 126,
        },
        {
            title: "Inter Hostel Cricket Tournament",
            description: "Annual cricket tournament between different hostels.",
            category: "Sports",
            offset: 12,
            time: "09:00",
            venue: "Sports Ground",
            organizer: "Sports Committee",
            capacity: 200,
            registered: 84,
        },
        {
            title: "Resume Building Workshop",
            description: "Workshop covering resumes, interviews and placement preparation.",
            category: "Workshop",
            offset: 2,
            time: "14:00",
            venue: "Seminar Hall",
            organizer: "Placement Cell",
            capacity: 100,
            registered: 63,
        },
        {
            title: "Cultural Evening",
            description: "Music, dance and cultural performances by student clubs.",
            category: "Cultural",
            offset: 20,
            time: "18:00",
            venue: "Open Air Theatre",
            organizer: "Cultural Committee",
            capacity: 700,
            registered: 210,
        },
        {
            title: "Guest Lecture on Artificial Intelligence",
            description: "Guest lecture about practical applications of AI.",
            category: "Academic",
            offset: -3,
            time: "11:00",
            venue: "Lecture Hall 1",
            organizer: "Academic Council",
            capacity: 150,
            registered: 112,
        },
    ];

    for (const e of eventSpecs) {
        const d = daysFromNow(e.offset);
        const date = dateKey(d);
        const startsAt = new Date(`${date}T${e.time}:00`);

        await Event.updateOne(
            { title: e.title },
            {
                $setOnInsert: {
                    title: e.title,
                    description: e.description,
                    category: e.category,
                    date,
                    time: e.time,
                    venue: e.venue,
                    organizer: e.organizer,
                    startsAt,
                    endsAt: new Date(startsAt.getTime() + 3 * 3600000),
                    maxCapacity: e.capacity,
                    registeredCount: e.registered,
                    registeredUsers: [],
                    createdBy: admin._id,
                },
            },
            { upsert: true }
        );
    }

    console.log("Events ready");

    // 4. CREATE MESS MENUS

    const todayDate = dateKey(now);
    const meals = [];

    for (const mealType of MEAL_TYPES) {
        const defaults = MEAL_DEFAULTS[mealType];

        const meal = await Mess.findOneAndUpdate(
            { date: todayDate, mealType },
            {
                $setOnInsert: {
                    date: todayDate,
                    mealType,
                    items: defaults.items,
                    time: defaults.time,
                    avgTaste: 0,
                    avgHygiene: 0,
                    avgQuantity: 0,
                    ratingCount: 0,
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        meals.push(meal);
    }

    console.log("Mess menus ready");

    // 5. CREATE MESS FEEDBACK

    const comments = [
        "Good taste and portion size.",
        "Please serve food a little warmer.",
        "Hygiene was good today.",
        "Could include more vegetables.",
        "Overall a satisfying meal.",
    ];

    for (const meal of meals) {
        for (let i = 0; i < 4; i++) {
            const student = students[i];
            const taste = [4, 5, 3, 4][i];
            const hygiene = [5, 4, 4, 5][i];
            const quantity = [4, 5, 3, 4][i];

            await MessFeedback.updateOne(
                { student: student._id, meal: meal._id },
                {
                    $setOnInsert: {
                        student: student._id,
                        studentName: student.name,
                        meal: meal._id,
                        mealType: meal.mealType,
                        date: todayDate,
                        taste,
                        hygiene,
                        quantity,
                        comment: comments[i],
                    },
                },
                { upsert: true }
            );
        }

        const feedback = await MessFeedback.find({
            meal: meal._id,
        }).lean();

        const average = (key) =>
            feedback.length
                ? Math.round(
                    feedback.reduce((sum, f) => sum + f[key], 0) /
                    feedback.length * 10
                ) / 10
                : 0;

        await Mess.updateOne(
            { _id: meal._id },
            {
                $set: {
                    avgTaste: average("taste"),
                    avgHygiene: average("hygiene"),
                    avgQuantity: average("quantity"),
                    ratingCount: feedback.length,
                },
            }
        );
    }

    console.log("Mess feedback ready");

    // 6. CREATE CAMPUS POSTS

    const postSpecs = [
        {
            title: "Welcome to CampusONE",
            content: "Share campus updates, club activities and student initiatives here.",
            category: "announcement",
            author: admin._id,
        },
        {
            title: "Suggestions for Tech Fest",
            content: "Share your ideas for workshops and technical events.",
            category: "general",
            author: students[0]._id,
        },
        {
            title: "Weekend Sports Activities",
            content: "Students can coordinate cricket, football and badminton activities.",
            category: "sports",
            author: students[1]._id,
        },
    ];

    const posts = [];

    for (const p of postSpecs) {
        const post = await Post.findOneAndUpdate(
            { title: p.title, author: p.author },
            { $setOnInsert: p },
            { new: true, upsert: true }
        );

        posts.push(post);
    }

    // 7. CREATE COMMENTS

    const commentSpecs = [
        {
            content: "Looking forward to the event!",
            author: students[1]._id,
            post: posts[0]._id,
        },
        {
            content: "A web development workshop would be useful.",
            author: students[2]._id,
            post: posts[1]._id,
        },
        {
            content: "Interested in joining the cricket team.",
            author: students[3]._id,
            post: posts[2]._id,
        },
    ];

    for (const c of commentSpecs) {
        await Comment.updateOne(
            {
                content: c.content,
                author: c.author,
                post: c.post,
            },
            { $setOnInsert: c },
            { upsert: true }
        );
    }

    console.log("Posts and comments ready");

    // 8. CREATE NOTIFICATIONS

    for (const student of students) {
        await Notification.updateOne(
            {
                recipient: student._id,
                title: "Welcome to CampusONE Demo",
            },
            {
                $setOnInsert: {
                    recipient: student._id,
                    title: "Welcome to CampusONE Demo",
                    message: "Your demo account is ready. Explore CampusONE!",
                    type: "system",
                    read: false,
                    link: "/student/dashboard",
                },
            },
            { upsert: true }
        );
    }

    await Notification.updateOne(
        {
            recipient: admin._id,
            title: "CampusONE demo data populated",
        },
        {
            $setOnInsert: {
                recipient: admin._id,
                title: "CampusONE demo data populated",
                message: "Demo complaints, events and mess data are ready.",
                type: "system",
                read: false,
                link: "/admin",
            },
        },
        { upsert: true }
    );

    // 9. PRINT FINAL COUNTS

    const counts = {
        users: await User.countDocuments(),
        complaints: await Complaint.countDocuments(),
        events: await Event.countDocuments(),
        mess: await Mess.countDocuments(),
        messFeedback: await MessFeedback.countDocuments(),
        posts: await Post.countDocuments(),
        comments: await Comment.countDocuments(),
        notifications: await Notification.countDocuments(),
    };

    console.log("\n========== SEED COMPLETE ==========");
    console.log(counts);

    console.log("\nDemo student accounts:");

    for (const s of students) {
        console.log(s.email);
    }

    console.log("\nPassword:", DEMO_PASSWORD);
}

main()
    .catch((error) => {
        console.error("SEED ERROR:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect().catch(() => { });
    });
