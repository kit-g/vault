import {useEffect, useState} from "react";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // This is placeholder logic — you’ll later replace it with an actual API call
    const token = localStorage.getItem("access_token");
    if (token) {
      setUserEmail("user@example.com"); // Simulate logged-in state
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg">Welcome to Vault{userEmail ? `, ${userEmail}` : ""}.</p>
      <div className="mt-8 text-sm text-gray-400">
        This is a placeholder. You'll list notes, files, and other features here.
      </div>
    </div>
  );
}
