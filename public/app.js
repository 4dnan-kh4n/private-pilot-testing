const draftKey = "applicationDraft";

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function detailMarkup(data) {
  const account = data.accountNumber;
  return `<dl><div><dt>Name</dt><dd>${escapeHtml(data.name)}</dd></div><div><dt>Age</dt><dd>${escapeHtml(data.age)}</dd></div><div><dt>Account</dt><dd>${escapeHtml(account)}</dd></div></dl>`;
}

const registrationForm = document.querySelector("#registrationForm");
if (registrationForm) {
  const existing = JSON.parse(localStorage.getItem(draftKey) || "null");
  if (existing) {
    registrationForm.name.value = existing.name || "";
    registrationForm.age.value = existing.age || "";
    registrationForm.accountNumber.value = existing.accountNumber || "";
  }
  registrationForm.addEventListener("submit", event => {
    event.preventDefault();
    const message = document.querySelector("#formMessage");
    if (!registrationForm.reportValidity()) return;
    const accountNumber = registrationForm.accountNumber.value.replace(/\s|-/g, "");
    if (!/^\d{6,18}$/.test(accountNumber)) {
      message.textContent = "Enter 6–18 digits for the demo account number.";
      return;
    }
    localStorage.setItem(draftKey, JSON.stringify({
      name: registrationForm.name.value.trim(),
      age: Number(registrationForm.age.value),
      accountNumber
    }));
    location.href = "moreDetails.html";
  });
}

const storedDetails = document.querySelector("#storedDetails");
if (storedDetails) {
  const draft = JSON.parse(localStorage.getItem(draftKey) || "null");
  if (!draft) {
    storedDetails.innerHTML = '<p class="empty">No saved details found. Please complete step one first.</p>';
    document.querySelector("#validateButton").disabled = true;
  } else {
    storedDetails.innerHTML = detailMarkup(draft);
    document.querySelector("#validateButton").addEventListener("click", async event => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = "Validating…";
      try {
        const response = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft)
        });
        const saved = await response.json();
        if (!response.ok) throw new Error(saved.message);
        localStorage.removeItem(draftKey);
        location.href = saved.shareUrl;
      } catch (error) {
        button.disabled = false;
        button.textContent = "Validate details";
        alert(error.message || "Could not validate the details.");
      }
    });
  }

  const reason = document.querySelector("#hireReason");
  reason.addEventListener("input", () => document.querySelector("#count").textContent = reason.value.length);
  document.querySelector("#reasonForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const id = sessionStorage.getItem("currentApplicationId");
    const message = document.querySelector("#submitMessage");
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hireReason: reason.value.trim() })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      message.className = "message success";
      message.innerHTML = `${escapeHtml(result.message)} <a href="records.html">View global records →</a>`;
      form.querySelector("button").disabled = true;
      reason.disabled = true;
    } catch (error) { message.textContent = error.message; }
  });
}

const sharedDetails = document.querySelector("#sharedDetails");
if (sharedDetails) {
  const token = new URLSearchParams(location.search).get("token");
  const shareInput = document.querySelector("#shareUrl");
  shareInput.value = location.href;
  document.querySelector("#copyLink").addEventListener("click", async () => {
    await navigator.clipboard.writeText(location.href);
    document.querySelector("#copyLink").textContent = "Copied!";
  });
  if (!token) {
    sharedDetails.innerHTML = '<p class="message">This shared link is invalid.</p>';
    document.querySelector("#sharedReasonForm").hidden = true;
  } else {
    fetch(`/api/shared-applications/${encodeURIComponent(token)}`).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      sharedDetails.innerHTML = detailMarkup(data);
      if (data.hireReason) {
        document.querySelector("#hireReason").value = data.hireReason;
        document.querySelector("#count").textContent = data.hireReason.length;
      }
    }).catch(error => {
      sharedDetails.innerHTML = `<p class="message">${escapeHtml(error.message)}</p>`;
      document.querySelector("#sharedReasonForm").hidden = true;
    });
    const reason = document.querySelector("#hireReason");
    reason.addEventListener("input", () => document.querySelector("#count").textContent = reason.value.length);
    document.querySelector("#sharedReasonForm").addEventListener("submit", async event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      const response = await fetch(`/api/shared-applications/${encodeURIComponent(token)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hireReason: reason.value.trim() })
      });
      const result = await response.json();
      const message = document.querySelector("#sharedMessage");
      message.textContent = result.message;
      message.className = `message${response.ok ? " success" : ""}`;
    });
  }
}

const records = document.querySelector("#records");
if (records) {
  fetch("/api/applications").then(async response => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    if (!data.length) return records.innerHTML = '<p class="empty">No applications have been validated yet.</p>';
    records.innerHTML = data.map(item => `<article><div><span class="record-id">#${item.id}</span><h2>${escapeHtml(item.name)}</h2><p>Age ${item.age} · Demo account ${escapeHtml(item.accountNumber)}</p></div><span class="status">${item.hireReason ? "Submitted" : "Validated"}</span>${item.hireReason ? `<blockquote>${escapeHtml(item.hireReason)}</blockquote>` : ""}</article>`).join("");
  }).catch(error => records.innerHTML = `<p class="message">${escapeHtml(error.message)}</p>`);
}
