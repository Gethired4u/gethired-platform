const indianNames = [
  "Aarav Sharma",
  "Aditi Verma",
  "Rohan Patel",
  "Sneha Nair",
  "Karthik Reddy",
  "Priya Singh",
  "Nikhil Joshi",
  "Meera Iyer",
  "Rahul Mishra",
  "Ananya Das",
  "Varun Kapoor",
  "Ishita Gupta",
  "Abhishek Jain",
  "Sanjana Kulkarni",
  "Harsh Vyas",
  "Neha Choudhary",
  "Arjun Menon",
  "Tanya Bhatia",
  "Siddharth Rao",
  "Pooja Yadav",
];

const indianCities = [
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Mumbai",
  "Delhi",
  "Noida",
  "Gurugram",
  "Ahmedabad",
  "Kolkata",
  "Kochi",
  "Jaipur",
  "Indore",
  "Coimbatore",
  "Vijayawada",
];

const targetRoles = [
  "Python Developer",
  "Data Analyst",
  "SDET",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "DevOps Trainee",
  "QA Automation Engineer",
];

const outcomes = [
  "got interview calls within 10 days",
  "improved ATS score and got shortlist mail",
  "received strong HR response after profile update",
  "cleared technical round with confidence",
  "started getting recruiter inbound messages",
  "converted mock feedback into real interview wins",
  "moved from random applies to targeted offers",
  "landed final rounds faster than before",
];

const reviewOpeners = [
  "The ATS optimization was super practical.",
  "The manual review quality was better than expected.",
  "This platform gave me a clear daily plan.",
  "I liked the way interview prep was structured.",
  "The profile optimization changed my visibility.",
  "The mock interview feedback was very specific.",
];

const ratings = ["4.8/5", "4.9/5", "5.0/5"];

export const indianStudentReviews = Array.from({ length: 54 }, (_, index) => {
  const name = indianNames[index % indianNames.length];
  const city = indianCities[index % indianCities.length];
  const role = targetRoles[index % targetRoles.length];
  const outcome = outcomes[index % outcomes.length];
  const opener = reviewOpeners[index % reviewOpeners.length];
  const rating = ratings[index % ratings.length];

  return {
    id: index + 1,
    name,
    city,
    role,
    rating,
    text: `${opener} I am from ${city} and targeted ${role} roles. I ${outcome}.`,
  };
});
