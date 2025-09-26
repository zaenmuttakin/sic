const gas_id =
  "AKfycbzszGYvUMzUxvz8X8cB8thWviPYg3GvEudWpOJBhmI_KueIbiHVTf2uoZP004mNyK7T";
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
export async function getCheckBin(params) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(params));
  try {
    const res = await fetch(`${gas_url}?p=checkBin`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
export async function getAddBin(params) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(params));
  try {
    const res = await fetch(`${gas_url}?p=addBin`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
