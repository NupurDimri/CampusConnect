export type Job = {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  jobType: string;
  workMode: string;
  salary: string;
  deadline: string;
  description: string;
  responsibilities: string;
  eligibility: string;
  skills: string;
  status: "Active" | "Draft" | "Closed";
  applicants: number;
  createdAt: string;
};

const STORAGE_KEY = "campus-connect-jobs";

export function getJobs(): Job[] {
  if (typeof window === "undefined") return [];

  try {
    const storedJobs = localStorage.getItem(STORAGE_KEY);
    return storedJobs ? (JSON.parse(storedJobs) as Job[]) : [];
  } catch {
    return [];
  }
}

export function saveJob(job: Job): void {
  const jobs = getJobs();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([job, ...jobs]));
}

export function updateJobStatus(
  id: string,
  status: Job["status"]
): void {
  const jobs = getJobs().map((job) =>
    job.id === id ? { ...job, status } : job
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}