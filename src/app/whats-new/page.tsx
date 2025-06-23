import fs from "fs";
import { notFound } from "next/navigation";
import path from "path";

export const dynamic = "force-static";

export default async function WhatsNewPage() {
  let changelog = [];
  try {
    const file = fs.readFileSync(
      path.join(process.cwd(), "public/changelog.json"),
      "utf-8"
    );
    changelog = JSON.parse(file);
  } catch {
    notFound();
  }
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">What's New</h1>
      {changelog.map((entry: any) => (
        <div key={entry.version} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-semibold text-lg">v{entry.version}</span>
            <span className="text-gray-500 text-sm">{entry.date}</span>
          </div>
          <div className="font-medium mb-1">{entry.title}</div>
          <ul className="list-disc pl-6 text-gray-800 dark:text-gray-200">
            {entry.items.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
