const output = document.getElementById('output');
const input = document.getElementById('input');

function log(text) {
  output.textContent += text + "\n";
  output.scrollTop = output.scrollHeight;
}

let dirHandle = null;

async function requestDirAccess() {
  dirHandle = await window.showDirectoryPicker();
  log("フォルダアクセスが有効");
}

async function writeFile(name, content) {
  if (!dirHandle) return log("フォルダ未許可です。まず 'lw grant' を実行してください。");
  const fileHandle = await dirHandle.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
  log(`💾 ${name} に書き込みしました`);
}

async function handleCommand(cmd) {
  log(`> ${cmd}`);
  if (!cmd.startsWith("lw")) return log("The command must start with lw.");

  if (cmd === "lw grant") {
    await requestDirAccess();
  }
  else if (cmd.startsWith("lw neW_FOLDA")) {
    const match = cmd.match(/name="(.+?)"/);
    if (!match) return log("name指定が必要です");
    const name = match[1];
    await dirHandle.getDirectoryHandle(name, { create: true });
    log(`フォルダ '${name}' 作成完了`);
  }
  else if (cmd.startsWith("lw neW_FILE")) {
    const match = cmd.match(/name="(.+?)"/);
    if (!match) return log("name指定が必要です");
    const name = match[1];
    await writeFile(name, "");
  }
  else if (cmd.startsWith("lw writE FILE")) {
    const match = cmd.match(/name="(.+?)"/);
    if (!match) return log("name指定が必要です");
    const name = match[1];
    const content = prompt(`${name} に書き込む内容を入力:`);
    await writeFile(name, content);
  }
  else if (cmd.startsWith("lw FILE")) {
    const match = cmd.match(/name="(.+?)"/);
    if (!match) return log("name指定が必要です");
    const name = match[1];
    const fileHandle = await dirHandle.getFileHandle(name);
    const file = await fileHandle.getFile();
    const text = await file.text();
    log(`📖 ${name} の内容:\n${text}`);
  }
  else if (cmd.startsWith("lw deletE_FILE")) {
    const match = cmd.match(/name="(.+?)"/);
    if (!match) return log("name指定が必要です");
    await dirHandle.removeEntry(match[1]);
    log(`🗑️ ${match[1]} を削除しました`);
  }
  else if (cmd.startsWith("lw connect")) {
    const match = cmd.match(/lw connect (https?:\/\/[^\s]+)/);
    if (!match) return log("URL指定が必要です");
    const res = await fetch("https://your-worker.yourname.workers.dev/connect?url=" + encodeURIComponent(match[1]));
    const text = await res.text();
    log(`接続結果:\n${text}`);
  }
  else if (cmd === "lw Device_IP") {
    const res = await fetch("https://your-worker.yourname.workers.dev/ip");
    const ip = await res.text();
    log(`IP: ${ip}`);
  }
  else {
    log("未知のコマンドです。");
  }
}

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    input.value = '';
    handleCommand(cmd);
  }
});
