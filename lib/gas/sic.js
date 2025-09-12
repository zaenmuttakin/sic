const gas_id =
  "AKfycbzXz3sG6_QLAwyGbnNL2QUt6f8Nr5Ise9qeVQ8bz6-GoKC17gAMoa0RgW58N5FRjyyj";
const gas_url = `https://script.google.com/macros/s/${gas_id}/exec`;

export async function checkUpdateReportSpp() {
  const formData = new FormData();
  // formData.append("data", JSON.stringify(params));
  try {
    const res = await fetch(`${gas_url}?p=checkUpdateReportSpp`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
export async function getPendingDiffSo() {
  const formData = new FormData();
  // formData.append("data", JSON.stringify(params));
  try {
    const res = await fetch(`${gas_url}?p=getPendingDiffSo`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
export async function getTabungBsg() {
  const formData = new FormData();
  // formData.append("data", JSON.stringify(params));
  try {
    const res = await fetch(`${gas_url}?p=getTabungBsg`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
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
