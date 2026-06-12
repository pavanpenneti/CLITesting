import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/config";
import {
  collection, addDoc, onSnapshot, orderBy,
  query, serverTimestamp, deleteDoc, updateDoc, doc,
} from "firebase/firestore";

// ── helpers ───────────────────────────────────────────────────────
const isImage = (n = "") => /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(n);
const isVideo = (n = "") => /\.(mp4|webm|ogg|mov)$/i.test(n);
const isJson  = (n = "") => /\.json$/i.test(n);
const isTxt   = (n = "") => /\.txt$/i.test(n);

const ALLOWED_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|bmp|json|txt|crt|key|dfu|dnl\.dfu|mnt|py)$/i;
const MAX_BYTES = 900_000;

const formatBytes = (b) => {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

const fileIcon = (n = "") => {
  if (isImage(n)) return "🖼️";
  if (isVideo(n)) return "🎬";
  if (isJson(n))  return "📋";
  if (isTxt(n))   return "📝";
   if (/\.py$/i.test(n))          return "🐍";
  if (/\.(crt|key)$/i.test(n))   return "🔐";
  if (/\.(dfu|dnl\.dfu)$/i.test(n)) return "⚙️";
  if (/\.mnt$/i.test(n))         return "💾";
  if (/\.pdf$/i.test(n)) return "📕";
  if (/\.(doc|docx)$/i.test(n)) return "📘";
  if (/\.(xls|xlsx)$/i.test(n)) return "📗";
  if (/\.(zip|rar|7z)$/i.test(n)) return "🗜️";
  return "📄";
};

const parseTabData = (text) => {
  if (!text || !text.includes("\t")) return null;
  const rows = text.trim().split("\n").map((r) => r.split("\t"));
  if (rows.length < 1 || rows[0].length < 2) return null;
  return rows;
};

const tryPrettyJson = (str = "") => {
  try { return JSON.stringify(JSON.parse(str), null, 2); }
  catch { return null; }
};

// ── validate a single File object ────────────────────────────────
const validateFile = (file) => {
  if (!ALLOWED_EXTENSIONS.test(file.name))
    return `"${file.name}" is not allowed. Only images, JSON, and TXT.`;
  if (file.size > MAX_BYTES)
    return `"${file.name}" is too large (${formatBytes(file.size)}). Max 900 KB.`;
  return null;
};

// ── read a File as text or dataURL ────────────────────────────────
const readFile = (file, mode = "text") =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target.result);
    r.onerror = () => reject(new Error("Failed to read " + file.name));
    if (mode === "text") r.readAsText(file);
    else r.readAsDataURL(file);
  });

// ── download helper from base64 / dataURL ────────────────────────
const downloadFile = (dataOrUrl, name) => {
  const a = document.createElement("a");
  a.href = dataOrUrl;
  a.download = name;
  a.click();
};

// ── ContentRenderer ───────────────────────────────────────────────
function ContentRenderer({ content, fileName }) {
  const rows = parseTabData(content);
  if (rows) {
    const headers = rows[0];
    const body = rows.slice(1);
    return (
      <div style={{ overflowX: "auto", marginTop: 4 }}>
        <table style={ts.table}>
          <thead>
            <tr>{headers.map((h, i) => <th key={i} style={ts.th}>{h || " "}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} style={ri % 2 === 0 ? ts.trEven : ts.trOdd}>
                {headers.map((_, ci) => <td key={ci} style={ts.td}>{row[ci] ?? ""}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={ts.hint}>📊 {rows.length - 1} rows × {headers.length} columns</p>
      </div>
    );
  }

  const pretty = isJson(fileName) ? tryPrettyJson(content) : null;
  if (pretty) {
    return (
      <pre style={{ ...ts.pre, backgroundColor: "#1e1e2e", color: "#cdd6f4", borderRadius: 8, padding: 12 }}>
        {pretty}
      </pre>
    );
  }

  if (/\.(py|crt|key|dfu|mnt)$/i.test(fileName)) {
    return (
      <pre style={{ ...ts.pre, backgroundColor: "#1e1e2e", color: "#cdd6f4", borderRadius: 8, padding: 12 }}>
        {content}
      </pre>
    );
  }

  return <pre style={ts.pre}>{content}</pre>;
}

const ts = {
  table: { borderCollapse: "collapse", width: "100%", fontSize: 13, fontFamily: "Arial, sans-serif" },
  th: { backgroundColor: "#1976d2", color: "#fff", padding: "8px 12px", textAlign: "left", fontWeight: 600, border: "1px solid #1565c0", whiteSpace: "nowrap" },
  td: { padding: "7px 12px", border: "1px solid #e0e0e0", color: "#333", whiteSpace: "nowrap" },
  trEven: { backgroundColor: "#fff" },
  trOdd: { backgroundColor: "#f3f8ff" },
  pre: { margin: 0, fontSize: 13, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#333", backgroundColor: "#f5f5f5", padding: 10, borderRadius: 6 },
  hint: { margin: "6px 0 0", fontSize: 11, color: "#aaa" },
};

// ── CopyBtn ───────────────────────────────────────────────────────
function CopyBtn({ text, btnStyle }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button style={{ ...s.iconBtn, ...(btnStyle || {}), color: copied ? "#43a047" : undefined }}
      title="Copy content" onClick={copy}>
      {copied ? "✅" : "📋"}
    </button>
  );
}

// ── UploadQueue item ──────────────────────────────────────────────
// { file, name, status: "pending"|"uploading"|"done"|"error", error }
function QueueItem({ item, onRemove, onRename }) {
  const hasErr = item.status === "error";
  const isDone = item.status === "done";
  const isUp   = item.status === "uploading";
  const bg = isDone ? "#e8f5e9" : hasErr ? "#ffebee" : "#f9f9f9";
  const border = isDone ? "#c8e6c9" : hasErr ? "#ffcdd2" : "#e0e0e0";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, backgroundColor: bg, border: `1px solid ${border}`, fontSize: 13 }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{fileIcon(item.file.name)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          style={{ width: "100%", border: "none", background: "transparent", fontSize: 13, fontWeight: 600, color: "#333", outline: "none", boxSizing: "border-box" }}
          value={item.name}
          disabled={isUp || isDone}
          onChange={(e) => onRename(e.target.value)}
          title="Edit display name"
        />
        <div style={{ fontSize: 11, color: hasErr ? "#c62828" : "#999", marginTop: 1 }}>
          {hasErr ? item.error : isDone ? "✓ Saved" : isUp ? "Saving…" : formatBytes(item.file.size)}
        </div>
      </div>
      {item.status === "pending" && (
        <button style={{ ...s.noBtn, padding: "2px 8px", fontSize: 12 }} onClick={onRemove} title="Remove">✕</button>
      )}
      {isDone && <span style={{ color: "#43a047", fontSize: 16 }}>✅</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
export default function GeneratePhotos() {

  // ── folder state ──────────────────────────────────────────────
  const [allFolders, setAllFolders] = useState([]);
  const [allFiles,   setAllFiles]   = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [newFolderName, setNewFolderName]     = useState("");
  const [editFolderId, setEditFolderId]       = useState(null);
  const [editFolderName, setEditFolderName]   = useState("");

  // ── text-file state ───────────────────────────────────────────
  const [tab, setTab]                   = useState("text");
  const [newFileName, setNewFileName]   = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [pastePreview, setPastePreview] = useState(null);

  // ── upload queue state ────────────────────────────────────────
  const [queue, setQueue]         = useState([]); // array of QueueItem data
  const [uploading, setUploading] = useState(false);
  const [queueErrors, setQueueErrors] = useState([]);
  const fileInputRef = useRef();

  // ── file view / edit state ────────────────────────────────────
  const [editFileId, setEditFileId]           = useState(null);
  const [editFileContent, setEditFileContent] = useState("");
  const [openFileId, setOpenFileId]           = useState(null);
  const [editFileNameId, setEditFileNameId]   = useState(null);
  const [editFileNameValue, setEditFileNameValue] = useState("");
  const [lightbox, setLightbox]               = useState(null);

  // ── auth / delete modal ───────────────────────────────────────
  const [authModal, setAuthModal]     = useState(false);
  const [authUser, setAuthUser]       = useState("");
  const [authPass, setAuthPass]       = useState("");
  const [authError, setAuthError]     = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  // ── Firestore listeners ───────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "folders"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) =>
      setAllFolders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  useEffect(() => {
    const q = query(collection(db, "files"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) =>
      setAllFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const childFolders = allFolders.filter((f) => (f.parentId ?? null) === currentFolderId);
  const currentFiles = allFiles.filter((f) => (f.folderId ?? null) === currentFolderId);
  const photos       = currentFiles.filter((f) => f.type === "upload" && isImage(f.name));
  const otherFiles   = currentFiles.filter((f) => !(f.type === "upload" && isImage(f.name)));

  // ── navigation ────────────────────────────────────────────────
  const openFolder = (folder) => {
    setBreadcrumb((p) => [...p, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
    resetUI();
  };
  const goToBreadcrumb = (index) => {
    if (index === -1) { setBreadcrumb([]); setCurrentFolderId(null); }
    else { setBreadcrumb((p) => p.slice(0, index + 1)); setCurrentFolderId(breadcrumb[index].id); }
    resetUI();
  };
  const resetUI = () => {
    setEditFileId(null); setOpenFileId(null);
    setEditFolderId(null); setEditFileNameId(null);
  };

  // ── auth helpers ──────────────────────────────────────────────
  const requestDelete = (type, payload) => {
    setPendingDelete({ type, payload });
    setAuthModal(true);
    setAuthUser(""); setAuthPass(""); setAuthError("");
  };
  const confirmDelete = async () => {
    if (authUser.trim() !== "pavan" || authPass !== "pavancycle") {
      setAuthError("Incorrect username or password!"); return;
    }
    setAuthModal(false); setAuthError("");
    if (!pendingDelete) return;
    const { type, payload } = pendingDelete;
    setPendingDelete(null);
    if (type === "folder") {
      await deleteFolderRecursive(payload.id);
      if (currentFolderId === payload.id) {
        const parent = breadcrumb[breadcrumb.length - 2];
        setBreadcrumb((p) => p.slice(0, -1));
        setCurrentFolderId(parent?.id ?? null);
      }
    }
    if (type === "file" || type === "photo") {
      await deleteDoc(doc(db, "files", payload.id));
      if (openFileId === payload.id) setOpenFileId(null);
    }
  };
  const cancelDelete = () => { setAuthModal(false); setAuthError(""); setPendingDelete(null); };

  // ── folder CRUD ───────────────────────────────────────────────
  const createFolder = async () => {
    if (!newFolderName.trim()) return alert("Enter a folder name!");
    await addDoc(collection(db, "folders"), {
      name: newFolderName.trim(), parentId: currentFolderId, createdAt: serverTimestamp(),
    });
    setNewFolderName("");
  };
  const saveFolder = async (id) => {
    if (!editFolderName.trim()) return;
    await updateDoc(doc(db, "folders", id), { name: editFolderName.trim() });
    setEditFolderId(null);
  };
  const deleteFolderRecursive = async (folderId) => {
    const children = allFolders.filter((f) => f.parentId === folderId);
    for (const child of children) await deleteFolderRecursive(child.id);
    const filesInFolder = allFiles.filter((f) => f.folderId === folderId);
    for (const file of filesInFolder) await deleteDoc(doc(db, "files", file.id));
    await deleteDoc(doc(db, "folders", folderId));
  };

  // ── file name rename ──────────────────────────────────────────
  const saveFileName = async (id) => {
    if (!editFileNameValue.trim()) return alert("File name cannot be empty!");
    await updateDoc(doc(db, "files", id), { name: editFileNameValue.trim(), updatedAt: serverTimestamp() });
    setEditFileNameId(null); setEditFileNameValue("");
  };

  // ── text file CRUD ────────────────────────────────────────────
  const createTextFile = async () => {
    if (!newFileName.trim()) return alert("Enter a file name!");
    if (!newFileContent.trim()) return alert("Enter some content!");
    const isTable = !!parseTabData(newFileContent);
    await addDoc(collection(db, "files"), {
      name: newFileName.trim(), content: newFileContent.trim(),
      contentType: isTable ? "table" : "text", type: "text",
      folderId: currentFolderId, createdAt: serverTimestamp(),
    });
    setNewFileName(""); setNewFileContent(""); setPastePreview(null);
  };
  const saveEditFile = async (id) => {
    if (!editFileContent.trim()) return;
    const isTable = !!parseTabData(editFileContent);
    await updateDoc(doc(db, "files", id), {
      content: editFileContent.trim(), contentType: isTable ? "table" : "text",
      updatedAt: serverTimestamp(),
    });
    setEditFileId(null);
  };

  // ── multi-file queue management ───────────────────────────────
  const handleFilesSelected = (fileList) => {
    const files = Array.from(fileList);
    const errors = [];
    const valid = [];
    files.forEach((f) => {
      const err = validateFile(f);
      if (err) errors.push(err);
      else valid.push({ file: f, name: f.name, status: "pending", error: null, id: `${f.name}-${Date.now()}-${Math.random()}` });
    });
    setQueueErrors(errors);
    setQueue((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFromQueue = (id) => setQueue((prev) => prev.filter((q) => q.id !== id));

  const renameInQueue = (id, name) =>
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, name } : q));

  const clearDoneQueue = () => setQueue((prev) => prev.filter((q) => q.status !== "done"));

  const handleUploadAll = async () => {
    const pending = queue.filter((q) => q.status === "pending");
    if (!pending.length) return;
    setUploading(true);

    for (const item of pending) {
      // mark uploading
      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "uploading" } : q));
      try {
        const isTextType = isJson(item.file.name) || isTxt(item.file.name)
  || /\.(crt|key|dfu|mnt|py)$/i.test(item.file.name);
        const data = await readFile(item.file, isTextType ? "text" : "dataURL");
        const fileData = isTextType
          ? { content: data, contentType: isJson(item.file.name) ? "json" : "text", type: "text", url: null }
          : { url: data, content: null, contentType: "image", type: "upload" };

        await addDoc(collection(db, "files"), {
          name: item.name.trim() || item.file.name,
          ...fileData,
          storagePath: null,
          fileType: item.file.type,
          size: item.file.size,
          folderId: currentFolderId,
          createdAt: serverTimestamp(),
        });
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "done" } : q));
      } catch (err) {
        setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: "error", error: err.message } : q));
      }
    }
    setUploading(false);
  };

  // drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleContentChange = (val) => {
    setNewFileContent(val);
    setPastePreview(parseTabData(val));
  };

  const getCopyText = (file) => file.type === "text" ? (file.content ?? "") : (file.url ?? "");

  const pendingCount = queue.filter((q) => q.status === "pending").length;
  const doneCount    = queue.filter((q) => q.status === "done").length;

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div style={s.overlay} onClick={() => setLightbox(null)}>
          <div style={s.lightbox} onClick={(e) => e.stopPropagation()}>
            <button style={s.lbClose} onClick={() => setLightbox(null)}>✕</button>
            {isImage(lightbox.name)
              ? <img src={lightbox.url} alt={lightbox.name} style={s.lbImg} />
              : isVideo(lightbox.name)
              ? <video src={lightbox.url} controls style={s.lbImg} />
              : <div style={s.lbFile}><p style={{ fontSize: 48, margin: 0 }}>{fileIcon(lightbox.name)}</p><p>{lightbox.name}</p></div>
            }
            <p style={s.lbName}>{lightbox.name}</p>
          </div>
        </div>
      )}

      {/* ── Auth / Delete Modal ── */}
      {authModal && (
        <div style={s.overlay} onClick={cancelDelete}>
          <div style={s.authModal} onClick={(e) => e.stopPropagation()}>
            <div style={s.authIconWrap}><span style={s.authIcon}>🔐</span></div>
            <h3 style={s.authTitle}>Confirm Delete</h3>
            <p style={s.authSubtitle}>
              Enter your credentials to permanently delete{" "}
              <strong>{pendingDelete?.type === "folder" ? `"${pendingDelete.payload.name}" folder` : `"${pendingDelete?.payload?.name}"`}</strong>.
            </p>
            <label style={s.authLabel}>Username</label>
            <input style={s.authInput} placeholder="Enter username" value={authUser} autoFocus
              onChange={(e) => { setAuthUser(e.target.value); setAuthError(""); }}
              onKeyDown={(e) => e.key === "Enter" && confirmDelete()} />
            <label style={s.authLabel}>Password</label>
            <input style={s.authInput} type="password" placeholder="Enter password" value={authPass}
              onChange={(e) => { setAuthPass(e.target.value); setAuthError(""); }}
              onKeyDown={(e) => e.key === "Enter" && confirmDelete()} />
            {authError && <div style={s.authError}><span>❌</span> {authError}</div>}
            <div style={s.authBtns}>
              <button style={s.authCancelBtn} onClick={cancelDelete}>✖ Cancel</button>
              <button style={s.authConfirmBtn} onClick={confirmDelete}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div style={s.breadcrumb}>
        <span style={s.crumb} onClick={() => goToBreadcrumb(-1)}>🏠 Home</span>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.id} style={s.crumbWrap}>
            <span style={s.sep}> / </span>
            <span
              style={{ ...s.crumb, ...(i === breadcrumb.length - 1 ? s.crumbActive : {}) }}
              onClick={() => goToBreadcrumb(i)}
            >{crumb.name}</span>
          </span>
        ))}
      </div>

      {/* ── New Folder Row ── */}
      <div style={s.newFolderRow}>
        <input style={s.input} placeholder="New folder name…" value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createFolder()} />
        <button style={s.addBtn} onClick={createFolder}>📁 New Folder</button>
      </div>

      {/* ── Folders Grid ── */}
      {childFolders.length > 0 && (
        <>
          <p style={s.sectionLabel}>FOLDERS</p>
          <div style={s.folderGrid}>
            {childFolders.map((folder) => (
              <div key={folder.id} style={s.folderCard}>
                <div style={s.folderCardTop}>
                  <span style={{ fontSize: 36, cursor: "pointer" }} onClick={() => openFolder(folder)}>📁</span>
                  <div style={s.rowBtns}>
                    <button style={s.iconBtn} title="Rename" onClick={() => { setEditFolderId(folder.id); setEditFolderName(folder.name); }}>✏️</button>
                    <button style={s.iconBtn} title="Delete" onClick={() => { setEditFolderId(null); requestDelete("folder", folder); }}>🗑️</button>
                  </div>
                </div>
                {editFolderId === folder.id ? (
                  <div style={{ padding: "0 8px 8px" }}>
                    <input style={s.inlineInput} value={editFolderName} autoFocus
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveFolder(folder.id); if (e.key === "Escape") setEditFolderId(null); }} />
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button style={s.yesBtn} onClick={() => saveFolder(folder.id)}>💾</button>
                      <button style={s.noBtn} onClick={() => setEditFolderId(null)}>✖</button>
                    </div>
                  </div>
                ) : (
                  <p style={s.folderCardName} onClick={() => openFolder(folder)}>{folder.name}</p>
                )}
                <p style={s.folderMeta}>
                  {allFolders.filter((f) => f.parentId === folder.id).length} folder(s) ·{" "}
                  {allFiles.filter((f) => f.folderId === folder.id).length} file(s)
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Add File Tabs ── */}
      <p style={s.sectionLabel}>ADD FILE</p>
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(tab === "text" ? s.tabActive : {}) }} onClick={() => setTab("text")}>📝 Text / Table</button>
        <button style={{ ...s.tab, ...(tab === "upload" ? s.tabActive : {}) }} onClick={() => setTab("upload")}>
          📎 Upload {queue.length > 0 && <span style={s.queueBadge}>{queue.length}</span>}
        </button>
      </div>

      {/* ── Text file form ── */}
      {tab === "text" && (
        <div style={s.formBox}>
          <input style={s.input} placeholder="File name…" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
          <textarea style={s.textarea} placeholder="Enter data here…" value={newFileContent}
            onChange={(e) => handleContentChange(e.target.value)} rows={6} />
          {newFileContent.trim() && (
            <div style={s.previewBox}>
              <p style={s.previewLabel}>{pastePreview ? "📊 Table Preview" : "📄 Text Preview"}</p>
              <ContentRenderer content={newFileContent} />
            </div>
          )}
          <button style={s.primaryBtn} onClick={createTextFile}>＋ Save File</button>
        </div>
      )}

      {/* ── Upload form ── */}
      {tab === "upload" && (
        <div style={s.formBox}>
          <div style={s.uploadNotice}>
            <strong>Allowed:</strong> Images (JPG, PNG, GIF, WEBP, SVG, BMP), JSON, TXT &nbsp;·&nbsp;
            <strong>Max per file:</strong> 900 KB &nbsp;·&nbsp;
            <strong>Multiple files supported</strong>
          </div>

          {/* Drop zone */}
          <div
            style={s.dropZone}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <p style={{ margin: 0, fontSize: 32 }}>📎</p>
            <p style={{ margin: "6px 0 0", color: "#555", fontWeight: 600 }}>Click to choose files or drag & drop here</p>
            <p style={{ margin: "4px 0 0", color: "#bbb", fontSize: 12 }}>Images · JSON · TXT — up to 900 KB each</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.json,.txt,.crt,.key,.dfu,.dnl.dfu,.mnt,.py"
            style={{ display: "none" }}
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          {/* Validation errors */}
          {queueErrors.length > 0 && (
            <div style={s.uploadError}>
              {queueErrors.map((e, i) => <div key={i}>⚠️ {e}</div>)}
              <button style={{ marginTop: 6, fontSize: 11, background: "none", border: "none", color: "#c62828", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => setQueueErrors([])}>Dismiss</button>
            </div>
          )}

          {/* Queue list */}
          {queue.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#777", fontWeight: 600 }}>
                  {queue.length} file{queue.length !== 1 ? "s" : ""} queued
                  {doneCount > 0 && ` · ${doneCount} saved`}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  {doneCount > 0 && (
                    <button style={{ fontSize: 12, background: "none", border: "none", color: "#888", cursor: "pointer", textDecoration: "underline" }}
                      onClick={clearDoneQueue}>Clear done</button>
                  )}
                  {pendingCount > 0 && (
                    <button style={{ fontSize: 12, background: "none", border: "none", color: "#e53935", cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => setQueue([])}>Clear all</button>
                  )}
                </div>
              </div>
              {queue.map((item) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromQueue(item.id)}
                  onRename={(name) => renameInQueue(item.id, name)}
                />
              ))}
            </div>
          )}

          <button
            style={{ ...s.primaryBtn, ...(uploading || pendingCount === 0 ? s.btnDisabled : {}) }}
            onClick={handleUploadAll}
            disabled={uploading || pendingCount === 0}
          >
            {uploading ? "Saving…" : `⬆️ Upload ${pendingCount > 0 ? `${pendingCount} file${pendingCount !== 1 ? "s" : ""}` : ""}`}
          </button>
        </div>
      )}

      {/* ── Photos Grid ── */}
      {photos.length > 0 && (
        <>
          <p style={s.sectionLabel}>🖼️ PHOTOS ({photos.length})</p>
          <div style={s.photoGrid}>
            {photos.map((item) => (
              <div key={item.id} style={s.photoCell}>
                <img src={item.url} alt={item.name} style={s.thumb} onClick={() => setLightbox(item)} />
                <p style={s.photoName} title={item.name}>{item.name}</p>
                {item.size && <p style={s.photoSize}>{formatBytes(item.size)}</p>}
                <div style={s.photoActions}>
                  <button style={s.smBtn} title="View" onClick={() => setLightbox(item)}>🔍</button>
                  <button style={s.smBtn} title="Download" onClick={() => downloadFile(item.url, item.name)}>⬇️</button>
                  <CopyBtn text={item.url} btnStyle={s.smBtn} />
                  <button style={s.smBtnRed} title="Delete" onClick={() => requestDelete("photo", item)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Files List ── */}
      {otherFiles.length > 0 && (
        <>
          <p style={s.sectionLabel}>📄 FILES ({otherFiles.length})</p>
          {otherFiles.map((file) => (
            <div key={file.id} style={s.fileCard}>
              <div style={s.fileHeader}>
                {editFileNameId === file.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, marginRight: 8 }}>
                    <input style={s.inlineInput} value={editFileNameValue} autoFocus
                      onChange={(e) => setEditFileNameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveFileName(file.id); if (e.key === "Escape") setEditFileNameId(null); }} />
                    <button style={s.yesBtn} onClick={() => saveFileName(file.id)}>💾</button>
                    <button style={s.noBtn} onClick={() => setEditFileNameId(null)}>✖</button>
                  </div>
                ) : (
                  <span style={s.fileNameBtn} onClick={() => setOpenFileId(openFileId === file.id ? null : file.id)}>
                    {file.contentType === "table" ? "📊" : file.contentType === "json" ? "📋" : fileIcon(file.name)}{" "}
                    {file.name}
                    {file.size ? <span style={s.fileSize}> · {formatBytes(file.size)}</span> : null}
                    {file.contentType === "table" && <span style={s.tableTag}>TABLE</span>}
                    {file.contentType === "json"  && <span style={{ ...s.tableTag, color: "#e65100", backgroundColor: "#fff3e0" }}>JSON</span>}
                    {file.updatedAt && <span style={s.editedTag}>edited</span>}
                  </span>
                )}

                {editFileNameId !== file.id && (
                  <div style={s.rowBtns}>
                    <button style={s.iconBtn} title="Rename" onClick={() => { setEditFileNameId(file.id); setEditFileNameValue(file.name); setEditFileId(null); }}>🏷️</button>
                    {file.type === "text" && (
                      <>
                        <CopyBtn text={getCopyText(file)} />
                        <button style={{ ...s.iconBtn }} title="Download as file"
                          onClick={() => {
                            const blob = new Blob([file.content ?? ""], { type: "text/plain" });
                            downloadFile(URL.createObjectURL(blob), file.name);
                          }}>⬇️</button>
                        <button style={s.iconBtn} title="Edit content" onClick={() => { setEditFileId(file.id); setEditFileContent(file.content); setOpenFileId(file.id); setEditFileNameId(null); }}>✏️</button>
                      </>
                    )}
                    <button style={s.iconBtn} title="Delete" onClick={() => { setEditFileNameId(null); requestDelete("file", file); }}>🗑️</button>
                  </div>
                )}
              </div>

              {openFileId === file.id && file.type === "text" && (
                <div style={{ marginTop: 10 }}>
                  {editFileId === file.id ? (
                    <>
                      <div style={s.pasteHint}>💡 Paste Excel data for table, or type plain text</div>
                      <textarea style={{ ...s.textarea, marginTop: 4 }} value={editFileContent}
                        rows={6} autoFocus onChange={(e) => setEditFileContent(e.target.value)} />
                      {editFileContent.trim() && (
                        <div style={{ ...s.previewBox, marginTop: 8 }}>
                          <p style={s.previewLabel}>{parseTabData(editFileContent) ? "📊 Table Preview" : "📄 Text Preview"}</p>
                          <ContentRenderer content={editFileContent} fileName={file.name} />
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button style={s.yesBtn} onClick={() => saveEditFile(file.id)}>💾 Save</button>
                        <button style={s.noBtn} onClick={() => setEditFileId(null)}>✖ Cancel</button>
                      </div>
                    </>
                  ) : (
                    <ContentRenderer content={file.content} fileName={file.name} />
                  )}
                </div>
              )}

              {openFileId === file.id && file.type === "upload" && isVideo(file.name) && (
                <video src={file.url} controls style={{ width: "100%", marginTop: 10, borderRadius: 8 }} />
              )}
            </div>
          ))}
        </>
      )}

      {/* ── Empty State ── */}
      {childFolders.length === 0 && currentFiles.length === 0 && (
        <div style={s.emptyState}>
          <p style={{ fontSize: 48, margin: 0 }}>📭</p>
          <p style={{ color: "#aaa", marginTop: 8 }}>Empty. Create a folder or add a file above.</p>
        </div>
      )}
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────
const s = {
  page: { maxWidth: 1400, margin: "30px auto", padding: 20, fontFamily: "Arial, sans-serif" },
  breadcrumb: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, marginBottom: 16, backgroundColor: "#f5f5f5", padding: "10px 14px", borderRadius: 8 },
  crumb: { color: "#1976d2", cursor: "pointer", fontSize: 14, fontWeight: 500 },
  crumbWrap: { display: "flex", alignItems: "center" },
  crumbActive: { color: "#333", cursor: "default", fontWeight: 700 },
  sep: { color: "#bbb", margin: "0 4px" },
  newFolderRow: { display: "flex", gap: 10, marginBottom: 20, alignItems: "center" },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, marginBottom: 10, marginTop: 20, textTransform: "uppercase" },
  folderGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 8 },
  folderCard: { backgroundColor: "#fff8f0", border: "1px solid #ffe0b2", borderRadius: 12, overflow: "hidden" },
  folderCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 10px 4px" },
  folderCardName: { fontSize: 13, fontWeight: 600, color: "#333", padding: "2px 10px 4px", margin: 0, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  folderMeta: { fontSize: 11, color: "#aaa", padding: "0 10px 10px", margin: 0 },
  input: { flex: 1, padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  inlineInput: { flex: 1, padding: "6px 8px", borderRadius: 6, border: "1px solid #90caf9", fontSize: 13, boxSizing: "border-box", outline: "none" },
  addBtn: { padding: "8px 16px", backgroundColor: "#ff6d00", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap" },
  rowBtns: { display: "flex", gap: 4, flexShrink: 0, alignItems: "center" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 4px", borderRadius: 4 },
  tabs: { display: "flex", gap: 8, marginBottom: 12, alignItems: "center" },
  tab: { padding: "7px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  tabActive: { background: "#ff6d00", color: "#fff", border: "1px solid #ff6d00" },
  queueBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#fff", color: "#ff6d00", fontSize: 11, fontWeight: 700, padding: "0 4px" },
  formBox: { backgroundColor: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 },
  uploadNotice: { fontSize: 12, color: "#555", backgroundColor: "#e8f5e9", padding: "7px 12px", borderRadius: 6, border: "1px solid #c8e6c9" },
  uploadError: { fontSize: 13, color: "#c62828", backgroundColor: "#ffebee", padding: "8px 12px", borderRadius: 8, border: "1px solid #ffcdd2" },
  textarea: { width: "100%", padding: 10, fontSize: 14, borderRadius: 8, border: "1px solid #ccc", resize: "vertical", boxSizing: "border-box", fontFamily: "monospace" },
  primaryBtn: { marginTop: 4, padding: "8px 20px", backgroundColor: "#ff6d00", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, alignSelf: "flex-start" },
  btnDisabled: { backgroundColor: "#ccc", cursor: "not-allowed" },
  dropZone: { marginTop: 4, border: "2px dashed #ccc", borderRadius: 10, padding: "28px 16px", textAlign: "center", cursor: "pointer", backgroundColor: "#fff", transition: "border-color 0.2s" },
  pasteHint: { fontSize: 12, color: "#888", backgroundColor: "#e3f2fd", padding: "6px 10px", borderRadius: 6, border: "1px solid #bbdefb" },
  previewBox: { backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: 12 },
  previewLabel: { fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, margin: "0 0 8px", textTransform: "uppercase" },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 16 },
  photoCell: { borderRadius: 10, overflow: "hidden", border: "1px solid #e0e0e0", backgroundColor: "#fafafa" },
  thumb: { width: "100%", height: 120, objectFit: "cover", display: "block", cursor: "pointer" },
  photoName: { fontSize: 11, color: "#555", padding: "4px 8px 0", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  photoSize: { fontSize: 11, color: "#aaa", padding: "0 8px", margin: 0 },
  photoActions: { display: "flex", gap: 4, padding: "4px 8px 8px" },
  smBtn: { flex: 1, padding: "3px 0", background: "#f0f0f0", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, textAlign: "center" },
  smBtnRed: { flex: 1, padding: "3px 0", background: "#ffebee", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  fileCard: { backgroundColor: "#fafafa", border: "1px solid #e0e0e0", borderRadius: 10, padding: "12px 14px", marginBottom: 10 },
  fileHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  fileNameBtn: { fontSize: 14, fontWeight: 600, color: "#1976d2", cursor: "pointer", flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  fileSize: { fontSize: 11, color: "#aaa", fontWeight: 400 },
  tableTag: { fontSize: 10, color: "#1976d2", fontWeight: 700, backgroundColor: "#e3f2fd", padding: "1px 6px", borderRadius: 10 },
  editedTag: { fontSize: 10, color: "#ff6d00", fontWeight: 600, backgroundColor: "#fff3e0", padding: "1px 6px", borderRadius: 10 },
  emptyState: { textAlign: "center", padding: "60px 20px", color: "#aaa" },
  yesBtn: { padding: "5px 14px", backgroundColor: "#43a047", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  noBtn: { padding: "5px 14px", backgroundColor: "#e53935", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  lightbox: { position: "relative", backgroundColor: "#fff", borderRadius: 12, padding: 16, maxWidth: "90vw", maxHeight: "90vh", overflow: "auto", textAlign: "center" },
  lbClose: { position: "absolute", top: 10, right: 12, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#555" },
  lbImg: { maxWidth: "80vw", maxHeight: "75vh", borderRadius: 8, display: "block", margin: "0 auto" },
  lbName: { marginTop: 10, fontSize: 13, color: "#666" },
  lbFile: { padding: 40, textAlign: "center" },
  authModal: { backgroundColor: "#fff", borderRadius: 14, padding: 28, width: 380, maxWidth: "90vw", boxShadow: "0 8px 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", gap: 12 },
  authIconWrap: { textAlign: "center" },
  authIcon: { fontSize: 40 },
  authTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: "#333", textAlign: "center" },
  authSubtitle: { margin: 0, fontSize: 13, color: "#888", textAlign: "center", lineHeight: 1.5 },
  authLabel: { fontSize: 13, fontWeight: 600, color: "#555", marginBottom: -4 },
  authInput: { padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  authError: { fontSize: 13, color: "#c62828", backgroundColor: "#ffebee", padding: "8px 12px", borderRadius: 8, border: "1px solid #ffcdd2", display: "flex", alignItems: "center", gap: 6 },
  authBtns: { display: "flex", gap: 10, marginTop: 4 },
  authCancelBtn: { flex: 1, padding: "10px 0", backgroundColor: "#f5f5f5", color: "#555", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 },
  authConfirmBtn: { flex: 1, padding: "10px 0", backgroundColor: "#e53935", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 },
};
