import { useState, useEffect, useRef } from "react";
import { db, storage } from "../../firebase/config";
import {
  collection, addDoc, onSnapshot, orderBy,
  query, serverTimestamp, deleteDoc, updateDoc, doc,
} from "firebase/firestore";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from "firebase/storage";

// ── helpers ───────────────────────────────────────────────────────
const isImage = (n = "") => /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(n);
const isVideo = (n = "") => /\.(mp4|webm|ogg|mov)$/i.test(n);
const formatBytes = (b) => {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};
const fileIcon = (n = "") => {
  if (isImage(n)) return "🖼️";
  if (isVideo(n)) return "🎬";
  if (/\.pdf$/i.test(n)) return "📕";
  if (/\.(doc|docx)$/i.test(n)) return "📘";
  if (/\.(xls|xlsx)$/i.test(n)) return "📗";
  if (/\.(zip|rar|7z)$/i.test(n)) return "🗜️";
  return "📄";
};

// ── detect & parse tab-separated (Excel copy) data ───────────────
const parseTabData = (text) => {
  if (!text || !text.includes("\t")) return null;
  const rows = text.trim().split("\n").map((r) => r.split("\t"));
  if (rows.length < 1 || rows[0].length < 2) return null;
  return rows;
};

// ── render content: table or plain text ──────────────────────────
function ContentRenderer({ content }) {
  const rows = parseTabData(content);
  if (rows) {
    const headers = rows[0];
    const body = rows.slice(1);
    return (
      <div style={{ overflowX: "auto", marginTop: 4 }}>
        <table style={ts.table}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={ts.th}>{h || " "}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} style={ri % 2 === 0 ? ts.trEven : ts.trOdd}>
                {headers.map((_, ci) => (
                  <td key={ci} style={ts.td}>{row[ci] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p style={ts.hint}>📊 {rows.length - 1} rows × {headers.length} columns</p>
      </div>
    );
  }
  // plain text
  return <pre style={ts.pre}>{content}</pre>;
}

// table styles
const ts = {
  table: {
    borderCollapse: "collapse",
    width: "100%",
    fontSize: 13,
    fontFamily: "Arial, sans-serif",
  },
  th: {
    backgroundColor: "#1976d2",
    color: "#fff",
    padding: "8px 12px",
    textAlign: "left",
    fontWeight: 600,
    border: "1px solid #1565c0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "7px 12px",
    border: "1px solid #e0e0e0",
    color: "#333",
    whiteSpace: "nowrap",
  },
  trEven: { backgroundColor: "#fff" },
  trOdd: { backgroundColor: "#f3f8ff" },
  pre: {
    margin: 0,
    fontSize: 14,
    fontFamily: "Arial, sans-serif",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#333",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 6,
  },
  hint: {
    margin: "6px 0 0",
    fontSize: 11,
    color: "#aaa",
  },
};

export default function GeneratePhotos() {
  // ── state ─────────────────────────────────────────────────────
  const [allFolders, setAllFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);

  const [newFolderName, setNewFolderName] = useState("");
  const [editFolderId, setEditFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [deleteFolderId, setDeleteFolderId] = useState(null);

  const [tab, setTab] = useState("text");
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [pastePreview, setPastePreview] = useState(null); // parsed rows or null

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [editFileId, setEditFileId] = useState(null);
  const [editFileContent, setEditFileContent] = useState("");
  const [deleteFileId, setDeleteFileId] = useState(null);
  const [openFileId, setOpenFileId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const fileInputRef = useRef();
const [editFileNameId, setEditFileNameId] = useState(null);
const [editFileNameValue, setEditFileNameValue] = useState("");
  // ── fetch folders ─────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "folders"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) =>
      setAllFolders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  // ── fetch files ───────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "files"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) =>
      setAllFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const childFolders = allFolders.filter((f) => (f.parentId ?? null) === currentFolderId);
  const currentFiles = allFiles.filter((f) => (f.folderId ?? null) === currentFolderId);

  const openFolder = (folder) => {
    setBreadcrumb((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
    resetUI();
  };

  const goToBreadcrumb = (index) => {
    if (index === -1) { setBreadcrumb([]); setCurrentFolderId(null); }
    else { setBreadcrumb((prev) => prev.slice(0, index + 1)); setCurrentFolderId(breadcrumb[index].id); }
    resetUI();
  };

  const resetUI = () => {
    setEditFileId(null); setDeleteFileId(null); setOpenFileId(null);
    setEditFolderId(null); setDeleteFolderId(null);
  };

  // ── handle textarea paste / change ───────────────────────────
  const handleContentChange = (val) => {
    setNewFileContent(val);
    setPastePreview(parseTabData(val));
  };

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
    for (const file of filesInFolder) {
      if (file.storagePath) {
        try { await deleteObject(ref(storage, file.storagePath)); } catch (_) {}
      }
      await deleteDoc(doc(db, "files", file.id));
    }
    await deleteDoc(doc(db, "folders", folderId));
  };

  const handleDeleteFolder = async (id) => {
    await deleteFolderRecursive(id);
    if (currentFolderId === id) {
      const parent = breadcrumb[breadcrumb.length - 2];
      setBreadcrumb((prev) => prev.slice(0, -1));
      setCurrentFolderId(parent?.id ?? null);
    }
    setDeleteFolderId(null);
  };
const saveFileName = async (id) => {
  if (!editFileNameValue.trim()) return alert("File name cannot be empty!");
  const isTable = !!parseTabData(allFiles.find(f => f.id === id)?.content || "");
  await updateDoc(doc(db, "files", id), {
    name: editFileNameValue.trim(),
    updatedAt: serverTimestamp(),
  });
  setEditFileNameId(null);
  setEditFileNameValue("");
};
  // ── text file CRUD ────────────────────────────────────────────
  const createTextFile = async () => {
    if (!newFileName.trim()) return alert("Enter a file name!");
    if (!newFileContent.trim()) return alert("Enter some content!");
    const isTable = !!parseTabData(newFileContent);
    await addDoc(collection(db, "files"), {
      name: newFileName.trim(),
      content: newFileContent.trim(),
      contentType: isTable ? "table" : "text", // save detected type
      type: "text",
      folderId: currentFolderId,
      createdAt: serverTimestamp(),
    });
    setNewFileName(""); setNewFileContent(""); setPastePreview(null);
  };

  // ── upload ────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadFile) return alert("Choose a file first!");
    const name = uploadName.trim() || uploadFile.name;
    setUploading(true); setProgress(0);
    const storageRef = ref(storage, `files/${currentFolderId ?? "root"}/${Date.now()}_${uploadFile.name}`);
    const task = uploadBytesResumable(storageRef, uploadFile);
    task.on(
      "state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { alert("Upload failed: " + err.message); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await addDoc(collection(db, "files"), {
          name, url, storagePath: storageRef.fullPath,
          fileType: uploadFile.type, size: uploadFile.size,
          type: "upload", folderId: currentFolderId, createdAt: serverTimestamp(),
        });
        setUploadFile(null); setUploadName(""); setProgress(0); setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    );
  };

  const deleteFile = async (file) => {
    if (file.storagePath) {
      try { await deleteObject(ref(storage, file.storagePath)); } catch (_) {}
    }
    await deleteDoc(doc(db, "files", file.id));
    setDeleteFileId(null);
    if (openFileId === file.id) setOpenFileId(null);
  };

  const saveEditFile = async (id) => {
    if (!editFileContent.trim()) return;
    const isTable = !!parseTabData(editFileContent);
    await updateDoc(doc(db, "files", id), {
      content: editFileContent.trim(),
      contentType: isTable ? "table" : "text",
      updatedAt: serverTimestamp(),
    });
    setEditFileId(null);
  };

  const photos = currentFiles.filter((f) => f.type === "upload" && isImage(f.name));
  const otherFiles = currentFiles.filter((f) => !(f.type === "upload" && isImage(f.name)));

  return (
    <div style={s.page}>

      {/* Lightbox */}
      {lightbox && (
        <div style={s.overlay} onClick={() => setLightbox(null)}>
          <div style={s.lightbox} onClick={(e) => e.stopPropagation()}>
            <button style={s.lbClose} onClick={() => setLightbox(null)}>✕</button>
            {isImage(lightbox.name)
              ? <img src={lightbox.url} alt={lightbox.name} style={s.lbImg} />
              : isVideo(lightbox.name)
              ? <video src={lightbox.url} controls style={s.lbImg} />
              : <div style={s.lbFile}><p style={{ fontSize: 48 }}>{fileIcon(lightbox.name)}</p><p>{lightbox.name}</p><a href={lightbox.url} target="_blank" rel="noreferrer" style={s.dlBtn}>⬇️ Download</a></div>
            }
            <p style={s.lbName}>{lightbox.name}</p>
          </div>
        </div>
      )}

      

      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <span style={s.crumb} onClick={() => goToBreadcrumb(-1)}>🏠 Home</span>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.id} style={s.crumbWrap}>
            <span style={s.sep}> / </span>
            <span style={{ ...s.crumb, ...(i === breadcrumb.length - 1 ? s.crumbActive : {}) }} onClick={() => goToBreadcrumb(i)}>{crumb.name}</span>
          </span>
        ))}
      </div>

      {/* New folder */}
      <div style={s.newFolderRow}>
        <input style={s.input} placeholder="New folder name…" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createFolder()} />
        <button style={s.addBtn} onClick={createFolder}>📁 New Folder</button>
      </div>

      {/* Folders grid */}
      {childFolders.length > 0 && (
        <>
          <p style={s.sectionLabel}>FOLDERS</p>
          <div style={s.folderGrid}>
            {childFolders.map((folder) => (
              <div key={folder.id} style={s.folderCard}>
                <div style={s.folderCardTop}>
                  <span style={{ fontSize: 36, cursor: "pointer" }} onClick={() => openFolder(folder)}>📁</span>
                  <div style={s.rowBtns}>
                    <button style={s.iconBtn} onClick={() => { setEditFolderId(folder.id); setEditFolderName(folder.name); setDeleteFolderId(null); }}>✏️</button>
                    <button style={s.iconBtn} onClick={() => { setDeleteFolderId(folder.id); setEditFolderId(null); }}>🗑️</button>
                  </div>
                </div>
                {editFolderId === folder.id ? (
                  <div style={{ padding: "0 8px 8px" }}>
                    <input style={s.inlineInput} value={editFolderName} autoFocus onChange={(e) => setEditFolderName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveFolder(folder.id); if (e.key === "Escape") setEditFolderId(null); }} />
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button style={s.yesBtn} onClick={() => saveFolder(folder.id)}>💾</button>
                      <button style={s.noBtn} onClick={() => setEditFolderId(null)}>✖</button>
                    </div>
                  </div>
                ) : (
                  <p style={s.folderCardName} onClick={() => openFolder(folder)}>{folder.name}</p>
                )}
                <p style={s.folderMeta}>
                  {allFolders.filter((f) => f.parentId === folder.id).length} folder(s) · {allFiles.filter((f) => f.folderId === folder.id).length} file(s)
                </p>
                {deleteFolderId === folder.id && (
                  <div style={{ ...s.confirmBox, margin: "0 8px 8px" }}>
                    <span style={s.confirmText}>Delete "{folder.name}" and all contents?</span>
                    <div style={s.confirmBtns}>
                      <button style={s.yesBtn} onClick={() => handleDeleteFolder(folder.id)}>✅ Yes</button>
                      <button style={s.noBtn} onClick={() => setDeleteFolderId(null)}>❌ No</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add file tabs */}
      {/* <p style={s.sectionLabel}>ADD FILE</p>
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(tab === "text" ? s.tabActive : {}) }} onClick={() => setTab("text")}>📝 Text / Table</button>
        <button style={{ ...s.tab, ...(tab === "upload" ? s.tabActive : {}) }} onClick={() => setTab("upload")}>📎 Upload File / Photo</button>
      </div> */}

      {tab === "text" && (
        <div style={s.formBox}>
          <input style={s.input} placeholder="File name…" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />

        
          <textarea
            style={{ ...ts.pre, ...s.textarea, marginTop: 0 }}
            placeholder={"Enter data here..."}
            value={newFileContent}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={6}
          />

          {/* Live preview */}
          {newFileContent.trim() && (
            <div style={s.previewBox}>
              <p style={s.previewLabel}>
                {pastePreview ? "📊 Table Preview" : "📄 Text Preview"}
              </p>
              <ContentRenderer content={newFileContent} />
            </div>
          )}

          <button style={s.primaryBtn} onClick={createTextFile}>＋ Save File</button>
        </div>
      )}

      {tab === "upload" && (
        <div style={s.formBox}>
          <input style={s.input} placeholder="Display name (optional)…" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
          <div style={s.dropZone} onClick={() => fileInputRef.current?.click()}>
            {uploadFile
              ? <div><p style={{ margin: 0, fontWeight: 600 }}>{uploadFile.name}</p><p style={{ margin: "4px 0 0", color: "#999", fontSize: 13 }}>{formatBytes(uploadFile.size)}</p></div>
              : <div><p style={{ margin: 0, fontSize: 32 }}>📎</p><p style={{ margin: "6px 0 0", color: "#888" }}>Click to choose a file or photo</p></div>
            }
          </div>
          <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={(e) => setUploadFile(e.target.files[0] || null)} />
          {uploading && (
            <div style={s.progressWrap}>
              <div style={{ ...s.progressBar, width: `${progress}%` }} />
              <span style={s.progressText}>{progress}%</span>
            </div>
          )}
          <button style={{ ...s.primaryBtn, ...(uploading ? s.btnDisabled : {}) }} onClick={handleUpload} disabled={uploading}>
            {uploading ? `Uploading… ${progress}%` : "⬆️ Upload"}
          </button>
        </div>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <>
          <p style={s.sectionLabel}>🖼️ PHOTOS</p>
          <div style={s.photoGrid}>
            {photos.map((item) => (
              <div key={item.id} style={s.photoCell}>
                <img src={item.url} alt={item.name} style={s.thumb} onClick={() => setLightbox(item)} />
                <p style={s.photoName}>{item.name}</p>
                <div style={s.photoActions}>
                  <button style={s.smBtn} onClick={() => setLightbox(item)}>🔍</button>
                  <a href={item.url} target="_blank" rel="noreferrer" style={s.smBtnA}>⬇️</a>
                  <button style={s.smBtnRed} onClick={() => setDeleteFileId(item.id)}>🗑️</button>
                </div>
                {deleteFileId === item.id && (
                  <div style={s.confirmBox}>
                    <span style={s.confirmText}>Delete?</span>
                    <div style={s.confirmBtns}>
                      <button style={s.yesBtn} onClick={() => deleteFile(item)}>✅ Yes</button>
                      <button style={s.noBtn} onClick={() => setDeleteFileId(null)}>❌ No</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Files */}
      {otherFiles.length > 0 && (
        <>
          <p style={s.sectionLabel}>📄 FILES</p>
          {otherFiles.map((file) => (
            <div key={file.id} style={s.fileCard}>
            <div style={s.fileHeader}>
  {/* ── File name: view or inline edit ── */}
  {editFileNameId === file.id ? (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, marginRight: 8 }}>
      <input
        style={s.inlineInput}
        value={editFileNameValue}
        autoFocus
        onChange={(e) => setEditFileNameValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveFileName(file.id);
          if (e.key === "Escape") setEditFileNameId(null);
        }}
      />
      <button style={s.yesBtn} onClick={() => saveFileName(file.id)}>💾</button>
      <button style={s.noBtn} onClick={() => setEditFileNameId(null)}>✖</button>
    </div>
  ) : (
    <span style={s.fileNameBtn} onClick={() => setOpenFileId(openFileId === file.id ? null : file.id)}>
      {file.contentType === "table" ? "📊" : fileIcon(file.name)} {file.name}
      {file.size ? <span style={s.fileSize}> · {formatBytes(file.size)}</span> : null}
      {file.contentType === "table" && <span style={s.tableTag}>TABLE</span>}
      {file.updatedAt && <span style={s.editedTag}>edited</span>}
    </span>
  )}

  {/* ── Action buttons ── */}
  {editFileNameId !== file.id && (
    <div style={s.rowBtns}>
      {/* Rename file name button */}
      <button
        style={s.iconBtn}
        title="Rename file"
        onClick={() => {
          setEditFileNameId(file.id);
          setEditFileNameValue(file.name);
          setEditFileId(null);
          setDeleteFileId(null);
        }}
      >🏷️</button>

      {/* Edit content button (text files only) */}
      {file.type === "text" && (
        <button
          style={s.iconBtn}
          title="Edit content"
          onClick={() => {
            setEditFileId(file.id);
            setEditFileContent(file.content);
            setOpenFileId(file.id);
            setDeleteFileId(null);
            setEditFileNameId(null);
          }}
        >✏️</button>
      )}

      {/* Download (upload files only) */}
      {file.type === "upload" && (
        <a href={file.url} target="_blank" rel="noreferrer" style={s.iconBtnA}>⬇️</a>
      )}

      {/* Delete */}
      <button style={s.iconBtn} onClick={() => { setDeleteFileId(file.id); setEditFileNameId(null); }}>🗑️</button>
    </div>
  )}
</div>

              {/* View / Edit */}
              {openFileId === file.id && file.type === "text" && (
                <div style={{ marginTop: 10 }}>
                  {editFileId === file.id ? (
                    <>
                      <div style={s.pasteHint}>💡 Paste Excel data for table, or type plain text</div>
                      <textarea
                        style={{ ...s.textarea, marginTop: 4 }}
                        value={editFileContent}
                        rows={6}
                        autoFocus
                        onChange={(e) => setEditFileContent(e.target.value)}
                      />
                      {/* edit preview */}
                      {editFileContent.trim() && (
                        <div style={{ ...s.previewBox, marginTop: 8 }}>
                          <p style={s.previewLabel}>
                            {parseTabData(editFileContent) ? "📊 Table Preview" : "📄 Text Preview"}
                          </p>
                          <ContentRenderer content={editFileContent} />
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button style={s.yesBtn} onClick={() => saveEditFile(file.id)}>💾 Save</button>
                        <button style={s.noBtn} onClick={() => setEditFileId(null)}>✖ Cancel</button>
                      </div>
                    </>
                  ) : (
                    <ContentRenderer content={file.content} />
                  )}
                </div>
              )}

              {openFileId === file.id && file.type === "upload" && isVideo(file.name) && (
                <video src={file.url} controls style={{ width: "100%", marginTop: 10, borderRadius: 8 }} />
              )}

              {deleteFileId === file.id && (
                <div style={s.confirmBox}>
                  <span style={s.confirmText}>Delete "{file.name}"?</span>
                  <div style={s.confirmBtns}>
                    <button style={s.yesBtn} onClick={() => deleteFile(file)}>✅ Yes</button>
                    <button style={s.noBtn} onClick={() => setDeleteFileId(null)}>❌ No</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

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
  heading: { fontSize: 24, marginBottom: 16, color: "#333" },
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
  inlineInput: { width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #90caf9", fontSize: 13, boxSizing: "border-box" },
  addBtn: { padding: "8px 16px", backgroundColor: "#ff6d00", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap" },
  rowBtns: { display: "flex", gap: 4, flexShrink: 0 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 4px", borderRadius: 4 },
  iconBtnA: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 4px", borderRadius: 4, textDecoration: "none" },
  tabs: { display: "flex", gap: 8, marginBottom: 12 },
  tab: { padding: "7px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#f5f5f5", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  tabActive: { background: "#ff6d00", color: "#fff", border: "1px solid #ff6d00" },
  formBox: { backgroundColor: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 },
  textarea: { width: "100%", padding: 10, fontSize: 14, borderRadius: 8, border: "1px solid #ccc", resize: "vertical", boxSizing: "border-box", fontFamily: "monospace" },
  primaryBtn: { marginTop: 4, padding: "8px 20px", backgroundColor: "#ff6d00", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, alignSelf: "flex-start" },
  btnDisabled: { backgroundColor: "#ccc", cursor: "not-allowed" },
  dropZone: { marginTop: 10, border: "2px dashed #ccc", borderRadius: 10, padding: "24px 16px", textAlign: "center", cursor: "pointer", backgroundColor: "#fff" },
  progressWrap: { position: "relative", height: 22, backgroundColor: "#eee", borderRadius: 10, marginTop: 10, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: "#ff6d00", borderRadius: 10, transition: "width 0.3s" },
  progressText: { position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", fontSize: 12, fontWeight: 700, color: "#333" },
  pasteHint: { fontSize: 12, color: "#888", backgroundColor: "#e3f2fd", padding: "6px 10px", borderRadius: 6, border: "1px solid #bbdefb" },
  previewBox: { backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: 12 },
  previewLabel: { fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, margin: "0 0 8px", textTransform: "uppercase" },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 16 },
  photoCell: { borderRadius: 10, overflow: "hidden", border: "1px solid #e0e0e0", backgroundColor: "#fafafa" },
  thumb: { width: "100%", height: 120, objectFit: "cover", display: "block", cursor: "pointer" },
  photoName: { fontSize: 11, color: "#555", padding: "4px 8px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  photoActions: { display: "flex", gap: 4, padding: "4px 8px 8px" },
  smBtn: { flex: 1, padding: "3px 0", background: "#f0f0f0", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  smBtnA: { flex: 1, padding: "3px 0", background: "#f0f0f0", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, textAlign: "center", textDecoration: "none" },
  smBtnRed: { flex: 1, padding: "3px 0", background: "#ffebee", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  fileCard: { backgroundColor: "#fafafa", border: "1px solid #e0e0e0", borderRadius: 10, padding: "12px 14px", marginBottom: 10 },
  fileHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  fileNameBtn: { fontSize: 14, fontWeight: 600, color: "#1976d2", cursor: "pointer", flex: 1, display: "flex", alignItems: "center", gap: 6 },
  fileSize: { fontSize: 11, color: "#aaa", fontWeight: 400 },
  tableTag: { fontSize: 10, color: "#1976d2", fontWeight: 700, backgroundColor: "#e3f2fd", padding: "1px 6px", borderRadius: 10 },
  editedTag: { fontSize: 10, color: "#ff6d00", fontWeight: 600, backgroundColor: "#fff3e0", padding: "1px 6px", borderRadius: 10 },
  emptyState: { textAlign: "center", padding: "60px 20px", color: "#aaa" },
  confirmBox: { backgroundColor: "#fff3e0", border: "1px solid #ffb74d", borderRadius: 8, padding: "10px 14px", marginTop: 6 },
  confirmText: { fontSize: 13, color: "#e65100", display: "block", marginBottom: 8 },
  confirmBtns: { display: "flex", gap: 8 },
  yesBtn: { padding: "5px 14px", backgroundColor: "#43a047", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  noBtn: { padding: "5px 14px", backgroundColor: "#e53935", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  lightbox: { position: "relative", backgroundColor: "#fff", borderRadius: 12, padding: 16, maxWidth: "90vw", maxHeight: "90vh", overflow: "auto", textAlign: "center" },
  lbClose: { position: "absolute", top: 10, right: 12, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#555" },
  lbImg: { maxWidth: "80vw", maxHeight: "75vh", borderRadius: 8, display: "block", margin: "0 auto" },
  lbName: { marginTop: 10, fontSize: 13, color: "#666" },
  lbFile: { padding: 40, textAlign: "center" },
  inlineInput: {
  flex: 1,
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #90caf9",
  fontSize: 13,
  boxSizing: "border-box",
  outline: "none",
},
  dlBtn: { display: "inline-block", marginTop: 12, padding: "8px 20px", backgroundColor: "#1976d2", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14 },
};