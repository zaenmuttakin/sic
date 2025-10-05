const gas_id =
  "AKfycbwtUmy0ly0WbjvAdNECAJMRJv1naxxhso07NIEaPPn50sY7h-PqHh5mPRSABz-e2fLg";
const gas_url = `https://script.google.com/macros/s/${gas_id}/exec`;

export const authConfig = {
  sessionCookieName: "token",
  sessionMaxAge: 7 * 24 * 60 * 60, // 7 days
};

export async function callAppscript(param, data = {}) {
  //param data must be { nik, pass }
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));
  try {
    const res = await fetch(`${gas_url}?p=${param}`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}

export async function UseLogin(param) {
  //param data must be { nik, pass }
  const formData = new FormData();
  formData.append("data", JSON.stringify(param));
  try {
    const res = await fetch(`${gas_url}?p=login`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
export async function UseLogout(param) {
  //param data must be { nik, pass }
  const formData = new FormData();
  formData.append("data", JSON.stringify(param));
  try {
    const res = await fetch(`${gas_url}?p=logout`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
export async function verifySession(param) {
  //param data must be { nik, token }
  const formData = new FormData();
  formData.append("data", JSON.stringify(param));
  try {
    const res = await fetch(`${gas_url}?p=verifySession`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
export async function getUser(param) {
  //param data must be { nik, pass }
  const formData = new FormData();
  formData.append("data", JSON.stringify(param));
  try {
    const res = await fetch(`${gas_url}?p=getUser`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, res: error.message };
  }
}
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
