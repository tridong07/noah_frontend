export const handleAuthRequest = async (endpoint: string, body: any) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${baseUrl}/auth/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
};