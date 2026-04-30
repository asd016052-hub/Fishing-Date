const $ = (id) => document.getElementById(id);

const storageKey = "fishingLogCleanV1";
const pickerData = {"method": {"title": "釣法", "empty": "請選擇", "options": ["磯釣", "前打", "灘釣", "路亞", "船釣", "沉底"]}, "spotType": {"title": "釣場", "empty": "請選擇", "options": ["防波堤", "消波塊", "海蝕平臺", "沙灘", "蚵棚", "潟湖", "礁島", "近海", "遠海", "出海口"]}, "rod": {"title": "釣竿", "empty": "請選擇", "options": ["Shimano FireBlood Gure SURVEYOR 1.7", "上興 岸道二 BG MAJOR POWER", "Gamakatsu 海上釣堀 Corespec II 真鯛 青物", "前打竿", "手竿", "筏竿", "磯投竿", "無"]}, "reel": {"title": "卷線器", "empty": "請選擇", "options": ["Shimano 19 BB-X TECHNIUM FIRE BLOOD 3000DXG", "DIAWA BG MQ 8000H", "Shimano BB-X DESPINA C3000DXG ASIA EDITION", "牛車輪", "前打輪", "手線"]}, "floatType": {"title": "浮標", "empty": "請選擇", "options": ["長標", "短標", "阿波", "目印", "無"]}, "floatSize": {"title": "浮標號數", "empty": "請選擇", "options": ["000", "00", "1.0", "1.5", "2.0", "3.0", "無"]}, "foot": {"title": "絲腳", "empty": "請選擇", "options": ["單", "雙"]}, "mainLine": {"title": "母線", "empty": "請選擇", "options": ["PE", "尼龍"]}, "leader": {"title": "子線號數", "empty": "請選擇", "options": ["0.8", "1.0", "1.5", "1.7", "1.75", "2.0", "2.5", "3.0", "4.0", "16", "24", "30"]}, "hook": {"title": "鈎子", "empty": "請選擇", "options": ["千又", "小磯", "秋田狐", "伊勢尼", "丸世", "鐵板鈎"]}, "hookSize": {"title": "鈎子號數", "empty": "請選擇", "options": ["0.5", "0.8", "1.0", "2.0", "3.0", "4.0", "5.0", "6.0", "7.0", "8.0", "9.0", "12", "15", "18", "20"]}, "lure": {"title": "路亞", "empty": "請選擇", "options": ["波趴Popper", "鉛筆", "顫泳", "鐵板", "軟蟲", "無"]}, "bait": {"title": "釣餌", "empty": "請選擇", "options": ["南極蝦", "練餌", "青蟲", "赤蟲", "沙蟲", "白蝦肉", "大白蝦", "白蝦丁", "火燒蝦（狗蝦）", "沙蝦", "鬍鬚蝦", "金寶螺", "砢螅", "蚵仔", "藤壺", "海膽", "綠海草絲", "紅草", "小卷", "章魚", "白底仔", "青蚶", "紅腳仔", "丁香魚", "虱目魚", "吳郭魚", "土黃仔", "肉鰛仔", "豆仔", "鰹魚肉"]}, "tide": {"title": "潮汐", "empty": "尚未填寫", "options": ["滿潮前", "滿潮後", "退潮", "乾潮底", "漲潮", "轉流"]}};

let photoData = "";
let activePicker = "";
let tempValue = "";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function timeString() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

$("date").value = todayString();
$("time").value = timeString();

function setPickerValue(key, value) {
  const input = $(key);
  const button = document.querySelector(`[data-picker="${key}"]`);
  if (!input || !button) return;
  input.value = value || "";
  button.textContent = value || pickerData[key].empty;
}

function openPicker(key) {
  activePicker = key;
  const data = pickerData[key];
  tempValue = $(key).value || "";

  $("pickerTitle").textContent = data.title;

  const options = ["", ...data.options];
  $("wheel").innerHTML = options.map(value => {
    const label = value || data.empty;
    const selected = value === tempValue ? " selected" : "";
    return `<div class="wheel-item${selected}" data-value="${escapeAttr(value)}">${escapeHtml(label)}</div>`;
  }).join("");

  $("pickerOverlay").classList.remove("hidden");

  setTimeout(() => {
    const selected = document.querySelector(".wheel-item.selected") || document.querySelector(".wheel-item");
    if (selected) selected.scrollIntoView({ block: "center" });
    updateWheelSelection();
  }, 30);
}

function closePicker() {
  $("pickerOverlay").classList.add("hidden");
}

function updateWheelSelection() {
  const wheel = $("wheel");
  const items = Array.from(document.querySelectorAll(".wheel-item"));
  if (!items.length) return;

  const rect = wheel.getBoundingClientRect();
  const center = rect.top + rect.height / 2;

  let best = items[0];
  let bestDistance = Infinity;

  items.forEach(item => {
    const r = item.getBoundingClientRect();
    const itemCenter = r.top + r.height / 2;
    const distance = Math.abs(itemCenter - center);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = item;
    }
  });

  items.forEach(item => item.classList.remove("selected"));
  best.classList.add("selected");
  tempValue = best.dataset.value || "";
}

document.querySelectorAll(".picker-button").forEach(button => {
  button.addEventListener("click", () => openPicker(button.dataset.picker));
});

$("wheel").addEventListener("scroll", () => {
  clearTimeout(window.__wheelTimer);
  window.__wheelTimer = setTimeout(updateWheelSelection, 80);
});

$("pickerCancel").addEventListener("click", closePicker);

$("pickerDone").addEventListener("click", () => {
  if (activePicker) setPickerValue(activePicker, tempValue);
  closePicker();
});

$("photo").addEventListener("change", () => {
  const file = $("photo").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    photoData = reader.result;
    $("preview").src = photoData;
    $("preview").classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

$("useLocation").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("這台裝置不支援定位");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      $("lat").value = pos.coords.latitude.toFixed(6);
      $("lng").value = pos.coords.longitude.toFixed(6);
    },
    () => alert("無法取得位置，請確認 Safari 定位權限"),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

$("save").addEventListener("click", () => {
  const date = $("date").value;
  if (!date) {
    alert("請填日期");
    return;
  }

  const record = {
    id: String(Date.now()),
    photoData,
    date,
    time: $("time").value,
    year: Number(date.slice(0, 4)),
    month: Number(date.slice(5, 7)),
    day: Number(date.slice(8, 10)),
    spotName: $("spotName").value.trim(),
    lat: $("lat").value.trim(),
    lng: $("lng").value.trim(),
    catchName: $("catchName").value.trim(),
    weight: $("weight").value.trim(),
    note: $("note").value.trim(),
    createdAt: new Date().toISOString()
  };

  Object.keys(pickerData).forEach(key => {
    record[key] = $(key).value;
  });

  const records = loadRecords();
  records.unshift(record);
  saveRecords(records);

  alert("已儲存");
  resetForm();
  renderAll();
});

function resetForm() {
  $("photo").value = "";
  photoData = "";
  $("preview").src = "";
  $("preview").classList.add("hidden");
  $("date").value = todayString();
  $("time").value = timeString();

  Object.keys(pickerData).forEach(key => setPickerValue(key, ""));
  ["spotName","lat","lng","catchName","weight","note"].forEach(id => $(id).value = "");
}

function filteredRecords() {
  let records = loadRecords();

  const y = $("searchYear").value;
  const m = $("searchMonth").value;
  const d = $("searchDate").value;
  const fish = $("searchFish").value.trim();

  if (d) records = records.filter(r => r.date === d);
  if (y) records = records.filter(r => String(r.year) === String(y));
  if (m) records = records.filter(r => String(r.month) === String(Number(m)));
  if (fish) records = records.filter(r => (r.catchName || "").includes(fish));

  return records;
}

function mapUrl(record) {
  if (record.lat && record.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${record.lat},${record.lng}`;
  }
  if (record.spotName) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.spotName)}`;
  }
  return "";
}

function renderRecords() {
  const records = filteredRecords();
  const container = $("records");

  if (!records.length) {
    container.innerHTML = `<div class="empty">目前沒有符合的紀錄</div>`;
    return;
  }

  container.innerHTML = records.map(record => {
    const details = Object.keys(pickerData).map(key => {
      if (!record[key]) return "";
      return `<p class="meta">${escapeHtml(pickerData[key].title)}：${escapeHtml(record[key])}</p>`;
    }).join("");

    const url = mapUrl(record);

    return `
      <article class="record">
        ${record.photoData ? `<img src="${record.photoData}" alt="漁獲照片">` : ""}
        <div class="record-body">
          <h3>${escapeHtml(record.date)} ${escapeHtml(record.time || "")}</h3>
          <p class="meta">漁獲：${escapeHtml(record.catchName || "未填寫")}</p>
          <p class="meta">重量：${escapeHtml(record.weight || "未填寫")}</p>
          <p class="meta">釣點：${escapeHtml(record.spotName || "未填寫")}</p>
          ${details}
          ${record.note ? `<p>${escapeHtml(record.note)}</p>` : ""}
          ${url ? `<a class="map-link" href="${url}" target="_blank" rel="noopener">查看 Google Map 位置</a>` : ""}
          <button class="delete" type="button" onclick="deleteRecord('${record.id}')">刪除此紀錄</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderStats() {
  const records = loadRecords();
  const methodCounts = countBy(records, "method");
  const fishCounts = {};

  records.forEach(record => {
    String(record.catchName || "")
      .split(/[、,，\s]+/)
      .map(x => x.trim())
      .filter(Boolean)
      .forEach(name => {
        fishCounts[name] = (fishCounts[name] || 0) + 1;
      });
  });

  $("stats").innerHTML = `
    <div class="stat-item"><b>總紀錄數</b><br>${records.length} 筆</div>
    <div class="stat-item"><b>釣法統計</b><br>${topLines(methodCounts) || "尚無資料"}</div>
    <div class="stat-item"><b>魚種分類</b><br>${topLines(fishCounts) || "尚無資料"}</div>
  `;
}

function countBy(records, key) {
  return records.reduce((acc, record) => {
    const value = record[key] || "未填寫";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topLines(obj) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => `${escapeHtml(name)}：${count} 筆`)
    .join("<br>");
}

window.deleteRecord = function(id) {
  if (!confirm("確定刪除這筆紀錄？")) return;
  const records = loadRecords().filter(record => record.id !== id);
  saveRecords(records);
  renderAll();
};

["searchYear","searchMonth","searchDate","searchFish"].forEach(id => {
  $(id).addEventListener("input", renderAll);
});

$("clearSearch").addEventListener("click", () => {
  ["searchYear","searchMonth","searchDate","searchFish"].forEach(id => $(id).value = "");
  renderAll();
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

renderAll();
