import { createClient } from "@supabase/supabase-js";
import { calculateHealthScore, OrgStats } from "../src/lib/dashboard-logic";

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export default async function handler(req: any, res: any) {
  try {
    // Extract access token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    // Create a Supabase client with the user's JWT
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });

    // 1. Fetch Member Counts
    const { count: totalMembers } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });
    
    const { count: activeMembers } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // 2. Fetch Budget & Expenses
    const { data: budgetData } = await supabase
      .from("budgets")
      .select("total_budget")
      .limit(1)
      .single();
    
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("amount")
      .eq("status", "approved");

    const totalBudget = budgetData ? Number(budgetData.total_budget) : 18000;
    const spentBudget = expensesData ? expensesData.reduce((sum, e) => sum + Number(e.amount), 0) : 0;

    // 3. Fetch Tasks
    const { count: totalTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true });
    
    const { count: completedTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "done");

    // 4. Fetch Events for On-Track Logic
    const { data: eventsData } = await supabase
      .from("events")
      .select("registered, capacity, status");

    const totalEvents = eventsData ? eventsData.length : 0;
    const onTrackEvents = eventsData ? eventsData.filter(e => {
      if (e.status === "confirmed") return true;
      if (e.capacity && e.registered && (e.registered / e.capacity) >= 0.5) return true;
      return false;
    }).length : 0;

    // 5. Consolidate into OrgStats
    const stats: OrgStats = {
      members: totalMembers || 0,
      activeMembers: activeMembers || 0,
      totalBudget,
      spentBudget,
      onTrackEvents,
      totalEvents,
      completedTasks: completedTasks || 0,
      totalTasks: totalTasks || 0,
    };

    const score = calculateHealthScore(stats);

    res.status(200).json({ stats, score });
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
