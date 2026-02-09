import React from 'react';

export function TasksPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Task Page Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90">
          + New Task
        </button>
      </div>

      {/* Task Page Tool Bar Section */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/10">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">View:</span>
            <select className="border rounded px-2 py-1 text-sm bg-background"><option>List</option></select>
            <button className="text-sm px-2 py-1 border rounded">Kanban</button>
            <button className="text-sm px-2 py-1 border rounded">Calendar</button>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Filter:</span>
            <select className="border rounded px-2 py-1 text-sm bg-background"><option>Status</option></select>
            <select className="border rounded px-2 py-1 text-sm bg-background"><option>Assignee</option></select>
            <select className="border rounded px-2 py-1 text-sm bg-background"><option>Priority</option></select>
          </div>
        </div>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex-1 max-w-sm">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full border rounded px-3 py-1 text-sm bg-background"
            />
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Sort:</span>
            <select className="border rounded px-2 py-1 text-sm bg-background"><option>Due Date</option></select>
          </div>
        </div>
      </div>

      {/* Task Page Content Area */}
      <div className="h-48 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
        Task content will be displayed here as per ITR1 requirements...
      </div>
    </div>
  );
}