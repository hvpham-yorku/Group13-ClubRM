/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { createClient } from '@supabase/supabase-js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'dashboard-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/dashboard/stats') {
              try {
                // Extract token from Authorization header (Node.js request object has lowercase keys)
                const authHeader = req.headers['authorization'];
                const token = authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ') 
                  ? authHeader.split(' ')[1] 
                  : null;

                const supabaseUrl = env.VITE_SUPABASE_URL || ""
                const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || ""
                const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                  global: {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                  }
                })

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
              const onTrackEvents = eventsData ? eventsData.filter((e: any) => {
                if (e.status === "confirmed") return true;
                if (e.capacity && e.registered && (e.registered / e.capacity) >= 0.5) return true;
                return false;
              }).length : 0;

              const stats = {
                members: totalMembers || 0,
                activeMembers: activeMembers || 0,
                totalBudget,
                spentBudget,
                onTrackEvents,
                totalEvents,
                completedTasks: completedTasks || 0,
                totalTasks: totalTasks || 0,
              };
              
              const memberWeight = 0.3;
              const budgetWeight = 0.3;
              const eventWeight = 0.2;
              const taskWeight = 0.2;
              const memberScore = stats.members > 0 ? (stats.activeMembers / stats.members) * 100 : 100;
              const budgetRatio = stats.totalBudget > 0 ? stats.spentBudget / stats.totalBudget : 0;
              const budgetScore = budgetRatio <= 1 ? (1 - budgetRatio) * 100 : Math.max(0, 100 - (budgetRatio - 1) * 200);
              const eventScore = stats.totalEvents > 0 ? (stats.onTrackEvents / stats.totalEvents) * 100 : 100;
              const taskScore = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 100;
              const totalScore = Math.round((memberScore * memberWeight) + (budgetScore * budgetWeight) + (eventScore * eventWeight) + (taskScore * taskWeight));

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ stats, score: totalScore }));
            } catch (err) {
              console.error("Vite Middleware API Error:", err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: "Failed to fetch stats from Supabase" }));
            }
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    allowedHosts: [".ngrok-free.dev"]
  },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: "jsdom",
      include: ["test/**/*.test.{ts,tsx}"],
    },
  }
})
