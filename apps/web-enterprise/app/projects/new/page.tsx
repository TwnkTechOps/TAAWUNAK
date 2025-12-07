import NewProjectFormBasic from "components/projects/NewProjectFormBasic";

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="title-lg mb-2">Create New Project</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">Fill the basic details to create your project.</p>
      <div className="mt-2">
        <NewProjectFormBasic />
      </div>
    </main>
  );
}
