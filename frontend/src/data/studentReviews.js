const indianNames = [
  "Sai Kumar",
  "Divya Reddy",
  "Karthik Varma",
  "Sneha Nair",
  "Karthik Reddy",
  "Priya Narayanan",
  "Nikhil Gowda",
  "Meera Iyer",
  "Rahul Naidu",
  "Ananya Menon",
  "Varun Shetty",
  "Ishita Rao",
  "Abhishek Kumar",
  "Sanjana Kulkarni",
  "Harsha Vardhan",
  "Neha Thomas",
  "Arjun Menon",
  "Tanya Krishnan",
  "Siddharth Rao",
  "Pooja Nair",
];

const indianCities = [
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kochi",
  "Coimbatore",
  "Vijayawada",
  "Mysuru",
  "Mangaluru",
  "Visakhapatnam",
  "Thiruvananthapuram",
  "Tirupati",
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
  "started getting better fresher interview responses",
  "improved ATS score and got shortlist mail",
  "fixed my Naukri profile and received HR calls",
  "explained my final-year project with confidence",
  "started getting recruiter inbound messages",
  "converted mock feedback into a stronger real interview",
  "moved from random applies to a clear weekly plan",
  "understood which India openings matched my profile",
];

const reviewOpeners = [
  "The resume review was very practical.",
  "The manual feedback felt specific to freshers.",
  "This platform gave me a clear daily placement plan.",
  "I liked the way project interview prep was structured.",
  "The Naukri and LinkedIn fixes changed my visibility.",
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
