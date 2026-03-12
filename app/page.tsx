import Header from "@/components/design/header"
import LeftNav from "@/components/design/left-nav"
import RightSidebar from "@/components/design/right-sidebar"
import CanvasStage from "@/components/design/canvas-stage"
import { Footer } from "@/components/design/footer"
import AuthGuard from "@/components/auth-guard"

export default function DesignPage() {
  return (
    <AuthGuard>
      <main className="min-h-dvh bg-background text-foreground">
        <Header />
        <div className="grid grid-cols-[80px_1fr_360px] gap-0 border-t border-border pb-20">
          <aside className="border-r border-border">
            <LeftNav />
          </aside>
          <section className="relative">
            <CanvasStage />
          </section>
          <aside className="border-l border-border">
            <RightSidebar />
          </aside>
        </div>
        <Footer />
      </main>
    </AuthGuard>
  )
}