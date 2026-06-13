import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { app } from "./config";
import type { CarbonTwinProfile, Scenario, WeeklyReport } from "@/types";

export const db = getFirestore(app);

// ── Collection References ────────────────────────────────────
export const COLLECTIONS = {
  USERS: "users",
  CARBON_TWIN_PROFILES: "carbonTwinProfiles",
  SCENARIOS: "scenarios",
  WEEKLY_REPORTS: "weeklyReports",
  ACTIVITY_LOGS: "activityLogs",
} as const;

// ── Carbon Twin Profile ──────────────────────────────────────
export async function getCarbonTwinProfile(
  userId: string
): Promise<CarbonTwinProfile | null> {
  const ref = doc(db, COLLECTIONS.CARBON_TWIN_PROFILES, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  } as CarbonTwinProfile;
}

export async function saveCarbonTwinProfile(
  profile: Omit<CarbonTwinProfile, "createdAt" | "updatedAt">
): Promise<void> {
  const ref = doc(db, COLLECTIONS.CARBON_TWIN_PROFILES, profile.userId);
  const existing = await getDoc(ref);
  await setDoc(ref, {
    ...profile,
    updatedAt: serverTimestamp(),
    createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
  });
}

export async function updateCarbonTwinProfile(
  userId: string,
  updates: Partial<CarbonTwinProfile>
): Promise<void> {
  const ref = doc(db, COLLECTIONS.CARBON_TWIN_PROFILES, userId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteCarbonTwinProfile(userId: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.CARBON_TWIN_PROFILES, userId);
  await deleteDoc(ref);
}

// ── Scenarios ────────────────────────────────────────────────
export async function saveScenario(
  userId: string,
  scenario: Omit<Scenario, "id" | "createdAt">
): Promise<string> {
  const col = collection(db, COLLECTIONS.SCENARIOS);
  const docRef = await addDoc(col, {
    ...scenario,
    userId,
    createdAt: serverTimestamp(),
    baselineFootprint: {
      ...scenario.baselineFootprint,
      calculatedAt: Timestamp.fromDate(scenario.baselineFootprint.calculatedAt),
    },
    projectedFootprint: {
      ...scenario.projectedFootprint,
      calculatedAt: Timestamp.fromDate(scenario.projectedFootprint.calculatedAt),
    },
  });
  return docRef.id;
}

export async function getUserScenarios(userId: string): Promise<Scenario[]> {
  const col = collection(db, COLLECTIONS.SCENARIOS);
  const q = query(
    col,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: (data.createdAt as Timestamp).toDate(),
      baselineFootprint: {
        ...data.baselineFootprint,
        calculatedAt: (data.baselineFootprint.calculatedAt as Timestamp).toDate(),
      },
      projectedFootprint: {
        ...data.projectedFootprint,
        calculatedAt: (data.projectedFootprint.calculatedAt as Timestamp).toDate(),
      },
    } as Scenario;
  });
}

// ── Weekly Reports ───────────────────────────────────────────
export async function getLatestWeeklyReport(
  userId: string
): Promise<WeeklyReport | null> {
  const col = collection(db, COLLECTIONS.WEEKLY_REPORTS);
  const q = query(
    col,
    where("userId", "==", userId),
    orderBy("generatedAt", "desc")
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0]!.data();
  return {
    ...data,
    id: snap.docs[0]!.id,
    weekOf: (data.weekOf as Timestamp).toDate(),
    generatedAt: (data.generatedAt as Timestamp).toDate(),
  } as WeeklyReport;
}

export async function saveWeeklyReport(
  report: Omit<WeeklyReport, "id">
): Promise<string> {
  const col = collection(db, COLLECTIONS.WEEKLY_REPORTS);
  const docRef = await addDoc(col, {
    ...report,
    weekOf: Timestamp.fromDate(report.weekOf),
    generatedAt: serverTimestamp(),
  });
  return docRef.id;
}
