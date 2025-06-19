import { Seo } from "../components/Seo.tsx";

export default function SharedWithMePage() {
  return (
    <>
      <Seo
        title="Shared with me"
        description="Viewing notes that others have shared with you."
      />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Shared with Me</h1>
        <p className="text-gray-600">This page will display notes shared with you.</p>
        {/* Future implementation will go here */ }
      </div>
    </>
  );
}
