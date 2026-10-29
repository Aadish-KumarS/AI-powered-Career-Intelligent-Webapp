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
    img: roadmap,
    link: '/services/generate-roadmap'
  },
  {
    id: 2,
    title: "Exam & Certification Recommender",
    shortDesc: "Get AI-powered suggestions for exams and certifications.",
    details: [
      "Receive intelligent recommendations for exams and certifications based on your current profile and future goals.",
      "📌 AI-suggested certifications aligned with your skillset and aspirations.",
      "📌 Explore eligibility, registration, preparation resources, and deadlines.",
      "📌 Save and manage exams to track your progress effortlessly.",
      "📌 Stay ahead with timely updates and alerts."
    ],
    img: exam,
    link: 'services/exam-certification'
  },
  {
    id: 3,
    title: "AI Skill Gap Analysis",
    shortDesc: "Analyze your skills and identify what’s missing to reach your goals.",
    details: [
      "Bridge the gap between your current abilities and your dream career.",
      "📊 AI compares your profile with desired roles and industry standards.",
      "📊 Highlights missing skills and knowledge areas.",
      "📊 Suggests learning paths to close those gaps efficiently.",
      "📊 Real-time updates based on your ongoing progress."
    ],
    img: ai,
    link: 'services/career-guid/career-analysis'
  },
  {
    id: 4,
    title: "AI Career Recommendation",
    shortDesc: "Discover careers uniquely tailored to your personality and goals.",
    details: [
      "Let our AI analyze your background, interests, and aspirations to recommend ideal career paths.",
      "🎯 Get matched with careers that suit your profile.",
      "🎯 Understand why each path fits based on your education, experience, and preferences.",
      "🎯 Explore emerging roles and long-term potential.",
      "🎯 Jumpstart your journey with next-step suggestions."
    ],
    img: ai,
    link: 'services/career-guid/career-recommendation'
  },
  {
    id: 5,
    title: "AI Job Insight",
    shortDesc: "Stay informed about market trends and job opportunities.",
    details: [
      "Gain a strategic advantage with real-time job market intelligence.",
      "💼 Discover trending job roles in your target industries.",
      "💼 Understand hiring trends, salary benchmarks, and skill demand.",
      "💼 Regional insights to help you target the right opportunities.",
      "💼 Tailored advice for navigating today’s job landscape."
    ],
    img: location,
    link: 'services/career-guid/career-analysis'
  },
  {
    id: 6,
    title: "AI Personalized Career Path",
    shortDesc: "Follow a step-by-step career path curated just for you.",
    details: [
      "Turn your career goals into a dynamic, personalized journey.",
      "🧭 Get a structured plan with short-term and long-term milestones.",
      "🧭 Visualize your path from beginner to expert.",
      "🧭 Adapt the roadmap as your goals and interests evolve.",
      "🧭 Stay motivated with progress tracking and adaptive feedback."
    ],
    img: ai,
    link: 'services/career-guid/career-analysis'
  }
];

export default featuresData;
