import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Personal Finance App
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage your finances with powerful calculators and planning tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Next.js 14</CardTitle>
              <CardDescription>
                The React framework for production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Built with the latest Next.js features including App Router, Server Components, and more.
              </p>
            </CardContent>
          </Card>
    
          <Card>
            <CardHeader>
              <CardTitle>Tailwind CSS</CardTitle>
              <CardDescription>
                Utility-first CSS framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Rapidly build modern websites with utility classes and responsive design.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Tools</CardTitle>
              <CardDescription>
                Comprehensive financial calculators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Mortgage calculators, loan planners, and financial planning tools.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive Button</Button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Start building your application by editing{" "}
            <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-sm">
              src/app/page.tsx
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
