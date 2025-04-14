import roadmap from '../assets/svg/roadmap.svg'
import ai from '../assets/svg/ai.svg'
import exam from '../assets/svg/exam.svg'
import location from '../assets/svg/location.svg'

const featuresData = [
  {
    id: 1,
    title: "AI Generated Roadmaps",
    shortDesc: "Get a personalized career roadmap based on your skills and interests.",
    details: [
      "Using advanced AI algorithms, our system generates step-by-step career guidance tailored to your unique profile.",
      "✅ Identify the best career paths based on your skills and interests.",
      "✅ Receive personalized learning recommendations (courses, certifications, bootcamps).",
      "✅ Get insights into industry trends and in-demand skills.",
      "✅ Track your progress with milestone-based achievements."
    ],
    img: roadmap
  },
  {
    id: 2,
    title: "Exam & Certification Tracker",
    shortDesc: "Stay updated with upcoming exams, certifications, and deadlines.",
    details: [
      "Never miss an important exam date again! Our platform keeps you informed about all necessary certifications.",
      "📌 Get real-time updates on exam schedules and deadlines.",
      "📌 Track multiple exams and certifications in one place.",
      "📌 Receive reminders and notifications before important dates.",
      "📌 Explore eligibility criteria, registration details, and exam guidelines."
    ],
    img: exam
  },
  {
    id: 3,
    title: "Locate Your Center",
    shortDesc: "Locate nearby exam centers with Google Maps integration.",
    details: [
      "Easily find the closest exam centers based on your location using Google Maps API.",
      "📍 View a list of nearby exam centers with ratings and reviews.",
      "📍 Get precise navigation directions via Google Maps.",
      "📍 Check center capacity, availability, and registration details.",
      "📍 Filter centers based on distance, facilities, and accessibility."
    ],
    img: location
  },
  {
    id: 4,
    title: "Scholarship Finder",
    shortDesc: "Discover financial aid and scholarships tailored for you.",
    details: [
      "Our system fetches relevant scholarships and financial aid opportunities based on your qualifications.",
      "🎓 Access a curated list of scholarships suited to your profile.",
      "🎓 Filter scholarships by eligibility criteria, country, and field of study.",
      "🎓 Get notified about new scholarships and approaching deadlines.",
      "🎓 Step-by-step guidance on the application process."
    ],
    img: ai
  }
];

export default featuresData;
