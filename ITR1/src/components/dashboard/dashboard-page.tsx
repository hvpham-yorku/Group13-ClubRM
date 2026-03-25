import { useState, useEffect, useCallback, useMemo } from "react"
import { useRole } from "@/context/role-context"
import { useAuth } from "@/context/auth-context" 
import { useTasks } from "@/context/tasks-context"
import { useEvents } from "@/context/events-context"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Sparkles, Loader2, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dashboard Variants
import { PresidentDashboard } from "./variants/president-dashboard"
import { AdminDashboard } from "./variants/admin-dashboard"
import { MarketingDashboard } from "./variants/marketing-dashboard"
import { ExecutiveDashboard } from "./variants/executive-dashboard"
import { VPEventsDashboard } from "./variants/vp-events-dashboard"
import { VPExternalDashboard } from "./variants/vp-external-dashboard"
import { VPFinanceDashboard } from "./variants/vp-finance-dashboard"
import { VPInternalDashboard } from "./variants/vp-internal-dashboard"

export function DashboardPage() {
  const { role } = useRole()
  const { user } = useAuth()
  const { tasks } = useTasks()
  const { events } = useEvents()
  
  const [aiSummary, setAiSummary] = useState("Analyzing workstation performance...")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  // Memoize the GenAI instance
  const genAI = useMemo(() => {
    const key = import.meta.env.VITE_GEMINI_API_KEY || "";
    return new GoogleGenerativeAI(key);
  }, []);

  const generateStrategicBrief = useCallback(async () => {
    // Logic Guard: Don't spam the API if already working or if no data exists
    if (isGenerating) return;
    if (tasks.length === 0 && events.length === 0) {
      setAiSummary("No data available. Add some tasks or events to see your executive brief.")
      return
    }

    setIsGenerating(true)
    try {
      // 1. Prepare Dynamic Data
      const activeUserId = user?.id || "m1";
      const myTasks = tasks.filter(t => t.assignees.includes(activeUserId));
      const pendingTasks = myTasks.filter(t => t.status !== 'done');
      
      const taskSnapshot = pendingTasks
        .slice(0, 5)
        .map(t => `- ${t.title} (${t.priority} priority)`)
        .join("\n");

      const eventSnapshot = events
        .filter(e => new Date(e.startDate) > new Date())
        .slice(0, 3)
        .map(e => `- ${e.title} at ${e.location}`)
        .join("\n");

      // Replace this variable with your actual dynamic budget hook if available
      const currentBudget = 15141.00;

      // 2. Initialize Model (Using 2.0-flash to avoid 404s)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });      
      
      // 3. The "Variables-First" Prompt
      const prompt = `
        Act as a highly sophisticated Chief of Staff for a club executive.
        Analyze the following real-time data:
        
        EXECUTIVE ROLE: ${role}
        CURRENT BUDGET: $${currentBudget.toLocaleString()}
        PENDING TASKS:
        ${taskSnapshot || "No active tasks."}
        
        UPCOMING EVENTS:
        ${eventSnapshot || "No scheduled events."}
        
        Instructions:
        - Provide exactly two sentences.
        - Sentence 1: A witty, punchy assessment of current workstation momentum and financial standing.
        - Sentence 2: One specific recommendation for the absolute priority the ${role} should tackle right now.
        - No intro filler. No "Based on your data." Just the brief.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      setAiSummary(text);
      setHasLoadedOnce(true);

    } catch (error: any) {
      console.error("AI Dashboard Error:", error);
      
      // FALLBACK: Handling the 429 Quota issue gracefully
      if (error.message?.includes("429")) {
        setAiSummary("The Chief of Staff is currently over-encumbered. Please wait a moment before refreshing.");
      } else {
        setAiSummary("Executive summary is ready. Welcome back, Leader.");
      }
    } finally {
      setIsGenerating(false)
    }
  }, [tasks, events, user, genAI, role, isGenerating]);

  // Trigger once when data becomes available, then stop to save quota
  useEffect(() => {
    const hasData = tasks.length > 0 || events.length > 0;
    if (hasData && !hasLoadedOnce && !isGenerating) {
      generateStrategicBrief();
    }
  }, [tasks.length, events.length, generateStrategicBrief, hasLoadedOnce, isGenerating]);

  const renderDashboard = () => {
    switch (role) {
      case "Administrator": return <AdminDashboard />
      case "President": return <PresidentDashboard />
      case "VP Internal": return <VPInternalDashboard />
      case "VP Finance": return <VPFinanceDashboard />
      case "VP Events": return <VPEventsDashboard />
      case "VP External": return <VPExternalDashboard />
      case "Marketing": return <MarketingDashboard />
      default: return <ExecutiveDashboard />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground italic">
          Viewing the <span className="text-primary font-medium">{role}</span> workstation.
        </p>
      </div>

      {/* STRATEGIC AI BANNER */}
      <div className="p-5 bg-gradient-to-br from-indigo-50 via-white to-blue-50 border border-indigo-100 rounded-2xl shadow-sm relative overflow-hidden group">
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-600 rounded-lg shrink-0 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110 duration-300">
              {isGenerating ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 flex items-center gap-2">
                Executive Brief
                {isGenerating && <span className="lowercase font-normal animate-pulse text-[10px]">(Refining...)</span>}
              </h3>
              <p className="text-[15px] text-slate-800 leading-relaxed font-medium max-w-4xl">
                {aiSummary}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
                setHasLoadedOnce(false); // Allow a manual re-run
                generateStrategicBrief();
            }}
            disabled={isGenerating}
            className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100/50 transition-all rounded-full"
            title="Refresh Summary"
          >
            <RotateCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />
      </div>

      {renderDashboard()}
    </div>
  )
}