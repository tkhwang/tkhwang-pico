export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome to TKHwang Pico</h2>
        <p className="text-muted-foreground mt-2">
          This is your dashboard with a modern sidebar navigation powered by shadcn/ui.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">
            Access frequently used features and actions from here.
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            View your recent activities and updates.
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Statistics</h3>
          <p className="text-sm text-muted-foreground">
            Monitor your key metrics and performance indicators.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Getting Started</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary"></span>
            Use the sidebar navigation to explore different sections
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary"></span>
            Click the menu button or press Cmd/Ctrl + B to toggle the sidebar
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary"></span>
            The sidebar is responsive and works on all device sizes
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary"></span>
            Your sidebar state is preserved across sessions
          </li>
        </ul>
      </div>
    </div>
  );
}
