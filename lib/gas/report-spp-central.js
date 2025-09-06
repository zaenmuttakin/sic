const gas_id =
  "AKfycbza5XVqGrgQvVrXxcgFJdkEXOCu4jWD3FPcQpKJrFwLuvp5NRWLj9iQ9xT9rV5p-mOl";
const gas_url = `https://script.google.com/macros/s/${gas_id}/exec`;

export async function getMonitor(params) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(params));
  try {
    const res = await fetch(`${gas_url}?p=getMonitor`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
